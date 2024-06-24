module.exports = {

    //makeProduct model
    makeProductModel: ({ basicProductValidation }) => async function makeProductModelHandler({ productData, errorHandlers }) {

        console.log(" from makeProduct model: ");

        try {
            const validatedProductData = await basicProductValidation({ productData, errorHandlers });
            console.log("validated data: ", validatedProductData);
            return Object.freeze(validatedProductData)
        } catch (error) {
            console.log("Error from product-model handler: ", error);
            throw new Error(error.message);
        }
    }
}