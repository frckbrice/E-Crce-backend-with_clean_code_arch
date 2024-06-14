const { makeUser } = require("../../../enterprise-business-rules/entities");
const { UniqueConstraintError, InvalidPropertyError,RequiredParameterError } = require("../../../interface-adapters/config/validators-errors/errors");
const { makeHttpError } = require("../../../interface-adapters/config/validators-errors/http-error");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const NotFoundError = require("../../../interface-adapters/config/validators-errors/errors");

module.exports = {

  /**
   * Registers a user in the database using the provided user data.
   *
   * @param {Object} dbUserHandler - An object that handles user operations in the database.
   * @param {Object} userData - The user data to be validated and registered.
   * @return {Promise<Object|Error>} Returns a promise that resolves to the registered user object or rejects with an error.
   * @throws {HttpError} Throws an HttpError if the user already exists or if there is an error during registration.
   */
  registerUserUseCase: ({ dbUserHandler }) => async function registerUserUseCaseHandler(userData){
    try {
      const validatedUser = await makeUser(userData);
      const existingUser = await dbUserHandler.findUserByEmail(validatedUser);

      if (existingUser.length > 0) {
        throw new makeHttpError({
          errorMessage: "user already exists",
          statusCode: 409
        });
      }

      return await dbUserHandler.registerUser(validatedUser);
    } catch (error) {
      console.log(error);
      throw new makeHttpError({
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
    loginUserUseCase: ({dbUserHandler}) => {

      return async function loginUserUseCaseHandler(userData) {
  
        const { email, password } = userData;
  
        //basic verification
        if (!email || !password) {
          throw new RequiredParameterError("email or password")
        }
  
        try {
             //check the existance of this user in DB
        let existingUser = await dbUserHandler.findUserByEmailForLogin({email});
  
        if (!existingUser.id) {
          throw new Error("user not found");
        }
  
        //check the password
        const matchPasswd = await bcrypt.compare(password, existingUser[0].password);
        if (!matchPasswd) {
          throw new InvalidPropertyError("No Matching! UNAUTHORIZED");
        }
  
        //create the JWT
        const accessToken = jwt.sign({ 
          id: existingUser.id, 
          email,
          roles: existingUser.roles }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN
        });
  
        //create refresh token 
        // const refreshToken = jwt.sign({ email }, process.env.JWT_REFRESH_SECRET, {
        //   expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
        // });
  
        // return tokens: access and refresh to renew the accesstoken when expires
        return {accessToken, refreshToken : ""};
        } catch (error) {
          console.log("login error", error);
          throw new Error(" failed to login: ", error.stack);
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
    findAllUsersUseCase: ({dbUserHandler}) => {
  
      return async function findAllUsersUseCaseHandler() {
        try {
          const allUsers = await dbUserHandler.findAllUsers();
          console.log(allUsers);
          return allUsers || [];
        } catch (error) {
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
    findOneUserUseCase: ({dbUserHandler}) => {
      return async function findOneUserUseCaseHandler({userId, email}) {
        try {
          if(email) { // email defined
            const user = await dbUserHandler.findUserByEmail({email});
            
            if (!user) {
              throw  new Error("user not found");
            }
            return user;
          }
          //for userID defined
          const user = await dbUserHandler.findUserById({id: userId});
          if (!user) {
            throw  new Error(`user with id ${userId} not found`);
          }
          return user;
        } catch (error) {
          throw new Error("Error fetching user: " + error.stack);
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
    updateUserUseCase: ({dbUserHandler}) => async function updateUserUseCaseHandler({userId, ...userData}) {
      try {
        if(!userId){
          throw new RequiredParameterError("id not found");
        }

        // check first if the user exist
        const user = await dbUserHandler.findUserById({id:userId});
        if (!user) {
          throw new Error("Cannot update. User not exist. register first");
        }

        // check for duplicate user
        const duplicateUser = await dbUserHandler.findUserByEmail({email: userData.email});
        if (duplicateUser.length > 0 && duplicateUser[0].id.toString() !== userId.toString()) {
          throw  new makeHttpError({
            errorMessage: "user already exists",
            statusCode: 409
          });;
        }

        //update user
        const updatedUser = await dbUserHandler.updateUser({id:userId, ...userData});
        return updatedUser;
      } catch (error) {
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
    deleteUserUseCase: ({dbUserHandler}) => {
      return async function deleteUserUseCaseHandler({id}) {
  
        try {
          if(!id){
            throw new RequiredParameterError("id not found");
          }

          // check first if the user exist
          const checkExistngUser = await dbUserHandler.findUserById({id});
          if (!checkExistngUser.length>0) {
            throw  new Error("Cannot delete. User not exist. register first");
          }
          const user = await dbUserHandler.deleteUser({id});
          if (!user) {
            throw  new Error("user not found");
          }
          return { user };
        } catch (error) {
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
    refreshTokenUseCase: ({dbUserHandler}) => {
      return async function refreshTokenUseCaseHandler(refreshToken) {
        try {
          if(!refreshToken){
            throw new RequiredParameterError("refreshToken not found");
          }
          return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async function(err, decoded) {
            if (err) {
              throw new Error("user not found! UNAUTHORIZED");
            }
            const user = await dbUserHandler.findUserByEmail({email: decoded.email});
            if (!user) {
              throw new Error("user not found! UNAUTHORIZED");
            }
  
            //recontruct new accessToken
            const accessToken = jwt.sign({ 
              id: user[0].id, 
              email: user[0].email,
              roles: user[0].roles },
              process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN});


            return accessToken;
          });
        } catch (error) {
          throw new Error("Error refreshing token: " + error.stack);
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
      return async function logoutUseCaseHandler({refreshToken}) {
        try {
          if(!refreshToken){
            throw new RequiredParameterError("refreshToken not found");
          }
        } catch (error) {
          throw new Error("Error refreshing token: " + error.stack);
        }
      }
    },
  
}