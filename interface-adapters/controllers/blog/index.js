// database access
const { dbBlogPostHandler, dbUserHandler } = require("../../database-access");

// controllers
const blogPostControllerHandlers = require("./blog-controller")();

//use case handlers
const blogPostUseCaseHandlers = require("../../../application-business-rules/use-cases/blog-posts");

//utilities 
const errorHandlers = require("../../validators-errors/errors");
const { logEvents } = require("../../middlewares/loggers/logger");
const { makeHttpError } = require("../../validators-errors/http-error");

// controller handlers
const createBlogPostControllerHandler = blogPostControllerHandlers.createblogPostController({ createBlogPostUseCaseHandler: blogPostUseCaseHandlers.createBlogPostUseCaseHandler, dbBlogPostHandler, errorHandlers, makeHttpError, logEvents });

const updateBlogPostControllerHandler = blogPostControllerHandlers.updateblogPostController({ dbBlogPostHandler, updateBlogPostUseCaseHandler: blogPostUseCaseHandlers.updateBlogPostUseCaseHandler, makeHttpError, logEvents, errorHandlers });

const deleteBlogPostControllerHandler = blogPostControllerHandlers.deleteBlogPostController({ dbBlogPostHandler, deleteBlogPostUseCaseHandler: blogPostUseCaseHandlers.deleteBlogPostUseCaseHandler, makeHttpError, logEvents });

const findAllBlogPostControllerHandler = blogPostControllerHandlers.findAllblogPostController({ dbBlogPostHandler, findAllBlogPostUseCaseHandler: blogPostUseCaseHandlers.findAllBlogPostsUseCaseHandler, logEvents });

const findOneblogPostControllerHandler = blogPostControllerHandlers.findOneblogPostController({
    dbBlogPostHandler, findOneBlogPostUseCaseHandler: blogPostUseCaseHandlers.findOneBlogPostUseCaseHandler, logEvents, errorHandlers
});
const rateBlogPostControllerHandler = blogPostControllerHandlers.rateBlogPostController({ dbBlogPostHandler, rateBlogPostUseCaseHandler: blogPostUseCaseHandlers.updateBlogPostReactionUseCaseHandler, makeHttpError, logEvents, dbUserHandler });


module.exports = Object.freeze({
    createBlogPostControllerHandler,
    updateBlogPostControllerHandler,
    deleteBlogPostControllerHandler,
    findAllBlogPostControllerHandler,
    findOneblogPostControllerHandler,
    rateBlogPostControllerHandler
});
