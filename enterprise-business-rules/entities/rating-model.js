module.exports = {

    //make rating model
    makeRatingProductModel: ({ ratingValidation, logEvents }) => async function makeProductRatingModelHandler({ errorHandlers, ...ratingData }) {

        console.log(" hit make Rating Product model: ");
        const { InvalidPropertyError } = errorHandlers;
        const { validateRatingModel } = ratingValidation;

        try {
            const validatedRatingData = await validateRatingModel(ratingData, InvalidPropertyError);
            return Object.freeze(validatedRatingData)
        } catch (error) {
            console.log("Error from rating-model handler: ", error);
            logEvents(
                `${error.no}:${error.code}\t${error.name || error.TypeError || error.ReferenceError}\t${error.message}`,
                "blog-model.log"
            );
            throw new Error(error.message);
        }
    }
}
