
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
        console.log("Error from product handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.name}\t${error.message}`,
            "product.log"
        );
        throw new Error(error.message);
    }
}

//find one product from DB
const findOneProductUseCase = ({ makeProductModelHandler }) => async function
    findOneProductUseCaseHandler({ findOneProductDbHandler, productData, errorHandlers }) {

    try {
        const validatedProductData = await makeProductModelHandler({ productData, errorHandlers });
        // store product in database mongodb
        const newProduct = await findOneProductDbHandler(validatedProductData);
        return Object.freeze(newProduct)
    } catch (error) {
        console.log("Error from product handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.name}\t${error.message}`,
            "product.log"
        );
        throw new Error(error.message);
    }
}


module.exports = Object.freeze({
    createProductUseCase,
    findOneProductUseCase
})

