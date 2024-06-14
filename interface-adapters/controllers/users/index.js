const {registerUserController} = require("./create-user");
const {registerUserUserCaseHandler, loginUserUseCaseHandler} = require("../../../application-business-rules/use-cases/user");
const {loginUserController} = require("./login-user");


const createUserControllerHandler = registerUserController({registerUserUserCaseHandler});
const loginUserControllerHandler = loginUserController({loginUserUseCaseHandler});

module.exports = {
    createUserControllerHandler,
    loginUserControllerHandler
}