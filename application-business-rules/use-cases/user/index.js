const { registerUserUseCase,
    deleteUserUseCase,
    findAllUsersUseCase,
    findOneUserUseCase,
    loginUserUseCase,
    logoutUseCase,
    refreshTokenUseCase,
    updateUserUseCase,
    blockUserUseCase,
    unBlockUserUseCase
} = require("./user-handlers");

const { dbUserHandler } = require("../../../interface-adapters/database-access")
// const {loginUserUseCase} = require("./login-user");

const entityModels = require("../../../enterprise-business-rules/entities");

const registerUserUseCaseHandler = registerUserUseCase({ dbUserHandler, entityModels });
const loginUserUseCaseHandler = loginUserUseCase({ dbUserHandler });
const findOneUserUseCaseHandler = findOneUserUseCase({ dbUserHandler });
const findAllUsersUseCaseHandler = findAllUsersUseCase({ dbUserHandler });
const logoutUseCaseHandler = logoutUseCase();
const refreshTokenUseCaseHandler = refreshTokenUseCase({ dbUserHandler });
const updateUserUseCaseHandler = updateUserUseCase({ dbUserHandler });
const deleteUserUseCaseHandler = deleteUserUseCase({ dbUserHandler });
const blockUserUseCaseHandler = blockUserUseCase({ dbUserHandler });
const unBlockUserUseCaseHandler = unBlockUserUseCase({ dbUserHandler });



module.exports = {
    loginUserUseCaseHandler,
    logoutUseCaseHandler,
    refreshTokenUseCaseHandler,
    updateUserUseCaseHandler,
    deleteUserUseCaseHandler,
    findAllUsersUseCaseHandler,
    findOneUserUseCaseHandler,
    registerUserUseCaseHandler,
    loginUserUseCaseHandler,
    blockUserUseCaseHandler,
    unBlockUserUseCaseHandler
}  
