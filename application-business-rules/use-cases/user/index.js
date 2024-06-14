const {addUserUseCase} = require("./add-user");
const dbUserHandler = require("../../../framework-and-drivers/database-access/")


const addUser = addUserUseCase({dbUserHandler})

module.exports = {addUser}  