const {makeUserModel} = require("./user-model");
// const ModelValidator = require("../validate-models/validation-functions");
const {normalise, validateUserData} = require("../validate-models/validation-functions");

// const modelValidator = new ModelValidator();
// console.log(modelValidator.upperFirst({firstName: "avombrice"}));

// const makeUser = makeUserModel({normalise: modelValidator
//     .normalise, validateUserData: modelValidator.validateUserData});


const makeUser = makeUserModel({normalise, validateUserData});


module.exports = {
    makeUser
}   