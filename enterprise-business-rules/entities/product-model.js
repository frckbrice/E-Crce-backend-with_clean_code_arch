module.exports = {

    //makeProduct model
    makeProductModel: ({ productValidation, sanitize, logEvents }) => async function makeProductModelHandler({ productData, errorHandlers }) {

        console.log(" hit makeProduct model: ");
        const { basicProductValidation } = productValidation;

        try {
            const validatedProductData = await basicProductValidation({ productData, errorHandlers, sanitize });

            return Object.freeze(validatedProductData)
        } catch (error) {
            console.log("Error from product-model handler: ", error);
            logEvents(
                `${error.no}:${error.code}\t${error.name || error.TypeError || error.ReferenceError}\t${error.message}`,
                "blog-model.log"
            );
            throw new Error(error.message);
        }
    },
}
