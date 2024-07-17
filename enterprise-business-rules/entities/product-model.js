module.exports = {

    //makeProduct model
    makeProductModel: ({ productValidation }) => async function makeProductModelHandler({ productData, errorHandlers }) {

        console.log(" hit makeProduct model: ");
        const { basicProductValidation } = productValidation;

        try {
            const validatedProductData = await basicProductValidation({ productData, errorHandlers });

            return Object.freeze(validatedProductData)
        } catch (error) {
            console.log("Error from product-model handler: ", error);
            throw new Error(error.message);
        }
    },
}
