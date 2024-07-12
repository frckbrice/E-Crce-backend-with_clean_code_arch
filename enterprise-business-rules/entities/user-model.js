const { logEvents } = require("../../interface-adapters/middlewares/loggers/logger");

module.exports = {

    makeUserModel: ({ productValidation }) => {
        return async function makeUser({ userData, update = false }) {

            console.log("hit user model: ");
            const { normalise, validateUserData, validateUserDataUpdates } = productValidation;
            let normalisedUserData = {}, validatedUserData = null;
            try {
                // for update user data we have to set "update = true" from the user handler
                if (update) {
                    validatedUserData = await validateUserDataUpdates({ ...userData });
                    console.log("hit user model after validate user data for update true: ");
                } else {
                    validatedUserData = await validateUserData({ ...userData });
                    console.log("hit user model after validate user data for update false: ");
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
        }
    }
}
