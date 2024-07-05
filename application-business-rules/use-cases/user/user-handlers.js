const { makeUser, validateId, validateUserDataUpdates } = require("../../../enterprise-business-rules/entities");
const { UniqueConstraintError, InvalidPropertyError, RequiredParameterError } = require("../../../interface-adapters/validators-errors/errors");
const { makeHttpError } = require("../../../interface-adapters/validators-errors/http-error");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { logEvents } = require("../../../interface-adapters/middlewares/loggers/logger");


module.exports = {

  /**
   * Registers a user in the database using the provided user data.
   *
   * @param {Object} dbUserHandler - An object that handles user operations in the database.
   * @param {Object} userData - The user data to be validated and registered.
   * @return {Promise<Object|Error>} Returns a promise that resolves to the registered user object or rejects with an error.
   * @throws {HttpError} Throws an HttpError if the user already exists or if there is an error during registration.
   */
  registerUserUseCase: ({ dbUserHandler, entityModels }) => async function registerUserUseCaseHandler(userData) {

    const { makeUser } = entityModels;
    try {
      const validatedUser = await makeUser({ userData });
      const { email } = validatedUser;
      const existingUser = await dbUserHandler.findUserByEmail({ email });

      if (existingUser) {
        return makeHttpError({
          errorMessage: "this email already exists",
          statusCode: 409
        });
      } else {
        return await dbUserHandler.registerUser(validatedUser);
      }

    } catch (error) {
      console.log("error from register use case handler: ", err);
      logEvents(
        `${error.no}:${error.code}\t${error.syscall}\t${error.hostname}`,
        "userHandlerErr.log"
      );
      throw makeHttpError({
        errorMessage: error.message,
        statusCode: 400
      });
    }
  },


  /**
 * Asynchronously handles the login use case for a user.
 *
 * @param {Object} userData - An object containing the user's email and password.
 * @param {Object} dbUserHandler - An object responsible for handling user-related database operations.
 * @throws {RequiredParameterError} If either the email or password is missing.
 * @throws {NotFoundError} If the user is not found in the database.
 * @throws {InvalidPropertyError} If the provided password does not match the stored password.
 * @return {Promise<Object>} An object containing the access token and an empty refresh token.
 */
  loginUserUseCase: ({ dbUserHandler }) => {

    return async function loginUserUseCaseHandler(userData) {

      const { email, password } = userData;

      //basic verification
      if (!email || !password) {
        return makeHttpError({
          errorMessage: "Missing email or password",
          statusCode: 400
        });
      }

      try {
        //check the existance of this user in DB
        let existingUser = await dbUserHandler.findUserByEmailForLogin({ email });

        if (!existingUser?.id) {
          return makeHttpError({
            errorMessage: "USER NOT FOUND! LOGGIN FIRST",
            statusCode: 401
          });
        }

        //check the password
        const matchPasswd = await bcrypt.compare(password, existingUser.password);
        if (!matchPasswd) {
          return makeHttpError({
            errorMessage: "Bad credentials! UNAUTHORIZED",
            statusCode: 401
          });
        }

        //create the JWT
        const accessToken = jwt.sign({
          id: existingUser?.id,
          email,
          roles: existingUser?.roles
        }, process.env.ACCESS_TOKEN_SECRETKEY, {
          expiresIn: process.env.JWT_EXPIRES_IN
        });

        //create refresh token 
        const refreshToken = jwt.sign({ email }, process.env.JWT_REFRESH_SECRET, {
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
        });

        // return tokens: access and refresh to renew the accesstoken when expires
        return {
          accessToken: accessToken,
          refreshToken: refreshToken
        };
      } catch (error) {
        console.log("error from login use case: ", error);
        logEvents(
          `${error.no}:${error.code}\t${error.name}\t${error.message}`,
          "userHandlerErr.log"
        );
        return makeHttpError({
          errorMessage: "failed to log in",
          statusCode: 500
        });;
      }

    }
  },


  /**
 * Returns a function that fetches all users from the database and returns them.
 *
 * @param {Object} dbUserHandler - An object containing a function to fetch all users from the database.
 * @return {Promise<{allUsers: Array}>} A promise that resolves to an object containing all users.
 * @throws {new Error} If no users are found in the database.
 */
  findAllUsersUseCase: ({ dbUserHandler }) => {

    return async function findAllUsersUseCaseHandler() {
      try {
        const allUsers = await dbUserHandler.findAllUsers();

        return allUsers || [];
      } catch (error) {
        logEvents(
          `${error.no}:${error.code}\t${error.name}\t${error.message}`,
          "userHandlerErr.log"
        );
        throw new Error("Error fetching all users: " + error.stack);
      }
    }
  },


  /**
* Returns a function that fetches a user from the database by either their ID or email.
*
* @param {Object} dbUserHandler - An object containing functions to fetch a user by ID or email.
* @return {Promise<{user: Object}>} A promise that resolves to an object containing the user.
* @throws {new Error} If the user is not found.
*/
  findOneUserUseCase: ({ dbUserHandler }) => {
    return async function findOneUserUseCaseHandler({ userId, email }) {

      const newId = validateId(userId);
      const validEmail = validateUserDataUpdates({ email });
      try {
        if (email) { // email defined
          const user = await dbUserHandler.findUserByEmail({ email: validEmail });

          if (!user) {
            throw new Error("user not found");
          }
          return user;
        }
        //for userID defined
        const user = await dbUserHandler.findUserById({ id: newId });
        if (!user) {
          throw new Error(`user with id ${userId} not found`);
        }
        return user;
      } catch (error) {
        console.log("Error from fetching user  use case handler: ", error);
        logEvents(
          `${error.no}:${error.code}\t${error.name}\t${error.message}`,
          "userHandlerErr.log"
        );
        throw new Error("Error fetching user use case: " + error.stack);
      }
    }
  },


  /**
* Returns a function that updates a user in the database by their ID with the provided data.
*
* @param {Object} dbUserHandler - An object containing a function to update a user in the database.
* @return {Promise<Object>} A promise that resolves to an object containing the updated user.
* @throws {RequiredParameterError} If the ID is not provided.
* @throws {new Error} If the user is not found.
*/
  updateUserUseCase: ({ dbUserHandler }) => async function updateUserUseCaseHandler({ userId, ...userData }) {

    const newId = validateId(userId);
    try {
      if (!userId) {
        throw new RequiredParameterError("id not found");
      }

      // check first if the user exist
      const user = await dbUserHandler.findUserById({ id: newId });
      if (!user) {
        throw new Error("Cannot update. User not exist. register first");
      }

      // check for duplicate user
      const duplicateUser = await dbUserHandler.findUserByEmail({ email: userData.email });
      if (duplicateUser && duplicateUser.id.toString() !== userId.toString()) {
        throw makeHttpError({
          errorMessage: "user already exists",
          statusCode: 409
        });;
      }

      // validate user data
      const validatedUserData = makeUser({ userData, update: true });
      //update user
      const updatedUser = await dbUserHandler.updateUser({ id: newId, ...validatedUserData });
      return updatedUser;
    } catch (error) {
      console.log("Error from updating  use case handler: ", error);
      logEvents(
        `${error.no}:${error.code}\t${error.name}\t${error.message}`,
        "userHandlerErr.log"
      );
      throw new Error("Error updating user: " + error.stack);
    }
  },


  /**
* Deletes a user from the database.
*
* @param {Object} dbUserHandler - An object containing a function to delete a user from the database.
* @return {Promise<Object>} A promise that resolves to an object containing the deleted user.
* @throws {RequiredParameterError} If the ID is not provided.
* @throws {new Error} If the user is not found.
*/
  deleteUserUseCase: ({ dbUserHandler }) => {
    return async function deleteUserUseCaseHandler({ userId }) {

      const newId = validateId(userId);
      try {
        if (!userId) {
          throw new RequiredParameterError("id not found");
        }

        // check first if the user exist
        const checkExistngUser = await dbUserHandler.findUserById({ id: newId });
        if (!checkExistngUser) {
          throw new Error("Cannot delete. User not exist. register first");
        }
        const user = await dbUserHandler.deleteUser({ id: newId });
        if (!user) {
          throw new Error("user not found");
        }
        return user;
      } catch (error) {
        console.log("Error from deleting  use case handler: ", error);
        logEvents(
          `${error.no}:${error.code}\t${error.name}\t${error.message}`,
          "userHandlerErr.log"
        );
        throw new Error("Error deleting user: " + error.stack);
      }
    }
  },


  /**
* Refreshes the access token for a user using the provided refresh token.
*
* @param {Object} dbUserHandler - An object containing a function to find a user by email.
* @param {string} refreshToken - The refresh token to be used for token refresh.
* @return {Promise<Object>} A promise that resolves to an object containing the decoded user information.
* @throws {RequiredParameterError} If the refresh token is not provided.
* @throws {new Error} If the user is not found.
* @throws {Error} If there is an error refreshing the token.
*/
  refreshTokenUseCase: ({ dbUserHandler }) => {
    return async function refreshTokenUseCaseHandler({ refreshToken }) {

      try {
        console.log(`refreshToken: ${refreshToken}`);
        return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async function (err, decoded) {
          if (err) {
            console.log("from refresh handler: ", err)
            throw new Error(err.message);
          }
          const user = await dbUserHandler.findUserByEmail({ email: decoded.email });
          if (!user) {
            throw new Error(err.message);
          }

          //recontruct new accessToken
          const accessToken = jwt.sign({
            id: user.id,
            email: user.email,
            roles: user.roles
          },
            process.env.ACCESS_TOKEN_SECRETKEY,
            { expiresIn: process.env.JWT_EXPIRES_IN });

          return accessToken;
        });
      } catch (error) {
        console.log("Error from refresh token use case handler: ", error);
        logEvents(
          `${error.no}:${error.code}\t${error.name}\t${error.message}`,
          "userHandlerErr.log"
        );
        throw new Error("Error refreshing token: ", error);
      }
    }
  },


  /**
  * A description of the entire function.
  *
  * @param {string} refreshToken - The refresh token to be used for logout.
  * @return {Object} An object containing the access token and refresh token.
  */
  logoutUseCase: () => {
    return async function logoutUseCaseHandler({ refreshToken }) {
      try {
        if (!refreshToken) {
          throw new RequiredParameterError("refreshToken not found");
        }
      } catch (error) {
        console.log("Error from logoutUseCase user use case handler: ", error);
        logEvents(
          `${error.no}:${error.code}\t${error.name}\t${error.message}`,
          "userHandlerErr.log"
        );
        throw new Error("Error logging out: " + error.stack);
      }
    }
  },

  //block user
  blockUserUseCase: ({ dbUserHandler }) => {
    return async function blockUserUseCaseHandler({ userId }) {

      const newId = validateId(userId);

      try {
        if (!newId) {
          throw new RequiredParameterError("id not found");
        }
        const user = await dbUserHandler.findUserById({ id: newId });
        if (!user) {
          throw new Error("user not found");
        }
        const blockedUser = await dbUserHandler.updateUser({ id: newId, isBlocked: true });
        if (!blockedUser) {
          throw new Error("user not found");
        }
        return blockedUser;
      } catch (error) {
        console.log("Error from block user use case handler: ", error);
        logEvents(
          `${error.no}:${error.code}\t${error.name}\t${error.message}`,
          "userHandlerErr.log"
        );
        throw new Error("Error block user: " + error.stack);
      }
    }
  },

  //un-block user
  unBlockUserUseCase: ({ dbUserHandler }) => {
    return async function unBlockUserUseCaseHandler({ userId }) {

      const newId = validateId(userId);

      try {
        if (!newId) {
          throw new RequiredParameterError("id not found");
        }
        const user = await dbUserHandler.findUserById({ id: newId });
        if (!user) {
          throw new Error("user not found");
        }
        const unBlockedUser = await dbUserHandler.updateUser({ id: newId, isBlocked: false });
        if (!unBlockedUser) {
          throw new Error("user not found");
        }
        return unBlockedUser;
      } catch (error) {
        console.log("Error from unblock user use case handler: ", error);
        logEvents(
          `${error.no}:${error.code}\t${error.name}\t${error.message}`,
          "userHandlerErr.log"
        );
        throw new Error("Error unblock user: " + error.stack);
      }
    }
  }
}
