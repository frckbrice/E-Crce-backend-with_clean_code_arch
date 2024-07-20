// database access
const { dbProductHandler } = require("../../database-access")

const {
    // findBestUserRaterController <--------------TODO: for the product of the year
} = require("./product-controller")();


// controllers
const productControllerHandlsers = require("./product-controller")();
const productUseCaseHandlers = require("../../../application-business-rules/use-cases/products-&-rating");
const { makeHttpError } = require("../../validators-errors/http-error");


//utilities 
const errorHandlers = require("../../validators-errors/errors");
const { logEvents } = require("../../middlewares/loggers/logger");


// controller handlers
const createProductControllerHandler = productControllerHandlsers.createProductController({ createProductUseCaseHandler: productUseCaseHandlers.createProductUseCaseHandler, dbProductHandler, errorHandlers, makeHttpError, logEvents });

const updateProductControllerHandler = productControllerHandlsers.updateProductController({ dbProductHandler, updateProductUseCaseHandler: productUseCaseHandlers.updateProductUseCaseHandler, makeHttpError, logEvents, errorHandlers });

const deleteProductControllerHandler = productControllerHandlsers.deleteProductController({ dbProductHandler, deleteProductUseCaseHandler: productUseCaseHandlers.deleteProductUseCaseHandler, makeHttpError, logEvents, errorHandlers });

const findAllProductControllerHandler = productControllerHandlsers.findAllProductController({ dbProductHandler, findAllProductUseCaseHandler: productUseCaseHandlers.findAllProductUseCaseHandler, logEvents });

const findOneProductControllerHandler = productControllerHandlsers.findOneProductController({
    dbProductHandler, findOneProductUseCaseHandler: productUseCaseHandlers.findOneProductUseCaseHandler, logEvents, errorHandlers
});
const rateProductControllerHandler = productControllerHandlsers.rateProductController({ dbProductHandler, rateProductUseCaseHandler: productUseCaseHandlers.rateProductUseCaseHandler, makeHttpError, logEvents, errorHandlers });


module.exports = Object.freeze({
    createProductControllerHandler,
    updateProductControllerHandler,
    deleteProductControllerHandler,
    findAllProductControllerHandler,
    findOneProductControllerHandler,
    rateProductControllerHandler
});
