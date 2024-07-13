
// user and product validation
const userValidationData = require("../validate-models/user-validation-functions");
const productValidation = require("../validate-models/product-validation-fcts")();

//log errors
const { logEvents } = require("../../interface-adapters/middlewares/loggers/logger");

// user and product models
const { makeUserModel } = require("./user-model");
const productModels = require("./product-model");

const makeUser = makeUserModel({ userValidationData, logEvents });
const makeProductModelHandler = productModels.makeProductModel({ productValidation });
const makeProductRatingModelHandler = productModels.makeRatingProductModel({ productValidation });


module.exports = {
    makeUser,
    makeProductModelHandler,
    makeProductRatingModelHandler
};
