

// create product controller
const createProductController = ({ createProductUseCaseHandler, createProductDbHandler, errorHandlers, makeHttpError, logEvents }) => async function createProductControllerHandler(httpRequest) {

    const { UniqueConstraintError, InvalidPropertyError } = errorHandlers;

    const { body } = httpRequest;
    if (!Object.keys(body).length && body.constructor === Object) {
        return makeHttpError({
            statusCode: 400,
            errorMessage: 'No product data provided'
        });
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


    return createProductUseCaseHandler({ createProductDbHandler, errorHandlers, productData })
        .then(createdProduct => {

            return {
                headers: {
                    'Content-Type': 'application/json'
                },
                statusCode: 201,
                data: JSON.stringify(createdProduct)
            };
        }).catch(e => {
            logEvents(
                `${e.no}:${e.code}\t${e.name}\t${e.message}`,
                "controllerHandlerErr.log"
            );
            console.log("error from createProductController controller handler: ", e);
            const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
            return makeHttpError({ errorMessage: e.message, statusCode });
        });

}

// find one product controller 
const findOneProductController = ({ findOneProductDbHandler, findOneProductUseCaseHandler, errorHandlers }) => async function findOneProductControllerHandler(httpRequest) {

    const { UniqueConstraintError, InvalidPropertyError } = errorHandlers;

    const { productId } = httpRequest.params;
    if (!productId) {
        return makeHttpError({
            statusCode: 400,
            errorMessage: 'No product Id provided'
        });
    }
    try {
        const product = await findOneProductUseCaseHandler({ productId, errorHandlers, findOneProductDbHandler });
        return {
            headers: {
                'Content-Type': 'application/json'
            },
            statusCode: 201,
            data: JSON.stringify(product)
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
const findAllProductController = ({ findAllProductsDbHandler, findAllProductUseCaseHandler, errorHandlers }) => async function findAllProductControllerHandler(httpRequest) {

    const { UniqueConstraintError, InvalidPropertyError } = errorHandlers;
    try {
        const products = await findAllProductUseCaseHandler({ findAllProductsDbHandler, errorHandlers });
        return {
            headers: {
                'Content-Type': 'application/json'
            },
            statusCode: 201,
            data: JSON.stringify(products)
        };
    } catch (e) {
        logEvents(
            `${e.no}:${e.code}\t${e.name}\t${e.message}`,
            "controllerHandlerErr.log"
        );
        console.log("error from findAllProductController controller handler: ", e);
        return makeHttpError({ errorMessage: e.message, statusCode: e.statusCode });
    }
}



module.exports = () => Object.freeze({
    createProductController,
    findOneProductController
})