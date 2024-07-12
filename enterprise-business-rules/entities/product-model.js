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

    //make rating model
    makeRatingProductModel: ({ productValidation }) => async function makeProductRatingModelHandler({ errorHandlers, ...ratingData }) {

        console.log(" hit make Rating Product model: ");
        const { validateRatingModel } = productValidation;
        const { InvalidPropertyError } = errorHandlers;

        try {
            const validatedRatingData = await validateRatingModel(ratingData, InvalidPropertyError);
            return Object.freeze(validatedRatingData)
        } catch (error) {
            console.log("Error from rating-model handler: ", error);
            throw new Error(error.message);
        }
    }
}
