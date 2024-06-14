
const { UniqueConstraintError, InvalidPropertyError, RequiredParameterError } = require("../../config/validators-errors/errors");
const {makeHttpError} = require("../../config/validators-errors/http-error");


module.exports = {

    /**
     * Handles the registration of a user by calling the registerUserUseCaseHandler with the provided user information.
     *
     * @param {Object} httpRequest - An object containing the HTTP request with user information.
     * @return {Promise<Object>} A promise that resolves to an object containing the HTTP response with user registration details.
     */
    registerUserController: ({ registerUserUserCaseHandler }) => {
        return async function createUserControllerHandler(httpRequest) {
            const { body } = httpRequest;
            if (!body) {
                throw makeHttpError({
                    statusCode: 400,
                    errorMessage: 'Bad request. No POST body.'
                });
            }

            let userInfo = typeof body === 'string' ? JSON.parse(body) : body;

            try {
                const registeredUser = await registerUserUserCaseHandler(userInfo);
                return {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    statusCode: registeredUser.statusCode || 201,
                    data: JSON.stringify(registeredUser.data || registeredUser)
                };
            } catch (e) {
                console.error("error from register controller: ", e)
                const statusCode =
                    e instanceof UniqueConstraintError
                        ? 409
                        : e instanceof InvalidPropertyError ||
                        e instanceof RequiredParameterError
                            ? 400
                            : 500;
                throw makeHttpError({
                    errorMessage: e.message,
                    statusCode
                });
            }
        };
    },


    /**
     * Handles the login user controller by calling the loginUserUseCaseHandler with the provided email and password.
     * If the email or password is missing, it throws a RequiredParameterError.
     * If there is an error during the login process, it throws a makeHttpError with the appropriate status code.
     * If the login is successful, it creates cookies for the access token and returns the user credentials.
     *
     * @param {Object} options - An object containing the loginUserUseCaseHandler function.
     * @param {Function} options.loginUserUseCaseHandler - The function responsible for handling the login use case.
     * @return {Promise<Object>} A promise that resolves to an object containing the user credentials and the appropriate status code.
     * @throws {RequiredParameterError} If the email or password is missing.
     * @throws {makeHttpError} If there is an error during the login process.
     */
    loginUserController: ({ loginUserUseCaseHandler }) => {
        return async function loginUserControllerHandler(httpRequest) {

            const { email, password } = httpRequest.body;

            if (!email || !password) {
                throw new RequiredParameterError("email or password");
            }

            try {
                const userCredentials = await loginUserUseCaseHandler({ email, password });

                const maxAge = {
                    accessToken: process.env.JWT_EXPIRES_IN,
                    // refreshToken: process.env.JWT_REFRESH_EXPIRES_IN
                };

                const cookies = Object.entries(maxAge).map(([name, age]) => {
                    return `${name}=${userCredentials[name]}; HttpOnly; Path=/; Max-Age=${age}; SameSite=none; Secure`;
                }).join('; ');

                return {
                    headers: {
                        'Content-Type': 'application/json',
                        cookies
                    },
                    statusCode: 201,
                    data: JSON.stringify(userCredentials)
                };
            } catch (e) {
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    },

    /**
     * Handles the logout user controller by calling the logoutUseCaseHandler with the provided refreshToken.
     * If the refreshToken is missing, it throws a RequiredParameterError.
     * If there is an error during the logout process, it throws a makeHttpError with the appropriate status code.
     * If the logout is successful, it creates cookies for the access token and refresh token with a max age of 0.
     *
     * @param {Object} options - An object containing the logoutUseCaseHandler function.
     * @param {Function} options.logoutUseCaseHandler - The function responsible for handling the logout use case.
     * @return {Promise<Object>} A promise that resolves to an object containing empty cookies and the appropriate status code.
     * @throws {RequiredParameterError} If the refreshToken is missing.
     * @throws {makeHttpError} If there is an error during the logout process.
     */
    logoutUserController: ({logoutUseCaseHandler}) => {
        return async function logoutUserControllerHandler(httpRequest) {
            const { refreshToken } = httpRequest.body;
            try {
                await logoutUseCaseHandler({ refreshToken });
                const cookies = 'accessToken=; HttpOnly; Path=/; Max-Age=0; SameSite=none; Secure,' +
                    'refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=none; Secure';
                return {
                    headers: {
                        'Content-Type': 'application/json',
                        cookies
                    },
                    statusCode: 201,
                    data: JSON.stringify({})
                };
            } catch (e) {
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    },

    deleteUserController: ({deleteUserUseCaseHandler}) => {
        return async function deleteUserControllerHandler(httpRequest) {
            const { userId } = httpRequest.params;
            try {
                const deletedUser= await deleteUserUseCaseHandler({ userId: id });
                return {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    statusCode: 201,
                    data: JSON.stringify(deletedUser)
                };
            } catch (e) {
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    },

    updateUserController: ({updateUserUseCaseHandler}) => {
        return async function updateUserControllerHandler(httpRequest) {
            const { userId } = httpRequest.params;
            const data = httpRequest.body;
            try {
                const updatedUser = await updateUserUseCaseHandler({ userId, ...data });
                return {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    statusCode: 201,
                    data: JSON.stringify(updatedUser)
                };
            } catch (e) {
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    },

    findOneUserController: ({findOneUserUseCaseHandler}) => {
        return async function findOneUserControllerHandler(httpRequest) {
            const data = httpRequest.params;

            try {
                const user = await findOneUserUseCaseHandler(data);
                return {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    statusCode: 201,
                    data: JSON.stringify(user)
                };
            } catch (e) {
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    },

    findAllUsersController: ({findAllUsersUseCaseHandler}) => {
        return async function findAllUsersControllerHandler() {
            try {
                const users = await findAllUsersUseCaseHandler();
                return {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    statusCode: 201,
                    data: JSON.stringify(users)
                };
            } catch (e) {
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    },

    refreshTokenUserController: ({refreshTokenUseCaseHandler}) => {
        return async function refreshTokenUserControllerHandler(httpRequest) {
            const { refreshToken } = httpRequest.body;
            try {
                const token = await refreshTokenUseCaseHandler({ refreshToken });
                return {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    statusCode: 201,
                    data: JSON.stringify(token)
                };
            } catch (e) {
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    }
}