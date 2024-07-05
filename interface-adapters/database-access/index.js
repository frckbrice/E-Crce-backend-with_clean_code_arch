const { dbconnection } = require("./db-connection");
const { logEvents } = require("../middlewares/loggers/logger");
const makeUserdb = require("./store-user");


const dbProductHandler = require("./store-product")({ dbconnection, logEvents });
const dbUserHandler = makeUserdb({ dbconnection });

module.exports = {
    dbUserHandler,
    dbProductHandler
};
