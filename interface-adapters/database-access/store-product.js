//create a product with color enumeration, categoryas reference to categories
//collection, rating as an array of objects with reference to ratings collection, also a brand enumeration 


async function createProduct(productData, dbconnection, logEvents) {

    console.log("from createProduct DB handler");
    const db = await dbconnection();
    try {
        const newProduct = await db.collection('products').insertOne({ ...productData });
        return newProduct
    } catch (error) {
        console.log("Error from product DB handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.name}\t${error.message}`,
            "product.log"
        );
    }
}

// find one product from DB
const findOneProduct = async ({ productId, dbconnection }) => {

    const db = await dbconnection();
    try {
        const product = await db.collection('products').findOne({ _id: ObjectId(productId) }, {
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
        console.log("\n\nproduct before deleting: \n\n", product);
        const { _id, ...rest } = product;
        const isDeleted = delete product._id;
        console.log("\n\nafter deleting product = : ", product);
        console.log("\n\n rest after deleting: ", rest);

        if (isDeleted) {
            console.log("product deleted and returned ");
            return product;
        }
        console.log("product NOT deleted and REST isreturned ");
        return rest;
    } catch (error) {
        console.log("Error from product DB handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.name}\t${error.message}`,
            "product.log"
        );
        return null;
    }
}

// find all products from the database 
const findAllProducts = async ({ dbconnection }) => {

    const db = dbconnection();

    try {
        const allProducts = await db.collection('products').find({}, {
            projection: {
                _id: 1, title: 1, description: 1, price: 1, category: 1, brand: 1, inventory: 1, creationDate: 1, expirationDate: 1, origin: 1, variations: 1, salePrice: 1, slug: 1, totalRatings: 1, totalReviews: 1, totalSales: 1, rateAverage: 1,
                lastModified: 1,
                instock: 1
            }
        });

        const is_IdDeleted = delete allProducts._id;
        if (is_IdDeleted) {
            console.log("allProducts _id deleted and returned ");
            return allProducts;
        }
        console.log("allProducts _id NOT deleted and REST isreturned ");
        const { _id, ...rest } = allProducts;
        return rest;
    } catch (error) {
        console.log("Error from product DB handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.name}\t${error.message}`,
            "product.log"
        );
        return [];
    }

}




module.exports = ({ dbconnection, logEvents }) => {

    return Object.freeze({
        createProductDbHandler: async (productData) => createProduct(productData, dbconnection, logEvents),
        findOneProductDbHandler: async ({ productId }) => findOneProduct({ productId, dbconnection, logEvents }),
        findAllProductsDbHandler: async () => findAllProducts({ dbconnection, logEvents }),
    })
}