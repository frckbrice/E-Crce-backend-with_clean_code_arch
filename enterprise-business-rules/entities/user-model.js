
module.exports = {

    makeUserModel: ({ userValidation, logEvents, sanitize }) => {
        return async function makeUser({ userData, update = false }) {

            console.log("hit user model: ");
            const {
                validateUserData,
                normalise,
                validateUserDataUpdates,
            } = userValidation;
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

                /* normalize text props */
                const { firstName, lastName, email } = validatedUserData;
                normalisedUserData = await normalise(sanitize, firstName, lastName, email);
                return Object.freeze({
                    normalisedUserData: { ...normalisedUserData, ...validatedUserData },
                })
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
