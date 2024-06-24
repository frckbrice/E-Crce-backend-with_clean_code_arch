const {
    createProductUseCase,
    findOneProductUseCase
} = require("./product-handlers");

const {
    makeProductModelHandler
} = require("../../../enterprise-business-rules/entities");


const createProductUseCaseHandler = createProductUseCase({ makeProductModelHandler });
const findOneProductUseCaseHandler = findOneProductUseCase({ makeProductModelHandler });

module.exports = {
    createProductUseCaseHandler,
    findOneProductUseCaseHandler
}