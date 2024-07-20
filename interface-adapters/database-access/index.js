
// utilities
const { dbconnection } = require("./db-connection");
const { logEvents } = require("../middlewares/loggers/logger");


// DB handlers
const dbProductHandler = require("./store-product-rating")({ dbconnection, logEvents });
const dbUserHandler = require("./store-user")({ dbconnection });
const dbBlogPostHandler = require("./store-blog")({ dbconnection, logEvents });

module.exports = {
    dbUserHandler,
    dbProductHandler,
    dbBlogPostHandler
};
