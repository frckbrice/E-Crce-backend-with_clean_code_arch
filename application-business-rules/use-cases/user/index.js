const userUseCases = require("./user-handlers");
const { dbUserHandler } = require("../../../interface-adapters/database-access")
const { makeUser, validateId, validateUserDataUpdates } = require("../../../enterprise-business-rules/entities");
const { RequiredParameterError } = require("../../../interface-adapters/validators-errors/errors");
const { logEvents } = require("../../../interface-adapters/middlewares/loggers/logger");
const { makeHttpError } = require("../../../interface-adapters/validators-errors/http-error");


const entityModels = require("../../../enterprise-business-rules/entities");

const registerUserUseCaseHandler = userUseCases.registerUserUseCase({ dbUserHandler, entityModels, logEvents, makeHttpError });

const loginUserUseCaseHandler = userUseCases.loginUserUseCase({ dbUserHandler, logEvents, makeHttpError });

const findOneUserUseCaseHandler = userUseCases.findOneUserUseCase({ dbUserHandler, validateId, logEvents });

const findAllUsersUseCaseHandler = userUseCases.findAllUsersUseCase({ dbUserHandler, logEvents });
const logoutUseCaseHandler = userUseCases.logoutUseCase({ RequiredParameterError, logEvents });

const refreshTokenUseCaseHandler = userUseCases.refreshTokenUseCase({ dbUserHandler, RequiredParameterError, logEvents });

const updateUserUseCaseHandler = userUseCases.updateUserUseCase({ dbUserHandler, makeUser, validateId, RequiredParameterError, logEvents, makeHttpError });

const deleteUserUseCaseHandler = userUseCases.deleteUserUseCase({ dbUserHandler, validateId, RequiredParameterError, logEvents });

const blockUserUseCaseHandler = userUseCases.blockUserUseCase({ dbUserHandler, validateId, RequiredParameterError, logEvents });

const unBlockUserUseCaseHandler = userUseCases.unBlockUserUseCase({ dbUserHandler, validateId, RequiredParameterError, logEvents });

const forgotPasswordUseCaseHandler = userUseCases.forgotPasswordUseCase({ dbUserHandler, logEvents });

const resetPasswordUseCaseHandler = userUseCases.resetPasswordUseCase({ dbUserHandler, logEvents, makeHttpError });


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
    unBlockUserUseCaseHandler,
    forgotPasswordUseCaseHandler,
    resetPasswordUseCaseHandler
}  
