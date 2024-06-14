const {registerUserUseCase, 
    deleteUserUseCase,
    findAllUsersUseCase,
    findOneUserUseCase,
    loginUserUseCase,
    logoutUseCase,
    refreshTokenUseCase,
    updateUserUseCase
} = require("./user-handlers");
const dbUserHandler = require("../../../framework-and-drivers/database-access/")
// const {loginUserUseCase} = require("./login-user");

const registerUserUserCaseHandler = registerUserUseCase({dbUserHandler});
const loginUserUseCaseHandler =  loginUserUseCase({dbUserHandler});
const findOneUserUseCaseHandler = findOneUserUseCase({dbUserHandler});
const findAllUsersUseCaseHandler = findAllUsersUseCase({dbUserHandler});
const logoutUseCaseHandler = logoutUseCase();
const refreshTokenUseCaseHandler = refreshTokenUseCase({dbUserHandler});
const updateUserUseCaseHandler = updateUserUseCase({dbUserHandler});
const deleteUserUseCaseHandler = deleteUserUseCase({dbUserHandler});



module.exports = {
    loginUserUseCaseHandler, logoutUseCaseHandler, refreshTokenUseCaseHandler, updateUserUseCaseHandler, deleteUserUseCaseHandler, findAllUsersUseCaseHandler, findOneUserUseCaseHandler, registerUserUserCaseHandler, loginUserUseCaseHandler}  