const {dbconnection} = require("./db-connection");
const makeUserdb = require("./store-user")

const dbUserHandler = makeUserdb({dbconnection});

module.exports = dbUserHandler;