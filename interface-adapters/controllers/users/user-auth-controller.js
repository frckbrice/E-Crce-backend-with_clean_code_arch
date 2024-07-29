




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
    registerUserController: ({ registerUserUseCaseHandler, makeHttpError, logEvents }) => {
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
                const registeredUser = await registerUserUseCaseHandler(userInfo);
                return {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    statusCode: registeredUser.statusCode || 201,
                    data: registeredUser.insertedId ? { message: "User registered successfully" } : registeredUser
                };
            } catch (e) {
                console.error("error from register controller: ", e)
                logEvents(
                    `${"No:", e.no}:${"code: ", e.code}\t${"name: ", e.name}\t${"message:", e.message || e.ReferenceError}`,
                    "controllerHandlerErr.log"
                );
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
    loginUserController: ({ loginUserUseCaseHandler, UniqueConstraintError,
        InvalidPropertyError, makeHttpError, logEvents, bcrypt, jwt }) => {
        return async function loginUserControllerHandler(httpRequest) {

            const { email, password } = httpRequest.body;

            if (!email || !password) {
                return makeHttpError({
                    statusCode: 400,
                    errorMessage: 'Bad request. No message body.'
                });
            }

            try {
                const userCredentials = await loginUserUseCaseHandler({ email, password, bcrypt, jwt });

                const maxAge = {
                    accessTokenTime: process.env.JWT_EXPIRES_IN,
                    refreshToken: process.env.JWT_REFRESH_EXPIRES_IN
                };

                /** No NEED TO SET ACCESS TOKEN IN COOKIES */

                // const cookies = Object.entries(maxAge).map(([name, age]) => {
                //     return `${name}=${userCredentials[name]}; HttpOnly; Path=/; Max-Age=${age}; SameSite=lax; Secure`;
                // }).join('; ');

                /**
                 *  SET ONLY REFRESH TOKEN IN COOKIES
                 * we are using sameSite=lax to prevent CSRF from cross-site requests
                 *  we could have used sameSite=none to allow cross-site requests
                 * */
                const cookie =
                    `refreshToken=${userCredentials["refreshToken"]}; HttpOnly; Path=/; Max-Age=${maxAge.accessTokenTime}; SameSite=lax; Secure`;
                ;

                return {
                    headers: {
                        'Content-Type': 'application/json',
                        'Set-Cookie': cookie
                    },
                    statusCode: userCredentials.accessToken ? 201 : 401,
                    data: { accessToken: userCredentials.accessToken }
                };
            } catch (e) {
                logEvents(
                    `${"No:", e.no}:${"code: ", e.code}\t${"name: ", e.name}\t${"message:", e.message}`,
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
    refreshTokenUserController: ({ refreshTokenUseCaseHandler, UniqueConstraintError,
        InvalidPropertyError, makeHttpError, logEvents, jwt }) => async function refreshTokenUserControllerHandler(httpRequest) {

            /* 
                we need to get the refresh token from the cookies in request in order to refresh the access token
            */
            const cookies = httpRequest.cookies;
            const refreshToken = cookies.refreshToken;

            /*
                 Iam facing problem with cooki-parser from the cookie-session package 
            */
            // const { body: { refreshToken } } = httpRequest;
            if (!refreshToken) {
                return makeHttpError({
                    statusCode: 401,
                    errorMessage: 'No refresh token provided.  UNAUTHORIZED!'
                });
            }
            try {

                const newAccessToken = await refreshTokenUseCaseHandler({ refreshToken, jwt });
                console.log("from refresh token controller handler: ", newAccessToken);

                /**
                 * the token should never be stored in local storage in frontend so it should not be access via JS by hacker. instead we should store it state.
                 */
                return {
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Set-Cookie': newCookies
                    },
                    statusCode: newAccessToken ? 201 : 401,
                    data: { accessToken: newAccessToken }
                };
            } catch (e) {
                logEvents(
                    `${"No:", e.no}:${"code: ", e.code}\t${"name: ", e.name}\t${"message:", e.message}`,
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
    logoutUserController: ({ logoutUseCaseHandler, UniqueConstraintError,
        InvalidPropertyError, makeHttpError, logEvents }) => {
        return async function logoutUserControllerHandler(httpRequest) {

            /* 
              we need to get the refresh token from the cookies in request in order to refresh the access token
          */
            const cookies = httpRequest.cookies;
            const refreshToken = cookies.refreshToken;

            /* I used body here instead of cookies because of the pb with cookie-session package that did not work here. */
            // const { refreshToken } = httpRequest.body;
            if (!refreshToken) {
                return makeHttpError({
                    statusCode: 204,
                    errorMessage: ' No refreshToken.'
                });
            }

            try {

                const cookies = ' HttpOnly; Path=/; Max-Age=0; SameSite=none; Secure,' +
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
                    statusCode: 200,
                    data: JSON.stringify({ message: 'Successfully logged out' })
                };
            } catch (e) {
                logEvents(
                    `${"No:", e.no}:${"code: ", e.code}\t${"name: ", e.name}\t${"message:", e.message}`,
                    "controllerHandlerErr.log"
                );
                console.log("error from logoutUserController controller handler: ", e);
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    },

    deleteUserController: ({ deleteUserUseCaseHandler, UniqueConstraintError,
        InvalidPropertyError, makeHttpError, logEvents }) => {
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
                    `${"No:", e.no}:${"code: ", e.code}\t${"name: ", e.name}\t${"message:", e.message}`,
                    "controllerHandlerErr.log"
                );
                console.log("error from deleteUserController controller handler: ", e);
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    },

    updateUserController: ({ updateUserUseCaseHandler, UniqueConstraintError,
        InvalidPropertyError, makeHttpError, logEvents }) => {
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
                    `${"No:", e.no}:${"code: ", e.code}\t${"name: ", e.name}\t${"message:", e.message}`,
                    "controllerHandlerErr.log"
                );
                console.log("error from updateUserController controller handler: ", e);
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    },

    findOneUserController: ({ findOneUserUseCaseHandler, UniqueConstraintError,
        InvalidPropertyError, makeHttpError, logEvents }) => {
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
                    `${"No:", e.no}:${"code: ", e.code}\t${"name: ", e.name}\t${"message:", e.message}`,
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
    findAllUsersController: ({ findAllUsersUseCaseHandler, UniqueConstraintError,
        InvalidPropertyError, makeHttpError, logEvents }) => {
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
                    `${"No:", e.no}:${"code: ", e.code}\t${"name: ", e.name}\t${"message:", e.message}`,
                    "controllerHandlerErr.log"
                );
                console.log("error from findAllUsersController controller handler: ", e);
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    },



    //block user
    blockUserController: ({ blockUserUseCaseHandler, UniqueConstraintError,
        InvalidPropertyError, makeHttpError, logEvents }) => async function blockUserControllerHandler(httpRequest) {
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
                    `${"No:", e.no}:${"code: ", e.code}\t${"name: ", e.name}\t${"message:", e.message}`,
                    "controllerHandlerErr.log"
                );
                console.log("error from blockUserController controller handler: ", e);
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }

        },


    //unblock user
    unBlockUserController: ({ unBlockUserUseCaseHandler, UniqueConstraintError,
        InvalidPropertyError, makeHttpError, logEvents }) => async function unBlockUserControllerHandler(httpRequest) {
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
                    `${"No:", e.no}:${"code: ", e.code}\t${"name: ", e.name}\t${"message:", e.message}`,
                    "controllerHandlerErr.log"
                );
                console.log("error from unBlockUserController controller handler: ", e);
                const statusCode = e instanceof UniqueConstraintError || e instanceof InvalidPropertyError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    ,


    // user controller for forgot password
    forgotPasswordController: ({ forgotPasswordUseCaseHandler, UniqueConstraintError,
        InvalidPropertyError, makeHttpError, logEvents, sendEmail }) => async function forgotPasswordControllerHandler(httpRequest) {

            const { email } = httpRequest.body;
            if (!email) {
                return makeHttpError({
                    statusCode: 400,
                    errorMessage: 'No email provided'
                });
            }

            forgotPasswordUseCaseHandler({ email }).then((forgotPasswordUserData) => {

                if (forgotPasswordUserData) {
                    //fire the email sending event
                    const token = forgotPasswordUserData.token;
                    const resetPasswordLink = `http://localhost:5000/users/auth/reset-password/${token}`
                    sendEmail({ userEmail: email, resetPasswordLink });
                    return {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        statusCode: 204,
                        data: `reset password link sent to your email ${email}`,
                    };
                }
            }).catch((e) => {
                logEvents(
                    `${"No:", e.no}:${"code: ", e.code}\t${"name: ", e.name}\t${"message:", e.message}`,
                    "controllerHandlerErr.log"
                );
                console.log("error from forgotPasswordController controller handler: ", e);
                return makeHttpError({ errorMessage: e.message, statusCode: e.statusCode });
            });


        },

    //reset password
    resetPasswordController: ({ resetPasswordUseCaseHandler, UniqueConstraintError }) => {
        return async function resetPasswordControllerHandler(httpRequest) {

            const { token } = httpRequest.params;
            const { password } = httpRequest.body;
            if (!token || !password) {
                return makeHttpError({
                    statusCode: 400,
                    errorMessage: 'No token or password provided'
                });
            }
            try {
                const resetPassword = await resetPasswordUseCaseHandler({ token, password });
                return {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    statusCode: 201,
                    data: resetPassword.id ? { message: "password reset successfully" } : { message: "resetPassword failed! hindly try again after some time" }
                };
            } catch (e) {
                logEvents(
                    `${"No:", e.no}:${"code: ", e.code}\t${"name: ", e.name}\t${"message:", e.message}`,
                    "controllerHandlerErr.log"
                );
                console.log("error from resetPasswordController controller handler: ", e);
                const statusCode = e instanceof UniqueConstraintError ? 400 : 500;
                return makeHttpError({ errorMessage: e.message, statusCode });
            }
        }
    }

}
