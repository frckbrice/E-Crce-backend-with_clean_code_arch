
// user and product validation
const userValidationData = require("../validate-models/user-validation-functions");
const productValidation = require("../validate-models/product-validation-fcts")();
const { validateRatingModel } = require("../validate-models/rating-validation")();

//log errors
const { logEvents } = require("../../interface-adapters/middlewares/loggers/logger");

// user and product models
const { makeUserModel } = require("./user-model");
const productModels = require("./product-model");
const { makeRatingProductModel } = require("./rating-model");

const makeUser = makeUserModel({ userValidationData, logEvents });
const makeProductModelHandler = productModels.makeProductModel({ productValidation });
const makeProductRatingModelHandler = makeRatingProductModel({ validateRatingModel });


module.exports = {
    makeUser,
    makeProductModelHandler,
    makeProductRatingModelHandler
};
