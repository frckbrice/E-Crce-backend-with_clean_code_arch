module.exports = {

    makeUserModel: ({ normalise, validateUserData }) => {

        return async function makeUser(userData) {

            const validatedUserData =await validateUserData({...userData});
            const normalisedUserData = normalise(validatedUserData);
            return Object.freeze(normalisedUserData)
        }
    }
}