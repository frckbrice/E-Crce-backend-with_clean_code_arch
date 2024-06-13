

module.exports = async function makeUser({ dbConnection }) {


    return Object.freeze({
        findAllUsers,
        findUserById,
        createUser,
        updateUser,
        deleteUser
    })


    async function findAllUsers() {
        const db = await dbConnection()
        const result = await db.collection('users').find({})
        return (await result.toArray()).map(({ _id: id, ...found }) => ({
            id,
            ...found
        }))
    }

    async function findUserById() {
        const db = await dbConnection()
        const result = await db.collection('users').find({ _id })
        const found = await result.toArray()
        if (found.length === 0) {
            return null
        }
        const { _id: id, ...info } = found[0]
        return { id, ...info }
    }

    async function createUser({ id: _id = Id.makeId(), ...userData }) {
        const db = await dbConnection()
        const result = await db
            .collection('users')
            .insertOne({ _id, ...userData })
        const { _id: id, ...insertedInfo } = result.ops[0]
        return { id, ...insertedInfo }
    }

    async function updateUser({ id: _id, userData }) {
        const db = await dbConnection()
        const result = await db
            .collection('users')
            .updateOne({ _id }, { $set: { ...userData } })
        return result.modifiedCount > 0 ? { id: _id, ...userData } : null
    }

    async function deleteUser({ id: _id }) {
        const db = await dbConnection()
        const result = await db.collection('users').deleteOne({ _id })
        return result.deletedCount
    }
}