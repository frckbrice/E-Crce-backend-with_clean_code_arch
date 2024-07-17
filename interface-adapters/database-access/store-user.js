const { ObjectId } = require("mongodb");
const { UniqueConstraintError } = require("../validators-errors/errors");

/**
 * Asynchronously finds a user by email in the given database connection.
 *
 * @param {string} email - The email of the user to find.
 * @param {Function} dbconnection - The function that returns a database connection.
 * @return {Promise<Array<Object>|null>} A promise that resolves to an array of user objects, or null if an error occurred.
 * Each user object contains the following properties:
 *   - id: The ID of the user.
 *   - email: The email of the user.
 *   - firstName: The first name of the user.
 *   - lastName: The last name of the user.
 *   - mobile: The mobile number of the user.
 */
async function findUserByEmail(email, dbconnection) {

    const db = await dbconnection()
    try {
        const user = await db.collection('users').findOne({ email }, { projection: { _id: 1, email: 1, firstName: 1, lastName: 1, mobile: 1, roles: 1, active: 1, isBlocked: 1 } });
        if (!user) {
            return null;
        }
        const id = user._id.toString();
        delete user._id;
        delete user.password;
        return { id, ...user };

    } catch (error) {
        console.log("error checking for thexistence of user in DB", error);
    }
}

/**
 * Retrieves a user from the database by their ID.
 *
 * @param {string} id - The ID of the user.
 * @param {Function} dbconnection - The database connection function.
 * @return {Promise<Object|null>} A promise that resolves to a user object with the following properties:
 *   - id: The ID of the user.
 *   - email: The email of the user.
 *   - firstName: The first name of the user.
 *   - lastName: The last name of the user.
 *   - mobile: The mobile number of the user.
 *   - null if the user is not found.
 */
async function findUserById(id, dbconnection) {

    const newID = new ObjectId(id);
    const db = await dbconnection();
    try {
        const user = await db.collection('users').findOne({ _id: newID }, { projection: { _id: 1, email: 1, firstName: 1, lastName: 1, mobile: 1, roles: 1, active: 1, isBlocked: 1 } });
        if (!user) {
            return null;
        }
        const id = user._id.toString();
        delete user._id;
        delete user.password;
        return { id, ...user };
    } catch (error) {
        console.log("error checking for thexistence of user in DB", error);
        return null;
    }
}

// find user by token
async function findUserByToken(token, dbconnection) {

    const db = await dbconnection();
    try {
        const user = await db.collection('users').findOne({ passwordResetToken: token }, { projection: { _id: 1, email: 1, firstName: 1, lastName: 1 } });
        if (!user) {
            return null;
        }
        const id = user._id.toString();
        delete user._id;
        delete user.password;
        return { id, ...user };
    } catch (error) {
        console.log("error checking for thexistence of user in DB", error);
        return null;
    }
}

/**
 * Retrieves a user from the database by their email for login.
 *
 * @param {string} email - The email of the user.
 * @param {Function} dbconnection - The database connection function.
 * @return {Promise<Object|null>} A promise that resolves to a user object with the following properties:
 *   - id: The ID of the user.
 *   - email: The email of the user.
 *   - null if the user is not found.
 */
async function findUserByEmailForLogin(email, dbconnection) {

    const db = await dbconnection()
    try {
        const user = await db.collection('users').findOne({ email }, { projection: { _id: 1, email: 1, roles: 1, password: 1 } });
        console.log(" checking for the xistence of user in DB", user);
        if (!user) {
            return null;
        }

        return {
            id: user._id.toString(),
            email: user.email,
            roles: user.roles,
            password: user.password
        };
    } catch (error) {
        console.log("error checking for thexistence of user in DB", error);
        throw new Error("Error finding user by email for login: ", error.stack);
    }
}

/**
 * Registers a user in the database.
 *
 * @param {Object} userData - The user data to be registered.
 * @param {Function} dbconnection - The database connection function.
 * @return {Promise<Object>} The inserted user document.
 * @throws {UniqueConstraintError} If the email already exists in the database.
 */
async function registerUser(userData, dbconnection) {

    const db = await dbconnection()
    try {
        const result = await db.collection('users').insertOne({ ...userData });
        // console.log("result: ", result);
        return result

    } catch (error) {
        logEvents(
            `${error.no}:${error.code}\t${error.name}\t${error.message}`,
            "user-db.log"
        );
        if (error instanceof UniqueConstraintError) {
            throw error;
        }

        console.error("error registering the user to DB: ", error);
        return null;
    }

}

/**
 * Retrieves all users from the database.
 *
 * @param {Function} dbconnection - A function that returns a database connection.
 * @return {Promise<Array<Object>>} A promise that resolves to an array of user objects, each containing the user's id, email, first name, last name, and mobile number.
 */
async function findAllUsers(dbconnection) {

    const db = await dbconnection()
    const result = await db.collection('users').find({}, { projection: { _id: 1, email: 1, firstName: 1, lastName: 1, mobile: 1, roles: 1, active: 1 } }).toArray()
    return result.map(({ _id: id, email, firstName, lastName, mobile, roles, active }) => ({
        id: id.toString(),
        email,
        firstName,
        lastName,
        mobile,
        roles,
        active
    }));
}

/**
 * Updates a user in the database with the provided userData.
 *
 * @param {Object} params - The parameters for updating the user.
 * @param {string} params._id - The ID of the user to update.
 * @param {Object} params.userData - The data to update the user with.
 * @param {Function} params.dbconnection - A function that returns a database connection.
 * @return {Promise<Object|null>} A promise that resolves to an object containing the updated user if successful, or null if the update failed.
 */
async function updateUser({ id, dbconnection, ...userData }) {

    const newID = new ObjectId(id);

    const db = await dbconnection()
    const user = await db
        .collection('users')
        .findOneAndUpdate({ _id: newID }, { $set: { ...userData } }, { projection: { _id: 1, email: 1, firstName: 1, lastName: 1, mobile: 1, roles: 1, active: 1 } });

    const newid = user._id.toString();
    delete user._id;
    delete user.password;
    return { id: newid, ...user };
}

/**
 * Deletes a user from the database with the provided ID.
 *
 * @param {Object} params - The parameters for deleting the user.
 * @param {string} params._id - The ID of the user to delete.
 * @return {Promise<void>} A promise that resolves when the user is deleted.
 */
async function deleteUser({ id, dbconnection }) {
    const newId = new ObjectId(id);
    const db = await dbconnection();
    const deletedUser = await db.collection('users').deleteOne({ _id: newId });

    return deletedUser.deletedCount
}


/**
 * Creates a frozen object with methods for interacting with the user database.
 *
 * @param {Object} options - The options for creating the user database object.
 * @param {Function} options.dbconnection - A function that returns a database connection.
 * @return {Object} A frozen object with methods for interacting with the user database.
 */
module.exports = function makeUserdb({ dbconnection }) {

    return Object.freeze({
        findAllUsers: async () => findAllUsers(dbconnection),
        findUserByEmail: async ({ email }) => findUserByEmail(email, dbconnection),
        findUserById: async ({ id }) => findUserById(id, dbconnection),
        findUserByToken: async ({ token }) => findUserByToken(token, dbconnection),
        registerUser: async (userData) => registerUser(userData, dbconnection),
        findUserByEmailForLogin: async ({ email }) => findUserByEmailForLogin(email, dbconnection),
        updateUser: async ({ id, ...userData }) => updateUser({ id, dbconnection, ...userData }),
        deleteUser: async ({ id }) => deleteUser({ id, dbconnection }),
    })
}



// /**
//  * Creates a frozen object with methods for interacting with the user database.
//  *
//  * @param {Object} options - The options for creating the user database object.
//  * @param {Function} options.dbconnection - A function that returns a database connection.
//  * @return {Object} A frozen object with methods for interacting with the user database.
//  */
// module.exports = ({ dbconnection }) => Object.freeze({
//     findAllUsers: async () => (await dbconnection()).collection('users').find({}, { projection: { _id: 1, email: 1, firstName: 1, lastName: 1, mobile: 1 } }).toArray().then(result => result.map(({ _id: id, email, firstName, lastName, mobile }) => ({
//         id: id.toString(),
//         email,
//         firstName,
//         lastName,
//         mobile
//     }))),
//     findUserByEmail: async ({ email }) => (await dbconnection()).collection('users').findOne({ email }),
//     registerUser: async (userData) => (await dbconnection()).collection('users').insertOne(userData),
//     findUserByEmailForLogin: async ({ email }) => (await dbconnection()).collection('users').find({ email }).limit(1).toArray().then(result => result[0]),
//     updateUser: async ({ id: _id, userData }) => (await dbconnection()).collection('users').updateOne({ _id }, { $set: userData }),
//     deleteUser: async ({ id: _id }) => (await dbconnection()).collection('users').deleteOne({ _id }).then(result => result.deletedCount),
// })
