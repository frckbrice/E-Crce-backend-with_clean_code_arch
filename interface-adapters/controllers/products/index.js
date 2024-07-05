const { dbProductHandler } = require("../../database-access")

const {
    createProductController,
    deleteProductController,
    updateProductController,
    findAllProductController,
    findOneProductController,
    rateProductController
    // findBestUserRaterController
} = require("./product-controller")();

const {
    createProductUseCaseHandler,
    updateProductUseCaseHandler,
    deleteProductUseCaseHandler,
    findAllProductUseCaseHandler,
    findOneProductUseCaseHandler,
    rateProductUseCaseHandler
    // findBestUserRaterUseCaseHandler
} = require("../../../application-business-rules/use-cases/products");
const { makeHttpError } = require("../../validators-errors/http-error");

const errorHandlers = require("../../validators-errors/errors");
const { logEvents } = require("../../middlewares/loggers/logger");



const createProductControllerHandler = createProductController({ dbProductHandler, dbProductHandler, errorHandlers, makeHttpError, logEvents });
const updateProductControllerHandler = updateProductController({ dbProductHandler, updateProductUseCaseHandler, makeHttpError, logEvents, errorHandlers });
const deleteProductControllerHandler = deleteProductController({ dbProductHandler, deleteProductUseCaseHandler, makeHttpError, logEvents, errorHandlers });
const findAllProductControllerHandler = findAllProductController({ dbProductHandler, findAllProductUseCaseHandler, logEvents });
const findOneProductControllerHandler = findOneProductController({
    dbProductHandler, findOneProductUseCaseHandler, logEvents, errorHandlers
});
const rateProductControllerHandler = rateProductController({ dbProductHandler, rateProductUseCaseHandler, makeHttpError, logEvents, errorHandlers });
// const findProductRatingControllerHandler = findProductRatingController({ dbProductHandler, findProductRatingUseCaseHandler, errorHandlers });
// const findBestUserRaterControllerHandler = findBestUserRaterController({ dbProductHandler, findBestUserRaterUseCaseHandler, errorHandlers });


module.exports = {
    createProductControllerHandler,

    updateProductControllerHandler,
    deleteProductControllerHandler,
    findAllProductControllerHandler,
    findOneProductControllerHandler,
    rateProductControllerHandler
    // findBestUserRaterControllerHandler
}
