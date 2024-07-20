
// controller to create a blog post
const createblogPostController = ({ createBlogPostUseCaseHandler, dbBlogPostHandler, errorHandlers, makeHttpError, logEvents }) => async function createblogPostControllerHandler(httpRequest) {

    console.log("hit the create blog controller")

    const { body = {} } = httpRequest;
    if (Object.keys(body).length === 0) {
        return makeHttpError({
            statusCode: 400,
            errorMessage: 'No product data provided'
        });
    }
    const blogPostData = {
        title: body.title,
        content: body.content,
        cover_image: body.cover_image ?? "https://images.unsplash.com/photo-1707356419565-585c4caa0616?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        author: body.author ?? "admin",
        tags: body.tags || [],
        image_urls: body.image_urls || [],
        numViews: body.numViews || 0,
        category: body.category,
    };

    try {
        const { newBlogPost, statusCode } = await createBlogPostUseCaseHandler({ blogPostData, logEvents, createBlogPostDbHandler: dbBlogPostHandler.createBlogPostDbHandler, errorHandlers });

        console.log(newBlogPost)
        return {
            headers: {
                'Content-Type': 'application/json',
                "x-content-type-options": "nosniff"
            },
            statusCode,
            data: newBlogPost
        };
    } catch (e) {
        logEvents(
            `${e.no}:${e.code}\t${e.name}\t${e.message}`,
            "controllerHandlerErr.log"
        );
        console.log("error from createblogPostController controller handler: ", e);
        throw makeHttpError({ errorMessage: e.message, statusCode: e.statusCode || 500 });
    }
};

// controller to find one blog post
const findOneblogPostController = ({ findOneBlogPostUseCaseHandler, dbBlogPostHandler, errorHandlers, makeHttpError, logEvents }) => async function findOneblogPostControllerHandler(httpRequest) {

    console.log("hit find all blog posts controller ")
    const { blogId } = httpRequest.params;

    if (!blogId) {
        return makeHttpError({
            statusCode: 400,
            errorMessage: 'No blog Id provided'
        });
    }
    try {
        const { blogPost, statusCode } = await findOneBlogPostUseCaseHandler({ blogPostId: blogId, logEvents, findOneBlogPostDbHandler: dbBlogPostHandler.findOneBlogPostDbHandler });
        return {
            headers: {
                'Content-Type': 'application/json',
                "x-content-type-options": "nosniff"
            },
            statusCode,
            data: blogPost
        };
    } catch (e) {
        logEvents(
            `${e.no}:${e.code}\t${e.name}\t${e.message}`,
            "controllerHandlerErr.log"
        );
        console.log("error from findOneblogPostController controller handler: ", e);
        throw makeHttpError({ errorMessage: e.message, statusCode: e.statusCode || 500 });
    }
};

// create controller to find all blog posts 
const findAllblogPostController = ({ dbBlogPostHandler, findAllBlogPostUseCaseHandler, logEvents }) => async function findAllblogPostControllerHandler(httpRequest) {

    const filterOptions = { page = 1, perPage = 10, tags =[], author = '', category = "", searchTerm = "" } = httpRequest.query;
    try {
        const { updatedBlogPost,
            statusCode } = await findAllBlogPostUseCaseHandler({ logEvents, findAllBlogPostsDbHandler: dbBlogPostHandler.findAllBlogPostsDbHandler, filterOptions });
        return {
            headers: {
                'Content-Type': 'application/json',
                "x-content-type-options": "nosniff"
            },
            statusCode: statusCode,
            data: updatedBlogPost
        };
    } catch (e) {
        console.log("error from findAllblogPostController controller handler: ", e);
        throw makeHttpError({ errorMessage: e.message, statusCode: e.statusCode || 500 });
    }
};


// crontroller to update a blog post
const updateblogPostController = ({ updateBlogPostUseCaseHandler, dbBlogPostHandler, errorHandlers, makeHttpError, logEvents }) => async function updateblogPostControllerHandler(httpRequest) {

    console.log("hit the update blg post controller")
    const { blogId } = httpRequest.params;
    const { body = {} } = httpRequest;
    if (!blogId || Object.keys(body).length === 0) {
        return makeHttpError({
            statusCode: 400,
            errorMessage: 'No blog Id or product data provided'
        });
    }
    const blogPostData = {
        title: body.title,
        content: body.content,
        cover_image: body.cover_image,
        author: body.author,
        tags: body.tags || [],
        image_urls: body.image_urls || [],
        numViews: body.numViews || 0,
    };

    try {
        const { updatedBlogPost, statusCode } = await updateBlogPostUseCaseHandler({ blogPostData, logEvents, dbBlogHandler: dbBlogPostHandler, errorHandlers })
        return {
            headers: {
                'Content-Type': 'application/json',
                "x-content-type-options": "nosniff"
            },
            statusCode,
            data: updatedBlogPost
        };
    } catch (e) {
        logEvents(
            `${e.no}:${e.code}\t${e.name}\t${e.message}`,
            "controllerHandlerErr.log"
        );
        console.log("error from updateblogPostController controller handler: ", e);
        throw makeHttpError({ errorMessage: e.message, statusCode: e.statusCode || 500 });
    }
};

//controller to delete blog post
const deleteBlogPostController = ({ deleteBlogPostUseCaseHandler, makeHttpError, dbBlogHandler, logEvents }) => async ({ blogId }) => {

    console.log("hit delete controller ")

    if (!blogId)
        return makeHttpError({
            statusCode: 400,
            errorMessage: 'No blog Id provided'
        });
    try {
        const { deletedBlogPost, statusCode } = await deleteBlogPostUseCaseHandler({ blogPostId: blogId, dbBlogHandler, logEvents });
        return {
            headers: { 'Content-Type': 'application/json', "x-content-type-options": "nosniff" },
            statusCode,
            data: deletedBlogPost
        };
    } catch (e) {
        logEvents(
            `${e.no}:${e.code}\t${e.name}\t${e.message}`,
            "controllerHandlerErr.log"
        );
        console.log("error from deleting blog controller handler: ", e);
        throw makeHttpError({ errorMessage: e.message, statusCode: e.statusCode || 500 });
    }
}

// rate a blog controller
const rateblogPostController = ({ rateBlogPostUseCaseHandler, makeHttpError, dbBlogHandler, logEvents }) => async ({ blogId, rating }) => {

    console.log("hit rate controller ")

    if (!blogId || !rating)
        return makeHttpError({
            statusCode: 400,
            errorMessage: 'No blog Id or rating provided'
        });
    try {
        const { updatedBlogPost, statusCode } = await rateBlogPostUseCaseHandler({ blogPostId, rating, dbBlogHandler, logEvents });
        return {
            headers: { 'Content-Type': 'application/json', "x-content-type-options": "nosniff" },
            statusCode,
            data: updatedBlogPost
        };
    } catch (e) {
        logEvents(
            `${e.no}:${e.code}\t${e.name}\t${e.message}`,
            "controllerHandlerErr.log"
        );
        console.log("error from rate blog controller handler: ", e);
        throw makeHttpError({ errorMessage: e.message, statusCode: e.statusCode || 500 });
    }
}

module.exports = () => Object.freeze({
    createblogPostController,
    findOneblogPostController,
    findAllblogPostController,
    deleteBlogPostController,
    updateblogPostController,
    rateblogPostController
})
