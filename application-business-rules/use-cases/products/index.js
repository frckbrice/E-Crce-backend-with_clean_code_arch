const {
    createProductUseCase
} = require("./product-handlers");

const {
    makeProductModelHandler
} = require("../../../enterprise-business-rules/entities");


const createProductUseCaseHandler = createProductUseCase({ makeProductModelHandler });

module.exports = {
    createProductUseCaseHandler,
}