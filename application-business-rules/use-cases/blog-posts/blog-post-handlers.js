
//create a blog post
const createBlogPostUseCase = ({ makeBlogPostModelHandler, makeHttpError }) => async function
    createBlogPostUseCaseHandler({ blogPostData, logEvents, createBlogPostDbHandler, errorHandlers }) {

    try {
        // validate blog post data
        const { makeBlogPost } = await makeBlogPostModelHandler({ blogPostData, errorHandlers });

        // store blog post in database mongodb
        const newBlogPost = await createBlogPostDbHandler({ blogPostData: makeBlogPost });

        if (newBlogPost)
            return Object.freeze({
                newBlogPost,
                statusCode: 201
            })
        return Object.freeze({
            newBlogPost: null,
            statusCode: 500
        });

    } catch (error) {
        console.log("Error from create blog post handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.name || error.TypeError || error.ReferenceError}\t${error.message}`,
            "blogPostHandler.log"
        );
        return makeHttpError({
            statusCode: 500,
            message: "Failed to create blog post"
        });
    }
}

// update blog post
const updateBlogPostUseCase = ({ makeProductModelHandler, makeHttpError }) => async function
    updateBlogPostUseCaseHandler({ blogPostData, logEvents, dbBlogHandler, errorHandlers }) {

    const { findOneBlogDbHandler, updateBlogPostDbHandler } = dbBlogHandler;

    try {
        // validate blog post data
        const { makeBlogPost } = await makeProductModelHandler({ blogPostData, errorHandlers });

        console.log(" blog post data model: ", makeBlogPost);

        //check first if the blog post already exist
        const existingBlogPost = await findOneBlogDbHandler(makeBlogPost.id);
        if (!existingBlogPost) {
            return makeHttpError({
                statusCode: 404,
                message: "Blog post not found!"
            });
        }

        // store blog post in database mongodb
        const updatedBlogPost = await updateBlogPostDbHandler({ blogPostId: existingBlogPost.id, blogPostData: makeBlogPost });

        console.log(" blog post data from DB storage: ", updatedBlogPost);
        return Object.freeze({
            updatedBlogPost,
            statusCode: 201
        })
    } catch (error) {
        console.log("Error from update blog post handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.name || error.TypeError || error.ReferenceError}\t${error.message}`,
            "blog"
        );
        throw new Error(error.message);
    }
}

// delete blog post 
const deleteBlogPostUseCase = ({ makeHttpError }) => async function
    deleteBlogPostUseCaseHandler({ blogPostId, logEvents, dbBlogHandler }) {
    const { deleteBlogPostDbHandler, findOneBlogDbHandler } = dbBlogHandler;
    try {
        //check first if the blog post already exist
        const existingBlogPost = await findOneBlogDbHandler(makeBlogPost.id);
        if (!existingBlogPost) {
            return makeHttpError({
                statusCode: 404,
                message: "Blog post not found!"
            });
        }
        const deletedBlogPost = await deleteBlogPostDbHandler({ blogPostId });
        return Object.freeze({
            statusCode: 201,
            deletedBlogPost
        });
    } catch (error) {
        console.log("Error from delete blog post handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.name || error.TypeError || error.ReferenceError} \t${error.message}`,
            "blogHandler.log"
        );
        return makeHttpError({
            statusCode: 500,
            message: "Blog post not found!",
        });
    }
}

// get a single blog post
const findOneBlogPostUseCase = ({ makeHttpError }) => async function findOneBlogPostUseCaseHandler({ blogPostId, logEvents, findOneBlogPostDbHandler }) {
    try {
        const existingBlogPost = await findOneBlogPostDbHandler({ blogPostId });
        if (existingBlogPost) {
            return {
                blogPost: existingBlogPost,
                statusCode: 200
            };
        }
        throw new Error("Blog post not found!");
    } catch (error) {
        console.error("Error from find one blog post handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.name || error.TypeError || error.ReferenceError}\t${error.message}`,
            "blogHandler.log"
        );
    }

}

// find all blog posts
const findAllBlogPostsUseCase = ({ makeHttpError }) => async function
    findAllBlogPostsUseCaseHandler({ logEvents, findAllBlogPostsDbHandler, filterOptions }) {

    try {
        const blogPosts = await findAllBlogPostsDbHandler({ filterOptions });

        return Object.freeze({
            updatedBlogPost: blogPosts,
            statusCode: 200
        });
    } catch (error) {
        console.log("Error from find all blog posts handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.name || error.TypeError || error.ReferenceError}\t${error.message}`,
            "blogHandler.log"
        );
        return makeHttpError({
            statusCode: 500,
            message: "Failed to get all blog posts"
        });
    }
}

// update a blog post with reaction: like or dislike
const updateBlogPostReactionUseCase = () => async ({
    blogPostId,
    email,
    dbBlogPostHandler,
    logEvents,
    makeHttpError
    , dbUserHandler,
    data
}) => {

    const {
        likeBlogPostDbHandler,
        findOneBlogPostDbHandler
    } = dbBlogPostHandler;

    // get the DB user handler


    try {
        //check the existance of this user in DB
        let user = await dbUserHandler.findUserByEmailForLogin({ email });

        if (!user) {
            return makeHttpError({
                errorMessage: "USER NOT FOUND! LOGGIN FIRST",
                statusCode: 401
            });
        }

        // check if blog post exist
        const existingBlogPost = await findOneBlogPostDbHandler({ blogPostId });
        if (!existingBlogPost) {
            return makeHttpError({
                statusCode: 400,
                errorMessage: "Blog post not found!",
            });
        }

        const { updatedBlogPost } = await likeBlogPostDbHandler(blogPostId, user.id, data);
        console.log("updatedBlogPost from use case handler: ", updatedBlogPost);
        if (updatedBlogPost)
            return Object.freeze({
                updatedBlogPost,
                statusCode: 201
            });
        return {
            statusCode: 500,
            updatedBlogPost: "Failed to update blog post"
        }

    } catch (error) {
        console.log("Error from rate blog posts handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.name || error.TypeError || error.ReferenceError}\t${error.message}`,
            "blogHandler.log"
        );
        return makeHttpError({
            statusCode: 500,
            errorMessage: "Failed to update the blog posts"
        });
    }

}
module.exports = Object.freeze({
    createBlogPostUseCase,
    updateBlogPostUseCase,
    deleteBlogPostUseCase,
    findOneBlogPostUseCase,
    findAllBlogPostsUseCase,
    updateBlogPostReactionUseCase
})
