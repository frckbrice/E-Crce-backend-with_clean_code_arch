const { makeUserModel } = require("./user-model");
const {
    normalise,
    validateUserData,
    validateUserDataUpdates,
    validateId
} = require("../validate-models/user-validation-functions");

const {
    makeProductModel
} = require("./product-model");

const { basicProductValidation } = require("../validate-models/product-validation-fcts")();

const makeUser = makeUserModel({ normalise, validateUserData, validateUserDataUpdates });
const makeProductModelHandler = makeProductModel({ basicProductValidation });


module.exports = {
    makeUser,
    validateId,
    validateUserDataUpdates,
    makeProductModelHandler
};