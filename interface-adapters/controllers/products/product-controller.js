

// create product controller
const createProductController = ({ createProductUseCaseHandler, dbProductHandler, errorHandlers, makeHttpError, logEvents }) => async function createProductControllerHandler(httpRequest) {

    const { UniqueConstraintError, InvalidPropertyError } = errorHandlers;

    let { body } = httpRequest;
    if (!Object.keys(body).length && body.constructor === Object) {
        return makeHttpError({
            statusCode: 400,
            errorMessage: 'No product data provided'
        });
    }

    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {
            return makeHttpError({
                statusCode: 400,
                errorMessage: 'Bad request. POST body must be valid JSON.'
            })
        }
    }

    //extract appropriate data for use case
    const productData = {
        title: body.title,
        descripton: body.descripton,
        price: body.price, //The current selling price of the product.
        category: body.category,
        /* example: images: ["image1.jpg", "image2.jpg"],*/
        images: body.images,
        colors: body.colors,
        brands: body.brands,
        inventory: body.inventory,
        creationDate: body.creationDate,
        expirationDate: body.expirationDate,
        origin: body.origin,

        // example: [
        //       { size: "S", color: "Red", material: "Cotton", fit: "Regular", quantity: 10 },
        //       { size: "M", color: "Blue", material: "Cotton", fit: "Regular", quantity: 20 },
        //     ],
        variations: body.variations,  //Options for different versions of the product (e.g., size, color, material).
        weight: body.weight, // weight: 0.25, // Kg important for shipping calculations,
        dimensions: body.dimensions, //length, width, height,
        /**example: highlights: ["Comfortable", "Stylish", "100% Cotton"], */
        highlights: body.highlights, // Key features or benefits of the product for quick reference
        /*example  specifications: { material: "Cotton", fit: "Regular" },*/
        specifications: body.specifications, // Detailed technical specifications (e.g., for electronics).
        shipping: body.shipping, //Information about shipping costs and options.
        seoKeyworks: body.seoKeyworks, // Keywords and meta descriptions for search engine optimization.
        size: body.size, // The size(s) of the product (e.g., clothing size, shoe size).
        materials: body.materials, // The materials used to make the product. (e.g., clothing material, shoe material).
        subcategory: body.subcategory, // Subcategories of the product (e.g., clothing subcategories, shoe subcategories).
        lowStockTreshold: body.lowStockTreshold, //An alert level for when inventory is running low.
        salePrice: body.salePrice, // A discounted price for sales or promotions.
        seoKeywords: body.seoKeywords
    };


    return createProductUseCaseHandler({
        createProductDbHandler: dbProductHandler.createProductDbHandler, errorHandlers, productData
    })
        .then(createdProduct => {

            return {
                headers: {
                    'Content-Type': 'application/json',
                    "x-content-type-options": "nosniff"
                },
                statusCode: 201,
                data: { createdProduct }
            };
        }).catch(e => {
            logEvents(
                `${e.no}:${e.ReferenceError}\t${e.name}\t${e.name}\t${e.message}`,
                "controllerHandlerErr.log"
            );
            console.log("error from createProductController controller handler: ", e);
            const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
            return makeHttpError({ errorMessage: e.message, statusCode });
        });

}

// find one product controller 
const findOneProductController = ({
    dbProductHandler, findOneProductUseCaseHandler, logEvents, errorHandlers }) => async function findOneProductControllerHandler(httpRequest) {

        const { productId } = httpRequest.params;
        if (!productId) {
            return makeHttpError({
                statusCode: 400,
                errorMessage: 'No product Id provided'
            });
        }
        try {
            const product = await findOneProductUseCaseHandler({ productId, logEvents, findOneProductDbHandler: dbProductHandler.findOneProductDbHandler, errorHandlers });
            return {
                headers: {
                    'Content-Type': 'application/json',
                    "x-content-type-options": "nosniff"
                },
                statusCode: 201,
                data: { product }
            };
        } catch (e) {
            logEvents(
                `${e.no}:${e.code}\t${e.name}\t${e.message}`,
                "controllerHandlerErr.log"
            );
            console.log("error from findOneProductController controller handler: ", e);
            return makeHttpError({ errorMessage: e.message, statusCode: e.statusCode });
        }
    }


// find all product controller
const findAllProductController = ({ dbProductHandler, findAllProductUseCaseHandler, logEvents }) => async function findAllProductControllerHandler() {

    console.log("from find all product controller")

    return findAllProductUseCaseHandler({
        dbProductHandler,
        logEvents
    }).then((products) => {

        // console.log("products from findAllProductController: ", products);
        return {
            headers: {
                'Content-Type': 'application/json',
                "x-content-type-options": "nosniff"
            },
            statusCode: 201,
            data: { products }
        };
    }).catch(e => {
        logEvents(
            `${e.no}:${e.code}\t${e.name}\t${e.message}`,
            "controllerHandlerErr.log"
        );
        console.log("error from findAllProductController controller handler: ", e);
        return makeHttpError({ errorMessage: e.message, statusCode: e.statusCode });
    });

}

// delete product controller 
const deleteProductController = ({ dbProductHandler, deleteProductUseCaseHandler, makeHttpError, logEvents, errorHandlers }) => async function deleteProductControllerHandler(httpRequest) {

    const { productId } = httpRequest.params;
    if (!productId) {
        return makeHttpError({
            statusCode: 400,
            errorMessage: 'No product Id provided'
        });
    }
    return deleteProductUseCaseHandler({ productId, logEvents, dbProductHandler, errorHandlers })
        .then((deleted) => {

            // console.log("product from deleteProductController: ", deleted);
            return {
                headers: {
                    'Content-Type': 'application/json',
                    "x-content-type-options": "nosniff"
                },
                statusCode: deleted.deletedCount === 0 ? 500 : 200,
                data: { deleted }
            };
        }).catch(e => {
            logEvents(
                `${e.no}:${e.code}\t${e.name}\t${e.message}`,
                "controllerHandlerErr.log"
            );
            console.log("error from deleteProductController controller handler: ", e);
            return makeHttpError({ errorMessage: e.message, statusCode: e.statusCode || 500 });
        })

        ;

}

// update product controller
const updateProductController = ({ dbProductHandler, updateProductUseCaseHandler, makeHttpError, logEvents, errorHandlers }) => async function updateProductControllerHandler(httpRequest) {


    const { productId } = httpRequest.params;
    const { body } = httpRequest;
    if (!productId || !Object.keys(body).length && body.constructor == Object) {
        return makeHttpError({
            statusCode: 400,
            errorMessage: 'No product Id or update data provided'
        });
    }

    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {
            return makeHttpError({
                statusCode: 400,
                errorMessage: 'Bad request. POST body must be valid JSON.'
            })
        }
    }

    return updateProductUseCaseHandler({ productId, updateData: body, logEvents, dbProductHandler, errorHandlers })
        .then((newProduct) => {
            return {
                headers: {
                    'Content-Type': 'application/json',
                    'Last-Modified': new Date(newProduct.lastModified).toUTCString(),
                    "x-content-type-options": "nosniff"
                },
                statusCode: 200,
                data: { newProduct }
            };
        })
        .catch(e => {
            logEvents(
                `${e.no}:${e.code}\t${e.name}\t${e.message}`,
                "controllerHandlerErr.log"
            );
            console.log("error from updateProductController controller handler: ", e);
            if (e.name === 'RangeError')
                return makeHttpError({ errorMessage: e.message, statusCode: e.statusCode || 404 })
            return makeHttpError({ errorMessage: e.message, statusCode: e.statusCode || 500 });
        });

}

// rate product controller 
const rateProductController = ({ dbProductHandler, rateProductUseCaseHandler, makeHttpError, logEvents, errorHandlers }) => async function rateProductControllerHandler(httpRequest) {
    const {
        userId,
        ratingValue,
        productId,
    } = httpRequest.body;

    console.log("hit rating product controller")

    if (!productId || !userId || !ratingValue) {
        return makeHttpError({
            statusCode: 400,
            errorMessage: 'Bad credentials'
        });
    }

    return rateProductUseCaseHandler({
        userId, ratingValue, productId, logEvents, dbProductHandler, errorHandlers
    }).then((newProduct) => {

        if (newProduct.error)
            return {
                headers: {
                    'Content-Type': 'application/json',
                    'Last-Modified': new Date(newProduct.lastModified).toUTCString(),
                    "x-content-type-options": "nosniff"
                },
                statusCode: newProduct.error.code || 500,
                data: { newProduct }
            };
        else
            return {
                headers: {
                    'Content-Type': 'application/json',
                    'Last-Modified': new Date(newProduct.lastModified).toUTCString(),
                    "x-content-type-options": "nosniff"
                },
                statusCode: 201,
                data: { newProduct }
            };
    }).catch(e => {
        logEvents(
            `${e.no}:${e.type}\t${e.name}\t${e.message}`,
            "controllerHandlerErr.log"
        );
        console.log("error from rateProductController controller handler: ", e);
        if (e.name === 'RangeError')
            return makeHttpError({ errorMessage: e.message, statusCode: e.statusCode || 404 })
        return makeHttpError({ errorMessage: e.message, statusCode: e.statusCode || 500 });
    });

}


module.exports = () => Object.freeze({
    createProductController,
    findOneProductController,
    findAllProductController,
    deleteProductController,
    updateProductController,
    rateProductController
})
