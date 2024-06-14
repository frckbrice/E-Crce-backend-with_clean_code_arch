const { UniqueConstraintError, InvalidPropertyError, RequiredParameterError } = require("../../config/validators-errors/errors");
const { makeHttpError } = require("../../config/validators-errors/http-error");

module.exports = {
    loginUserController: ({ loginUserUseCaseHandler }) => {
        return async function loginUserControllerHandler(httpRequest) {

            console.log("httpRequest", httpRequest);

            const { email, password } = httpRequest.body;

            if (!email || !password) {
                throw new RequiredParameterError("email or password");
            }

            try {
                const userCredentials = await loginUserUseCaseHandler({ email, password });
                // const { accessToken, refreshToken } = userCredentials;

                // console.log("userCredentials", userCredentials);
                const maxAge = {
                    accessToken: process.env.JWT_EXPIRES_IN,
                    refreshToken: process.env.JWT_REFRESH_EXPIRES_IN
                };

                const cookies = Object.entries(maxAge).map(([name, age]) => {
                    return `${name}=${userCredentials[name]}; HttpOnly; Path=/; Max-Age=${age}; SameSite=none; Secure`;
                }).join('; ');

                console.log("cookies", cookies);

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
    }

}