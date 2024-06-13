const dbConnection = require("./db-connection");
const makeUserdb = require("./store-user")

const userUseCase = makeUserdb({dbConnection});

module.exports = userUseCase;