const {
    registerUserController, 
    loginUserController,
    logoutUserController,
    deleteUserController,
    findAllUsersController,
    findOneUserController,
    refreshTokenUserController,
    updateUserController,
    blockUserController,
    unBlockUserController
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
    blockUserUseCaseHandler,
    unBlockUserUseCaseHandler
} = require("../../../application-business-rules/use-cases/user");

const registerUserControllerHandler = registerUserController({registerUserUserCaseHandler});
const loginUserControllerHandler = loginUserController({loginUserUseCaseHandler});
const deleteUserControllerHandler = deleteUserController({deleteUserUseCaseHandler});
const findAllUsersControllerHandler = findAllUsersController({findAllUsersUseCaseHandler});
const findOneUserControllerHandler = findOneUserController({findOneUserUseCaseHandler});
const updateUserControllerHandler = updateUserController({updateUserUseCaseHandler});
const logoutUserControllerHandler = logoutUserController({logoutUseCaseHandler});
const blockUserControllerHandler = blockUserController({blockUserUseCaseHandler});
const unBlockUserControllerHandler = unBlockUserController({unBlockUserUseCaseHandler});


const refreshTokenUserControllerHandler = refreshTokenUserController({refreshTokenUseCaseHandler});



module.exports = {
    registerUserControllerHandler,
    loginUserControllerHandler,
    deleteUserControllerHandler,
    logoutUserControllerHandler,
    findAllUsersControllerHandler,
    findOneUserControllerHandler,
    refreshTokenUserControllerHandler,
    updateUserControllerHandler,
    blockUserControllerHandler,
    unBlockUserControllerHandler
}