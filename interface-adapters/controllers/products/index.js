const { createProductDbHandler } = require("../../database-access")

const {
    createProductController,
    // updateProductController,
    // deleteProductController,
    // findAllProductController,
    // findOneProductController,
    // findProductRatingController,
    // findBestUserRaterController
} = require("./product-controller")();

const {
    createProductUseCaseHandler,
    // updateProductUseHandler,
    // deleteProductUseHandler,
    // findAllProductUseHandler,
    // findProductUseHandler,
    // findProductRatingUseCaseHandler,
    // findBestUserRaterUseCaseHandler
} = require("../../../application-business-rules/use-cases/products");
const { makeHttpError } = require("../../validators-errors/http-error");

const errorHandlers = require("../../validators-errors/errors");
const { logEvents } = require("../../middlewares/loggers/logger");



const createProductControllerHandler = createProductController({ createProductUseCaseHandler, createProductDbHandler, errorHandlers, makeHttpError, logEvents });
// const updateProductControllerHandler = updateProductController({ dbProductHandler, updateProductUseHandler, errorHandlers });
// const deleteProductControllerHandler = deleteProductController({ dbProductHandler, deleteProductUseHandler, errorHandlers });
// const findAllProductsControllerHandler = findAllProductController({ dbProductHandler, findAllProductUseHandler, errorHandlers });
// const findOneProductControllerHandler = findOneProductController({ dbProductHandler, findProductUseHandler, errorHandlers });
// const findProductRatingControllerHandler = findProductRatingController({ dbProductHandler, findProductRatingUseCaseHandler, errorHandlers });
// const findBestUserRaterControllerHandler = findBestUserRaterController({ dbProductHandler, findBestUserRaterUseCaseHandler, errorHandlers });


module.exports = {
    createProductControllerHandler,

    // updateProductControllerHandler,
    // deleteProductControllerHandler,
    // findAllProductsControllerHandler,
    // findOneProductControllerHandler,
    // findProductRatingControllerHandler,
    // findBestUserRaterControllerHandler
}