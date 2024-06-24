
const { UniqueConstraintError, InvalidPropertyError, RequiredParameterError } = require("../../config/validators-errors/errors");
const { makeHttpError } = require("../../config/validators-errors/http-error");
const { logEvents } = require("../../middlewares/loggers/logger");


module.exports = {
    /**
     * Registers a new user using the provided user case handler.
     *
     * @param {Object} options - The options object.
     * @param {Function} options.registerUserUserCaseHandler - The user case handler for registering a new user.
     * @param {Object} httpRequest - The HTTP request object.
     * @param {Object} httpRequest.body - The request body containing the user information.
     * @return {Promise<Object>} - A promise that resolves to an object with the registered user data and headers.
     * @throws {Error} - If the request body is empty or not an object, throws an HTTP error with status code 400.
     * @throws {Error} - If there is an error during user registration, throws an HTTP error with the appropriate status code.
     */
    registerUserController: ({ registerUserUserCaseHandler }) => {
        return async function registerUserControllerHandler(httpRequest) {
            const { body } = httpRequest;
            if (Object.keys(body).length === 0 && body.constructor === Object) {
                return makeHttpError({
                    statusCode: 400,
                    errorMessage: 'Bad request. No message body.'
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
                logEvents(
                    `${e.no}:${e.code}\t${e.name}\t${e.message}`,
                    "controllerHandlerErr.log"
                );
                // const statusCode =
                //     e instanceof UniqueConstraintError
                //         ? 409
                //         : e instanceof InvalidPropertyError ||
                //         e instanceof RequiredParameterError
                //             ? 400
                //             : 500;
                return makeHttpError({
                    errorMessage: e.message,
                    statusCode: e.statusCode,
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
                return makeHttpError({
                    statusCode: 400,
                    errorMessage: 'Bad request. No message body.'
                });
            }

            try {
                const userCredentials = await loginUserUseCaseHandler({ email, password });

                const maxAge = {
                    accessToken: process.env.JWT_EXPIRES_IN,
                    refreshToken: process.env.JWT_REFRESH_EXPIRES_IN
                };

                const cookies = Object.entries(maxAge).map(([name, age]) => {
                    return `${name}=${userCredentials[name]}; HttpOnly; Path=/; Max-Age=${age}; SameSite=none; Secure`;
                }).join('; ');

                return {
                    headers: {
                        'Content-Type': 'application/json',
                        'Set-Cookie': cookies
                    },
                    statusCode: 201,
                    data: JSON.stringify(userCredentials)
                };
            } catch (e) {
                logEvents(
                    `${e.no}:${e.code}\t${e.name}\t${e.message}`,
                    "controllerHandlerErr.log"
                );
                console.log("error from loginUserController controller handler: ", e);
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    },

    /**
    * Handles the refreshing of a user's access token.
    *
    * @param {Object} httpRequest - The HTTP request object containing the cookies.
    * @return {Promise<Object>} An object containing the headers, status code, and data of the refreshed access token in JSON format.
    */
    refreshTokenUserController: ({ refreshTokenUseCaseHandler }) => async function refreshTokenUserControllerHandler(httpRequest) {

        //Iam facing problem with cooki-parser
        const { body: { refreshToken } } = httpRequest;
        if (!refreshToken) {
            return makeHttpError({
                statusCode: 400,
                errorMessage: 'Bad request. No refreshToken.'
            });
        }
        try {

            const newAccessToken = await refreshTokenUseCaseHandler({ refreshToken });

            const maxAge = {
                accessToken: process.env.JWT_REFRESH_EXPIRES_IN
            };

            // const newCookies = Object.entries(maxAge).reduce((acc, [name, age]) => {
            //     acc[name] = `${name}=${refreshToken[name]}; HttpOnly; Path=/; Max-Age=${age}; SameSite=none; Secure`;
            //     return acc;
            // }, {});
            const newCookies = Object.entries(maxAge).map(([name, age]) => `${name}=${newAccessToken}; HttpOnly; Path=/; Max-Age=${age}; SameSite=none; Secure`).join('; ');

            // we may just return this token in the body and use it on the frontend other way.
            return {
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': newCookies
                },
                statusCode: 201,
                data: JSON.stringify(newAccessToken)
            };
        } catch (e) {
            logEvents(
                `${e.no}:${e.code}\t${e.name}\t${e.TypeError}`,
                "controllerHandlerErr.log"
            );
            console.log("error from refresh token controller handler: ", e);
            const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
            return makeHttpError({ errorMessage: e.message, statusCode });
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
    logoutUserController: ({ logoutUseCaseHandler }) => {
        return async function logoutUserControllerHandler(httpRequest) {

            const { refreshToken } = httpRequest.body;
            if (!refreshToken) {
                return makeHttpError({
                    statusCode: 400,
                    errorMessage: 'Bad request. No refreshToken.'
                });
            }

            try {

                const cookies = 'accessToken=; HttpOnly; Path=/; Max-Age=0; SameSite=none; Secure,' +
                    'refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=none; Secure';
                if (!refreshToken) {
                    return {
                        headers: {
                            'Content-Type': 'application/json',
                            'Set-Cookie': cookies
                        },
                        statusCode: 204,
                        data: JSON.stringify({ measage: 'NO CONTENT' })
                    };
                }

                //calling the logout use case handler
                await logoutUseCaseHandler({ refreshToken });

                return {
                    headers: {
                        'Content-Type': 'application/json',
                        'Set-Cookie': cookies
                    },
                    statusCode: 201,
                    data: JSON.stringify({ measage: 'Successfully logged out' })
                };
            } catch (e) {
                logEvents(
                    `${e.no}:${e.code}\t${e.name}\t${e.message}`,
                    "controllerHandlerErr.log"
                );
                console.log("error from logoutUserController controller handler: ", e);
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    },

    deleteUserController: ({ deleteUserUseCaseHandler }) => {
        return async function deleteUserControllerHandler(httpRequest) {
            const { userId } = httpRequest.params;
            if (!userId) {
                return makeHttpError({
                    statusCode: 400,
                    errorMessage: 'No user Id provided'
                });
            }
            try {
                const deletedUser = await deleteUserUseCaseHandler({ userId });
                return {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    statusCode: 201,
                    data: JSON.stringify(deletedUser)
                };
            } catch (e) {
                logEvents(
                    `${e.no}:${e.code}\t${e.name}\t${e.message}`,
                    "controllerHandlerErr.log"
                );
                console.log("error from deleteUserController controller handler: ", e);
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    },

    updateUserController: ({ updateUserUseCaseHandler }) => {
        return async function updateUserControllerHandler(httpRequest) {

            const { userId } = httpRequest.params;
            const data = httpRequest.body;
            if (!userId || (!Object.keys(data).length && data.constructor === Object)) {
                return makeHttpError({
                    statusCode: 400,
                    errorMessage: 'No user Id provided'
                });
            }
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
                logEvents(
                    `${e.no}:${e.code}\t${e.name}\t${e.message}`,
                    "controllerHandlerErr.log"
                );
                console.log("error from updateUserController controller handler: ", e);
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    },

    findOneUserController: ({ findOneUserUseCaseHandler }) => {
        return async function findOneUserControllerHandler(httpRequest) {
            const { userId } = httpRequest.params;
            if (!userId) {
                return makeHttpError({
                    statusCode: 400,
                    errorMessage: 'No user Id provided'
                });
            }
            try {
                const user = await findOneUserUseCaseHandler({ userId });
                return {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    statusCode: 201,
                    data: JSON.stringify(user)
                };
            } catch (e) {
                logEvents(
                    `${e.no}:${e.code}\t${e.name}\t${e.message}`,
                    "controllerHandlerErr.log"
                );
                console.log("error from findOneUserController controller handler: ", e);
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    },

    /**
     * Handles the finding of all users.
     *
     * @return {Object} Contains headers, statusCode, and data of users in JSON format.
     */
    findAllUsersController: ({ findAllUsersUseCaseHandler }) => {
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
                logEvents(
                    `${e.no}:${e.code}\t${e.name}\t${e.message}`,
                    "controllerHandlerErr.log"
                );
                console.log("error from findAllUsersController controller handler: ", e);
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    },



    //block user
    blockUserController: ({ blockUserUseCaseHandler }) => async function blockUserControllerHandler(httpRequest) {
        const { userId } = httpRequest.params;
        if (!userId) {
            return makeHttpError({
                statusCode: 400,
                errorMessage: 'No user Id provided'
            });
        }
        try {
            const blockedUser = await blockUserUseCaseHandler({ userId });
            console.log(" from blockUserController controller handler: ", e);
            return {
                headers: {
                    'Content-Type': 'application/json'
                },
                statusCode: 201,
                data: JSON.stringify({ message: "user blocked successfully" })
            };
        } catch (e) {
            logEvents(
                `${e.no}:${e.code}\t${e.name}\t${e.message}`,
                "controllerHandlerErr.log"
            );
            console.log("error from blockUserController controller handler: ", e);
            const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
            return makeHttpError({ errorMessage: e.message, statusCode });
        }

    },


    //unblock user
    unBlockUserController: ({ unBlockUserUseCaseHandler }) => async function unBlockUserControllerHandler(httpRequest) {
        const { userId } = httpRequest.params;
        if (!userId) {
            return makeHttpError({
                statusCode: 400,
                errorMessage: 'No user Id provided'
            });
        }
        try {
            const unBlockedUser = await unBlockUserUseCaseHandler({ userId });
            console.log(" from unBlockUserController controller handler: ", unBlockedUser);
            return {
                headers: {
                    'Content-Type': 'application/json'
                },
                statusCode: 201,
                data: JSON.stringify({ message: "user unblocked successfully" })
            };
        } catch (e) {
            logEvents(
                `${e.no}:${e.code}\t${e.name}\t${e.message}`,
                "controllerHandlerErr.log"
            );
            console.log("error from unBlockUserController controller handler: ", e);
            const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
            return makeHttpError({ errorMessage: e.message, statusCode });
        }
    }
    ,
}