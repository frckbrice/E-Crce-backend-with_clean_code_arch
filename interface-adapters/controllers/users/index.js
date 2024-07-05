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
} = require("./user-auth-controller");
const {
    registerUserUseCaseHandler,
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

const { makeHttpError } = require("../../validators-errors/http-error");
const { logEvents } = require("../../middlewares/loggers/logger");

const {
    UniqueConstraintError,
    InvalidPropertyError
} = require("../../validators-errors/errors");

const registerUserControllerHandler = registerUserController({
    registerUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents
});
const loginUserControllerHandler = loginUserController({
    loginUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents
});
const deleteUserControllerHandler = deleteUserController({
    deleteUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents
});
const findAllUsersControllerHandler = findAllUsersController({
    findAllUsersUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents
});
const findOneUserControllerHandler = findOneUserController({
    findOneUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents
});
const updateUserControllerHandler = updateUserController({
    updateUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents
});
const logoutUserControllerHandler = logoutUserController({
    logoutUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents
});
const blockUserControllerHandler = blockUserController({
    blockUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents
});
const unBlockUserControllerHandler = unBlockUserController({
    unBlockUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents
});


const refreshTokenUserControllerHandler = refreshTokenUserController({ refreshTokenUseCaseHandler, makeHttpError, logEvents });



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
