

const blogPostsUseCases = require("./blog-post-handlers");
const { makeHttpError } = require("../../../interface-adapters/validators-errors/http-error");
const { makeBlogPostModelHandler } = require("../../../enterprise-business-rules/entities");


const createBlogPostUseCaseHandler = blogPostsUseCases.createBlogPostUseCase({
    makeBlogPostModelHandler, makeHttpError
});

const findOneBlogPostUseCaseHandler = blogPostsUseCases.findOneBlogPostUseCase({ makeHttpError });

const deleteBlogPostUseCaseHandler = blogPostsUseCases.deleteBlogPostUseCase({ makeHttpError });

const updateBlogPostUseCaseHandler = blogPostsUseCases.updateBlogPostUseCase({ makeBlogPostModelHandler, makeHttpError });

const findAllBlogPostsUseCaseHandler = blogPostsUseCases.findAllBlogPostsUseCase({ makeHttpError });

module.exports = {
    createBlogPostUseCaseHandler,
    findOneBlogPostUseCaseHandler,
    deleteBlogPostUseCaseHandler,
    updateBlogPostUseCaseHandler,
    findAllBlogPostsUseCaseHandler
};  
