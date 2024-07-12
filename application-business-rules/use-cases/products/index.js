const {
    createProductUseCase,
    findOneProductUseCase,
    findAllProductsUseCase,
    deleteProductUseCase,
    updateProductUseCase,
    rateProductUseCase
} = require("./product-handlers");

const {
    makeProductModelHandler,
    makeProductRatingModelHandler
} = require("../../../enterprise-business-rules/entities");

const productValidation = require("../../../enterprise-business-rules/validate-models/product-validation-fcts")();


const createProductUseCaseHandler = createProductUseCase({ makeProductModelHandler });
const findOneProductUseCaseHandler = findOneProductUseCase({ productValidation });
const findAllProductUseCaseHandler = findAllProductsUseCase();
const deleteProductUseCaseHandler = deleteProductUseCase({ productValidation });
const updateProductUseCaseHandler = updateProductUseCase({ makeProductModelHandler, productValidation });
const rateProductUseCaseHandler = rateProductUseCase({ makeProductRatingModelHandler });

module.exports = {
    createProductUseCaseHandler,
    findOneProductUseCaseHandler,
    findAllProductUseCaseHandler,
    deleteProductUseCaseHandler,
    updateProductUseCaseHandler,
    rateProductUseCaseHandler
}
