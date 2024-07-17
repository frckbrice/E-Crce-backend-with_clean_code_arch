module.exports = {

    //make rating model
    makeRatingProductModel: ({ validateRatingModel }) => async function makeProductRatingModelHandler({ errorHandlers, ...ratingData }) {

        console.log(" hit make Rating Product model: ");
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
