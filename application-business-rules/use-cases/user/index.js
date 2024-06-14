const {registerUserUseCase} = require("./add-user");
const dbUserHandler = require("../../../framework-and-drivers/database-access/")
const {loginUserUseCase} = require("./login-user");

const registerUserUserCaseHandler = registerUserUseCase({dbUserHandler});
const loginUserUseCaseHandler =  loginUserUseCase({dbUserHandler});

module.exports = {registerUserUserCaseHandler, loginUserUseCaseHandler}  