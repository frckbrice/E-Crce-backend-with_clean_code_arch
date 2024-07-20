
//log errors
const { logEvents } = require("../../interface-adapters/middlewares/loggers/logger");

//models
const { makeUserModel } = require("./user-model");
const { makeProductModel } = require("./product-model");
const { makeRatingProductModel } = require("./rating-model");

// validations
const entityModelsValidation = require("../../enterprise-business-rules/validate-models");

//sanitize input texts
const sanitizeHtml = require("sanitize-html");
/**
 * Sanitizes the given text by removing any potentially dangerous HTML tags and attributes.
 *
 * @param {string} text - The text to be sanitized.
 * @return {string} The sanitized text.
 */
function sanitize(text) {
    // TODO: allow more coding embeds
    return sanitizeHtml(text, {
        allowedIframeHostnames: ['*'] // TODO: limit to only whitelist domains
    })
}

const makeUser = makeUserModel({ userValidation: entityModelsValidation.userValidation, logEvents, sanitize });

const makeProductModelHandler = makeProductModel({ productValidation: entityModelsValidation.productValidation, sanitize });

const makeProductRatingModelHandler = makeRatingProductModel({ ratingValidation: entityModelsValidation.ratingValidation, logEvents });

const makeBlogPostModelHandler = require("./blog-model")({ blogValidation: entityModelsValidation.blogValidation, logEvents, sanitize });


module.exports = {
    makeUser,
    makeProductModelHandler,
    makeProductRatingModelHandler,
    makeBlogPostModelHandler
};
