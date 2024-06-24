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

const {
    UniqueConstraintError,
    InvalidPropertyError
} = require("../../validators-errors/errors");

const registerUserControllerHandler = registerUserController({
    registerUserUserCaseHandler, UniqueConstraintError,
    InvalidPropertyError
});
const loginUserControllerHandler = loginUserController({
    loginUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError
});
const deleteUserControllerHandler = deleteUserController({
    deleteUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError
});
const findAllUsersControllerHandler = findAllUsersController({
    findAllUsersUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError
});
const findOneUserControllerHandler = findOneUserController({
    findOneUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError
});
const updateUserControllerHandler = updateUserController({
    updateUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError
});
const logoutUserControllerHandler = logoutUserController({
    logoutUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError
});
const blockUserControllerHandler = blockUserController({
    blockUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError
});
const unBlockUserControllerHandler = unBlockUserController({
    unBlockUserUseCaseHandler, UniqueConstraintError,
    InvalidPropertyError
});


const refreshTokenUserControllerHandler = refreshTokenUserController({ refreshTokenUseCaseHandler });



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