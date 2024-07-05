const { makeUserModel } = require("./user-model");
const productValidation = require("../validate-models/product-validation-fcts")();

const {
    makeProductModel,
    makeRatingProductModel
} = require("./product-model");


const makeUser = makeUserModel({ productValidation });
const makeProductModelHandler = makeProductModel({ productValidation });
const makeProductRatingModelHandler = makeRatingProductModel({ productValidation });


module.exports = {
    makeUser,
    makeProductModelHandler,
    makeProductRatingModelHandler
};
