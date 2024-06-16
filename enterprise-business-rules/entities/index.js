const {makeUserModel} = require("./user-model");
const {
    normalise, 
    validateUserData, 
    validateUserDataUpdates,
    validateId
} = require("../validate-models/validation-functions");

const makeUser = makeUserModel({normalise, validateUserData, validateUserDataUpdates});


module.exports = {
    makeUser, 
    validateId, 
    validateUserDataUpdates
} ;