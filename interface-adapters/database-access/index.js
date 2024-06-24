const { dbconnection } = require("./db-connection");
const { logEvents } = require("../middlewares/loggers/logger");


const makeUserdb = require("./store-user");
const {
    createProductDbHandler,
    findOneProductDbHandler,
    findAllProductsDbHandler
} = require("./store-product")({ dbconnection, logEvents });
const dbUserHandler = makeUserdb({ dbconnection });

module.exports = {
    dbUserHandler,
    createProductDbHandler,
    findOneProductDbHandler,
    findAllProductsDbHandler
};