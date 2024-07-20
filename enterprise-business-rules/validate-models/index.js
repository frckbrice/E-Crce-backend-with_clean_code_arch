const blogValidation = require("./blog-validation");
const productValidation = require("./product-validation-fcts")();
const ratingValidation = require("./rating-validation")();
const userValidation = require("./user-validation-functions");


module.exports = Object.freeze({
    blogValidation,
    productValidation,
    ratingValidation,
    userValidation
});
