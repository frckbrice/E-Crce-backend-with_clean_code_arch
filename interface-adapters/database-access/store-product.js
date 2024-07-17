//create a product with color enumeration, categoryas reference to categories
//collection, rating as an array of objects with reference to ratings collection, also a brand enumeration 

const { ObjectId, DBRef } = require("mongodb");
const MongoClient = require("mongodb").MongoClient;


async function createProduct(productData, dbconnection, logEvents) {

    console.log("from createProduct DB handler");
    const db = await dbconnection();
    try {
        const newProduct = await db.collection('products').insertOne({ ...productData });
        return newProduct
    } catch (error) {
        console.log("Error from product DB handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.ReferenceError || error.TypeError}\t${error.message}`,
            "product.log"
        );
    }
}

// find one product from DB
const findOneProduct = async ({ productId, dbconnection }) => {

    const db = await dbconnection();
    try {
        const product = await db.collection('products').findOne({ _id: new ObjectId(productId) }, {
            projection: {
                _id: 1, title: 1, description: 1, price: 1, category: 1, brand: 1, inventory: 1, creationDate: 1, expirationDate: 1, origin: 1, variations: 1, salePrice: 1, slug: 1, totalRatings: 1, totalReviews: 1, totalSales: 1, rateAverage: 1,
                lastModified: 1,
                instock: 1
            }
        });
        if (!product) {
            console.log("No product found");
            return null;
        }

        const { _id, ...rest } = product;
        const id = _id.toString()
        const isDeleted = delete product._id;

        if (isDeleted) {
            return { id, ...product };
        }
        // return rest;
    } catch (error) {
        console.log("Error from product DB handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.ReferenceError || error.TypeError}\t${error.message}`,
            "product.log"
        );
        return null;
    }
}

// find all products from the database 
const findAllProducts = async ({ dbconnection, logEvents, ...filterOptions }) => {
    const { category, minPrice, maxPrice, page, perPage, searchTerm } = filterOptions;

    //TODO: id necessary add limiting fields. this affect the projection props

    const filter = {};
    if (category) filter.category = category;
    if (minPrice) filter.price = { $gte: parseFloat(minPrice) };
    if (maxPrice) filter.price = { $lte: parseFloat(maxPrice) };
    if (searchTerm) filter.$text = { $search: searchTerm };

    const projection = {
        _id: 0, title: 1, description: 1, price: 1, category: 1, brand: 1, creationDate: 1, expirationDate: 1, origin: 1, variations: 1, salePrice: 1, slug: 1,
        lastModified: 1,
        instock: 1
    };

    const offset = (page - 1) * perPage;
    const db = await dbconnection();

    try {
        const allProducts = await db
            .collection('products')
            .find(filter)
            .project(projection)
            .skip(offset)
            .limit(Number(perPage))
            .toArray();


        const totalProducts = await db
            .collection('products').countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / perPage);
        const products = allProducts.map(product => ({ ...product, id: product._id.toString() }));

        return {
            data: products,
            totalProducts,
            totalPages,
            page,
            perPage
        };
    } catch (error) {
        console.log("Error from product DB handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.ReferenceError || error.TypeError}\t${error.message}`,
            "product.log"
        );
        return [];
    }
};

// update existing product
const updateProduct = async ({ productId, productData, dbconnection, logEvents }) => {

    const db = await dbconnection();
    try {
        const updatedProduct = await db.collection('products').findOneAndUpdate(
            { _id: new ObjectId(productId) },
            { $set: { ...productData } },
            { returnOriginal: false, }
        );
        return updatedProduct.value;
    } catch (error) {
        console.log("Error from product DB handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.ReferenceError || error.TypeError}\t${error.message}`,
            "product.log"
        );
        return null;
    }
}

// delete product from DB
const deleteProduct = async ({ productId, dbconnection, logEvents }) => {
    const db = await dbconnection();
    try {
        const result = await db.collection('products').deleteOne({ _id: productId });
        return result.deletedCount > 0 ? { id: productId } : null;
    } catch (error) {
        console.log("Error from product DB handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.ReferenceError || error.TypeError}\t${error.message}`,
            "product.log"
        );
        return null;
    }
}

// update product use case handler
const updatedProduct = async ({ productId, dbconnection, logEvents, ...productData }) => {

    const db = await dbconnection();
    try {
        const updatedProduct = await db.collection('products').findOneAndUpdate(
            { _id: new ObjectId(productId) },
            { $set: { ...productData } },
            { returnOriginal: false, }
        );

        return updatedProduct;

    } catch (error) {
        console.log("Error from product DB handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.ReferenceError || error.TypeError}\t${error.message}`,
            "productDBErr.log"
        );
        throw new Error(error.message || error.ReferenceError);
    }
}

// create a raiting document and update product document alongside

const rateProduct = async ({ logEvents, ...ratingModel }) => {

    const client = new MongoClient(process.env.DB_URI);
    const session = client.startSession();

    /* start a transaction session */
    const transactionOptions = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
    };

    const lastModified = Date.now();
    /* set up filter */
    const filter = { _id: new ObjectId(ratingModel.productId) };
    try {
        return await session.withTransaction(async () => {

            /* initialize db collections. clientSession and client MUST be in the same session */
            const productCollection = client.db("digital-market-place-updates").collection("products");
            const ratingCollection = client.db("digital-market-place-updates").collection("ratings");

            // check if the product exists
            const existingProduct = await productCollection.findOne({ _id: new ObjectId(ratingModel.productId) }, { session });
            if (!existingProduct) {// cannot rate ghost product.
                session.abortTransaction();
                return {
                    error: {
                        code: 404,
                        message: "Product not found!",
                    }
                };
            }

            /* find first if this user has already rate this existing product*/
            const existingRating = await ratingCollection.findOne({ userId: ratingModel.userId, productId: ratingModel.productId }, { session });
            if (existingRating) {
                session.abortTransaction();
                return {
                    error: {
                        code: 409,
                        message: "You have already rated this product!",
                    }
                };
            }

            /* create a new rating document */
            const newRating = await ratingCollection.insertOne(ratingModel, { session });
            const { totalRatings } = existingProduct;
            const totalReviews = totalRatings?.reduce((sum, rating) => sum + rating, 0) || 0;
            const newAverage = totalReviews ? totalRatings?.reduce((sum, rating, index) => sum + rating * (index + 1), 0) / totalReviews : existingProduct.rateAverage;

            /* increase the new rating value in the totalRatings array */
            for (let index = 0; index < 5; index++) {
                if (ratingModel.ratingValue === (index + 1)) {
                    totalRatings[index] = totalRatings[index] + 1;
                }
            }
            const updateProduct = {
                rateAverage: newAverage,
                lastModified,
                totalRatings
            }

            /* update the product document */
            const updatedProduct = await productCollection.findOneAndUpdate(
                filter,
                {
                    $push: {
                        latestRating: new DBRef("ratings", newRating.insertedId),
                    },
                    $inc: {
                        totalReviews: 1,
                    },
                    $set: updateProduct
                },
                { session }
            );
            // await session.commitTransaction(); NO NEED TO EXPLICITELY DO IT, IT'S DONE BEHIND THE SCENE BY MONGODB DRIVER
            return { updatedProduct, newRating };
        }, transactionOptions);

    } catch (error) {
        console.log("Error from product DB handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.ReferenceError || error.TypeError}\t${error.message}`,
            "productDBErr.log"
        );
        throw new Error(error.message || error.ReferenceError || error.TypeError);
    } finally {
        // End the session
        session.endSession();
        await client.close();
    }
}

module.exports = ({ dbconnection, logEvents }) => {

    return Object.freeze({
        createProductDbHandler: async (productData) => createProduct(productData, dbconnection, logEvents),
        findOneProductDbHandler: async ({ productId }) => findOneProduct({ productId, dbconnection, logEvents }),
        findAllProductsDbHandler: async (filterOptions) => findAllProducts({ dbconnection, logEvents, ...filterOptions }),
        updateProductDbHandler: async ({ productId, productData }) => updateProduct({ productId, productData, dbconnection, logEvents }),
        deleteProductDbHandler: async ({ productId }) => deleteProduct({ productId, dbconnection, logEvents }),
        updateProductDbHandler: async ({ productId, ...productData }) => updatedProduct({ productId, dbconnection, logEvents, ...productData }),
        rateProductDbHandler: async (ratingModel) => rateProduct({ logEvents, ...ratingModel }),
    })
}
