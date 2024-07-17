
const { validateObjectId,
} = require("./product-validation-fcts")();

// validate rating model 
const validateRatingModel = ({ productId, userId, ratingValue }, InvalidPropertyError) => {
    // validate IDs
    validateObjectId,
        (productId, InvalidPropertyError);
    validateObjectId,
        (userId, InvalidPropertyError);

    // validate rating value
    if (!ratingValue || ![1, 2, 3, 4, 5].includes(ratingValue)) {
        throw new InvalidPropertyError(
            `Invalid rating value.`
        )
    }

    return {
        productId,
        userId,
        ratingValue,
        date: new Date().toISOString(),
    };
}

module.exports = () => {
    return Object.freeze({
        validateObjectId,
        validateRatingModel
    })
}
