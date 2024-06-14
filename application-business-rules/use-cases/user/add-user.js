const { makeUser } = require("../../../enterprise-business-rules/entities");
const { UniqueConstraintError, InvalidPropertyError } = require("../../../interface-adapters/config/validators-errors/errors");
const { makeHttpError } = require("../../../interface-adapters/config/validators-errors/http-error");
const jwt = require("jsonwebtoken");

module.exports = {

  registerUserUseCase: ({ dbUserHandler }) => {
    return async function registerUserUserCaseHandler(userData) {

      try {

        //validate the user data after sanitizing it.
        const validatedUser = await makeUser(userData);

        // check the existance of this user in DB
        let existingUser = await dbUserHandler.findUserByEmail(validatedUser)

        // check if the result come from my DB controller
        if (Array.isArray(existingUser) && existingUser.length > 0) {
          return makeHttpError({
            errorMessage: "user already exists",
            statusCode: 409
          })
        }

        return await dbUserHandler.registerUser(validatedUser);
      } catch (error) {
        console.log(error);
        return makeHttpError({
          errorMessage: error.message,
          statusCode: 400
        })
      }
    }
  },


}