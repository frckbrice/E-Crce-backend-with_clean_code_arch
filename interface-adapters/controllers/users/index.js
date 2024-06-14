const {createUserHandler} = require("./create-user");
const {addUser} = require("../../../application-business-rules/use-cases/user")

const createUserController = createUserHandler({addUser})

module.exports = {
    createUserController,
}