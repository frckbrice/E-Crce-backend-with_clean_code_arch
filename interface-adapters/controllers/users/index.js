
const userControllerHandlers = require("./user-auth-controller");
const userUseCaseHandlers = require("../../../application-business-rules/use-cases/user");

const { makeHttpError } = require("../../validators-errors/http-error");
const { logEvents } = require("../../middlewares/loggers/logger");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../../adapter/email-sending");


const {
    UniqueConstraintError,
    InvalidPropertyError
} = require("../../validators-errors/errors");

const registerUserControllerHandler = userControllerHandlers.registerUserController({
    registerUserUseCaseHandler: userUseCaseHandlers.registerUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents
});

const loginUserControllerHandler = userControllerHandlers.loginUserController({
    loginUserUseCaseHandler: userUseCaseHandlers.loginUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents, bcrypt, jwt
});

const deleteUserControllerHandler = userControllerHandlers.deleteUserController({
    deleteUserUseCaseHandler: userUseCaseHandlers.deleteUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents
});
const findAllUsersControllerHandler = userControllerHandlers.findAllUsersController({
    findAllUsersUseCaseHandler: userUseCaseHandlers.findAllUsersUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents
});

const findOneUserControllerHandler = userControllerHandlers.findOneUserController({
    findOneUserUseCaseHandler: userUseCaseHandlers.findOneUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents
});

const updateUserControllerHandler = userControllerHandlers.updateUserController({
    updateUserUseCaseHandler: userUseCaseHandlers.updateUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents
});

const logoutUserControllerHandler = userControllerHandlers.logoutUserController({
    logoutUseCaseHandler: userUseCaseHandlers.logoutUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents
});

const blockUserControllerHandler = userControllerHandlers.blockUserController({
    blockUserUseCaseHandler: userUseCaseHandlers.blockUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents
});

const unBlockUserControllerHandler = userControllerHandlers.unBlockUserController({
    unBlockUserUseCaseHandler: userUseCaseHandlers.unBlockUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents
});

const refreshTokenUserControllerHandler = userControllerHandlers.refreshTokenUserController({ refreshTokenUseCaseHandler: userUseCaseHandlers.refreshTokenUseCaseHandler, makeHttpError, logEvents, jwt });

const forgotPasswordControllerHandler = userControllerHandlers.forgotPasswordController({
    forgotPasswordUseCaseHandler: userUseCaseHandlers.forgotPasswordUseCaseHandler, UniqueConstraintError, sendEmail,
    InvalidPropertyError, makeHttpError, logEvents
});

const resetPasswordControllerHandler = userControllerHandlers.resetPasswordController({
    resetPasswordUseCaseHandler: userUseCaseHandlers.resetPasswordUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError, makeHttpError, logEvents
});

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
    unBlockUserControllerHandler,
    forgotPasswordControllerHandler,
    resetPasswordControllerHandler
}
