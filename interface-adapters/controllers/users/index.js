const {
    registerUserController, 
    loginUserController,
    logoutUserController,
    deleteUserController,
    findAllUsersController,
    findOneUserController,
    refreshTokenUserController,
    updateUserController,
} = require("./create-user");
const {
    registerUserUserCaseHandler, 
    loginUserUseCaseHandler, 
    logoutUseCaseHandler,
    deleteUserUseCaseHandler,
    findAllUsersUseCaseHandler,
    findOneUserUseCaseHandler,
    refreshTokenUseCaseHandler,
    updateUserUseCaseHandler,
} = require("../../../application-business-rules/use-cases/user");

const createUserControllerHandler = registerUserController({registerUserUserCaseHandler});
const loginUserControllerHandler = loginUserController({loginUserUseCaseHandler});
const deleteUserControllerHandler = deleteUserController({deleteUserUseCaseHandler});
const findAllUsersControllerHandler = findAllUsersController({findAllUsersUseCaseHandler});
const findOneUserControllerHandler = findOneUserController({findOneUserUseCaseHandler});
const updateUserControllerHandler = updateUserController({updateUserUseCaseHandler});
const logoutUserControllerHandler = logoutUserController({logoutUseCaseHandler});


const refreshTokenUserControllerHandler = refreshTokenUserController({refreshTokenUseCaseHandler});



module.exports = {
    createUserControllerHandler,
    loginUserControllerHandler,
    deleteUserControllerHandler,
    logoutUserControllerHandler,
    findAllUsersControllerHandler,
    findOneUserControllerHandler,
    refreshTokenUserControllerHandler,
    updateUserControllerHandler
}