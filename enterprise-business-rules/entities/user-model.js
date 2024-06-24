const { logEvents } = require("../../interface-adapters/middlewares/loggers/logger");

module.exports = {

    makeUserModel: ({ normalise, validateUserData , validateUserDataUpdates}) => {

        return async function makeUser({userData, update = false}) {

            try {
                if (update) {
                    validatedUserData = await validateUserDataUpdates({...userData});
                    
                }else{
                    validatedUserData = await validateUserData({...userData});
                }
                normalisedUserData = await normalise(validatedUserData);
                return Object.freeze(normalisedUserData) 
            } catch (error) {
                console.log("Error from user-model handler: ", error);
                logEvents(
                   `${error.no}:${error.code}\t${error.name}\t${error.message}`,
                    "user-model.log"
                );
            }
            let normalisedUserData, validatedUserData;
            
        }
    }
}