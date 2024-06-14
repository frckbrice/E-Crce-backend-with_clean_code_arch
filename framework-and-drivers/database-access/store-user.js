const { ReturnDocument } = require("mongodb");

async function findUserByEmail(email, dbconnection) {

    const db = await dbconnection()
    try {
        const result = await db.collection('users').find({ email })
        // const found = await result.toArray()
        // console.log(" result from DB checking", result)
        return (await result.toArray()).map(({ _id: id, ...found }) => ({
            id,
            ...found
          })) 
    } catch (error) {
        console.log("error checking for thexistence of user in DB", error);
        return null;
    }
}

async function registerUser(userData, dbconnection) {

    const db = await dbconnection()
    try {
        //insert document and return the inserted document
        const result = await db
        .collection('users')
        .insertOne({...userData });
        return result
        
    } catch (error) {
        
        console.log("error registering the user to DB: ", error);
        if (error.code === 11000) {
            throw new UniqueConstraintError(error.message)
        } 
        return null;
    }
    
}

  // async function findAllUsers() {
    //     const db = await dbconnection()
    //     const result = await db.collection('users').find({})
    //     return (await result.toArray()).map(({ _id: id, ...found }) => ({
    //         id,
    //         ...found
    //     }))
    // }


    // async function updateUser({ id: _id, userData }) {
    //     const db = await dbconnection()
    //     const result = await db
    //         .collection('users')
    //         .updateOne({ _id }, { $set: { ...userData } })
    //     return result.modifiedCount > 0 ? { id: _id, ...userData } : null
    // }

    // async function deleteUser({ id: _id }) {
    //     const db = await dbconnection()
    //     const result = await db.collection('users').deleteOne({ _id })
    //     return result.deletedCount
    // }


module.exports = function makeUserdb({ dbconnection }) {

    return Object.freeze({
        // findAllUsers,
        findUserByEmail: async({ email }) => findUserByEmail(email, dbconnection),
        registerUser: async(userData) =>  registerUser(userData, dbconnection),
        // updateUser,
        // deleteUser
    })
}