const { UniqueConstraintError, InvalidPropertyError, RequiredParameterError } = require("../../config/validators-errors/errors");
const {makeHttpError} = require("../../config/validators-errors/http-error");

module.exports = {
    registerUserController: ({ registerUserUserCaseHandler }) => {
        return async function createUserControllerHandler(httpRequest) {

            const userData =  { firstName,
                lastName,
                email,
                mobile,
                password, } = httpRequest.body

            if (!userData) {
                return makeHttpError({
                    statusCode: 400,
                    errorMessage: 'Bad request. No POST body.'
                })
            }

            let userInfo;
            if (typeof httpRequest.body === 'string') {
                try {
                    userInfo = JSON.parse(userData)
                } catch {
                    return makeHttpError({
                        statusCode: 400,
                        errorMessage: 'Bad request. POST body must be valid JSON.'
                    })
                }
            }

            try {
                const contact =await registerUserUserCaseHandler(userInfo ?? userData);
                return {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    statusCode: 201,
                    data: JSON.stringify(contact)
                }
            } catch (e) {
                return makeHttpError({
                    errorMessage: e.message,
                    statusCode:
                        e instanceof UniqueConstraintError
                            ? 409
                            : e instanceof InvalidPropertyError ||
                                e instanceof RequiredParameterError
                                ? 400
                                : 500
                })
            }

        }
    },
}