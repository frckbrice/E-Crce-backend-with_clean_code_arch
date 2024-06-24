const { dbconnection } = require("./db-connection");
const makeUserdb = require("./store-user");


const { createProductDbHandler } = require("./store-product")({ dbconnection });
const dbUserHandler = makeUserdb({ dbconnection });

module.exports = { dbUserHandler, createProductDbHandler };