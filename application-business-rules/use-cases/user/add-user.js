const {makeUser} = require("../../../enterprise-business-rules/entities");
const { UniqueConstraintError, InvalidPropertyError } = require("../../../interface-adapters/config/validators-errors/errors");
const { makeHttpError } = require("../../../interface-adapters/config/validators-errors/http-error");

module.exports = {

    addUserUseCase: ({dbUserHandler}) => {
        return async function addUser (userData){


            try {
                 //validate the user data after sanitizing it.
                 const validatedUser =await makeUser(userData);

                 /// check the existance of this user in DB
                 const existingUser = await dbUserHandler.findUserByEmail(validatedUser);
                 if(existingUser){
                    console.log("user already exists: ", existingUser);
                    existingUser;
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
    }
}

