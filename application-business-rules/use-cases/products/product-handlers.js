
/**
 * Creates a new product in the database using the provided product data.
 *
 * @param {Object} options - An object containing the following properties:
 *   - makeProductModelHandler: A function that validates the product data and returns normalized data.
 *   - createProductHandler: An object containing the createProduct function to store the product in the database.
 *   - productData: The data of the product to be created.
 *   - errorHandlers: An object containing error handlers for validation errors.
 * @return {Promise<Object>} A promise that resolves to the newly created product, frozen to prevent mutation.
 * @throws {Error} If there is an error during the creation process, an error with the error message is thrown.
 */
const createProductUseCase = ({ makeProductModelHandler }) => async function
    createProductUseCaseHandler({ createProductDbHandler, productData, errorHandlers }) {

    try {
        const validatedProductData = await makeProductModelHandler({ productData, errorHandlers });
        // store product in database mongodb
        const newProduct = await createProductDbHandler(validatedProductData);
        return Object.freeze(newProduct)
    } catch (error) {
        console.log("Error from create product handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.name || error.TypeError || error.ReferenceError}\t${error.message}`,
            "productHandler.log"
        );
        throw new Error(error.message);
    }
}

//find one product from DB
const findOneProductUseCase = ({ productValidation }) => async function
    findOneProductUseCaseHandler({ productId, logEvents, findOneProductDbHandler, errorHandlers }) {
    const { InvalidPropertyError } = errorHandlers;
    const { validateUUID } = productValidation;
    try {
        // validate id
        const uuid = validateUUID(productId, InvalidPropertyError);
        // store product in database mongodb
        const newProduct = await findOneProductDbHandler({ productId: uuid });
        return Object.freeze(newProduct)
    } catch (error) {
        console.log("Error from fetch one product handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.name || error.TypeError || error.ReferenceError}\t${error.message}`,
            "productHandler.log"
        );
        throw new Error(error.message);
    }
}


// find all product use case handler
const findAllProductsUseCase = () => findAllProductUseCaseHandler = async ({ dbProductHandler, logEvents, filterOptions }) => {

    try {

        const allProducts = await dbProductHandler.findAllProductsDbHandler(filterOptions);
        // console.log("from find all products use case: ", allProducts);
        return Object.freeze(allProducts)
    } catch (e) {
        console.log("Error from fetch all product handler: ", e);
        logEvents(
            `${error.no}:${error.code}\t${error.name || error.TypeError || error.ReferenceError}\t${error.message}`,
            "productHandler.log"
        );
        throw new Error(e.message);
    }
}

// delete product use case 
const deleteProductUseCase = () => async function deleteProductUseCaseHandler({ productId, logEvents, dbProductHandler, errorHandlers }) {

    const { findOneProductDbHandler, deleteProductDbHandler } = dbProductHandler;
    const { InvalidPropertyError } = errorHandlers;
    const { validateUUID } = productValidation;
    try {
        // validate id
        const uuid = validateUUID(productId, InvalidPropertyError);
        // check first that the product exists
        const existingProduct = await findOneProductDbHandler({ productId: uuid });
        if (!existingProduct) {
            throw new Error("Product not exists! cannot delete it.");
        }
        // store product in database mongodb
        const newProduct = await deleteProductDbHandler({ productId: existingProduct.id });
        const result = {
            deletedCount: newProduct.id ? 1 : 0,
            message: newProduct.id ? 'product successfully deleted' : ' product not found'
        }
        return Object.freeze(result)
    } catch (error) {
        console.log("Error from delete product handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.name || error.TypeError || error.ReferenceError}\t${error.message}`,
            "productHandler.log"
        );
        throw new Error(error.message);
    }
}

// update product
const updateProductUseCase = ({ makeProductModelHandler }) => async function
    updateProductUseCaseHandler({ productId, updateData, logEvents, dbProductHandler, errorHandlers }) {

    const { findOneProductDbHandler, updateProductDbHandler } = dbProductHandler;
    const { InvalidPropertyError } = errorHandlers;
    const { validateUUID } = productValidation;
    try {
        // validate id
        const uuid = validateUUID(productId, InvalidPropertyError);
        // check first that the product exists
        const existingProduct = await findOneProductDbHandler({ productId: uuid });
        if (!existingProduct) {
            throw new RangeError("Product not exists! cannot update it.");
        }

        // validate data before mutation
        const productData = await makeProductModelHandler({ productData: { ...existingProduct, ...updateData }, errorHandlers });

        // store product in database mongodb
        const newProduct = await updateProductDbHandler({ productId, ...productData });
        console.log(" from product handler after DB: ", newProduct);
        return Object.freeze(newProduct)
    } catch (error) {
        console.log("Error from update product handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.name || error.TypeError || error.ReferenceError}\t${error.message}`,
            "productHandler.log"
        );
        throw new Error(error.message);
    }
}


// rate product in transaction with both Rate model and Product model
const rateProductUseCase = ({ makeProductRatingModelHandler }) => async function rateProductUseCaseHandler({
    userId, ratingValue, productId, logEvents, dbProductHandler, errorHandlers
}) {
    console.log("hit rating use case handler")
    const ratingData = { ratingValue, userId, productId };
    try {
        /* validate and build rating model */
        const ratingModel = await makeProductRatingModelHandler({ errorHandlers, ...ratingData });
        const newProduct = await dbProductHandler.rateProductDbHandler(ratingModel);
        console.log(" from rating product handler after DB: ", newProduct);
        return Object.freeze(newProduct)
    } catch (error) {
        console.log("Error from fetch one product handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.name || error.TypeError || error.ReferenceError}\t${error.message}`,
            "productHandler.log"
        );
        throw new Error(error.message);
    }
}

module.exports = Object.freeze({
    createProductUseCase,
    findOneProductUseCase,
    findAllProductsUseCase,
    deleteProductUseCase,
    updateProductUseCase,
    rateProductUseCase
})
