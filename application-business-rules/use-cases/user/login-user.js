const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports = {

  loginUserUseCase: ({dbUserHandler}) => {

    return async function loginUserUseCaseHandler(userData) {

      const { email, password } = userData;

      console.log("email", email, "password", password);
      //basic verification
      if (!email || !password) {
        throw new RequiredParameterError("email or password")
      }

      try {
           //check the existance of this user in DB
      let existingUser = await dbUserHandler.findUserByEmailForLogin({email});

      if (!existingUser[0].id) {
        throw new NotFoundError("user not found");
      }

      //check the password
      const matchPasswd = await bcrypt.compare(password, existingUser[0].password);
      if (!matchPasswd) {
        throw new InvalidPropertyError("password");
      }

      //create the JWT
      const accessToken = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      //create refresh token 
      const refreshToken = jwt.sign({ email }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
      });

      // return tokens: access and refresh to renew the accesstoken when expires
      return {accessToken, refreshToken};
      } catch (error) {
        console.log("login error", error);
        throw new Error(" failed to login: ", error.stack);
      }
   
    }
  },

}