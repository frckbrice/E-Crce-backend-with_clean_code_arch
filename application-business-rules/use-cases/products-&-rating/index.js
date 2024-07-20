const productHandlers = require("./product-handlers");

const makeProductHandlers = require("../../../enterprise-business-rules/entities");

const productValidation = require("../../../enterprise-business-rules/validate-models/product-validation-fcts")();


const createProductUseCaseHandler = productHandlers.createProductUseCase({ makeProductModelHandler: makeProductHandlers.makeProductModelHandler });
const findOneProductUseCaseHandler = productHandlers.findOneProductUseCase({ productValidation });
const findAllProductUseCaseHandler = productHandlers.findAllProductsUseCase();
const deleteProductUseCaseHandler = productHandlers.deleteProductUseCase({ productValidation });
const updateProductUseCaseHandler = productHandlers.updateProductUseCase({ makeProductModelHandler: makeProductHandlers.makeProductModelHandler, productValidation });
const rateProductUseCaseHandler = productHandlers.rateProductUseCase({ makeProductRatingModelHandler: makeProductHandlers.makeProductRatingModelHandler, productValidation });

module.exports = {
    createProductUseCaseHandler,
    findOneProductUseCaseHandler,
    findAllProductUseCaseHandler,
    deleteProductUseCaseHandler,
    updateProductUseCaseHandler,
    rateProductUseCaseHandler
}
