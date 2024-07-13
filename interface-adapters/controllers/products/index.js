const { dbProductHandler } = require("../../database-access")

const {
    // findBestUserRaterController <--------------TODO: for the product of the year
} = require("./product-controller")();


const productControllerHandlsers = require("./product-controller")();
const productUseCaseHandlers = require("../../../application-business-rules/use-cases/products");
const { makeHttpError } = require("../../validators-errors/http-error");

const errorHandlers = require("../../validators-errors/errors");
const { logEvents } = require("../../middlewares/loggers/logger");



const createProductControllerHandler = productControllerHandlsers.createProductController({ createProductUseCaseHandler: productUseCaseHandlers.createProductUseCaseHandler, dbProductHandler, errorHandlers, makeHttpError, logEvents });

const updateProductControllerHandler = productControllerHandlsers.updateProductController({ dbProductHandler, updateProductUseCaseHandler: productUseCaseHandlers.updateProductUseCaseHandler, makeHttpError, logEvents, errorHandlers });

const deleteProductControllerHandler = productControllerHandlsers.deleteProductController({ dbProductHandler, deleteProductUseCaseHandler: productUseCaseHandlers.deleteProductUseCaseHandler, makeHttpError, logEvents, errorHandlers });

const findAllProductControllerHandler = productControllerHandlsers.findAllProductController({ dbProductHandler, findAllProductUseCaseHandler: productUseCaseHandlers.findAllProductUseCaseHandler, logEvents });

const findOneProductControllerHandler = productControllerHandlsers.findOneProductController({
    dbProductHandler, findOneProductUseCaseHandler: productUseCaseHandlers.findOneProductUseCaseHandler, logEvents, errorHandlers
});
const rateProductControllerHandler = productControllerHandlsers.rateProductController({ dbProductHandler, rateProductUseCaseHandler: productUseCaseHandlers.rateProductUseCaseHandler, makeHttpError, logEvents, errorHandlers });


module.exports = {
    createProductControllerHandler,
    updateProductControllerHandler,
    deleteProductControllerHandler,
    findAllProductControllerHandler,
    findOneProductControllerHandler,
    rateProductControllerHandler
}
