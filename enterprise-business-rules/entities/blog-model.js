
module.exports = function makeBlogModel({ blogValidation: { blogPostValidation }, logEvents, sanitize }) {
    return async function ({ blogPostData, errorHandlers }) {

        try {
            console.log(" hit make blog model: ");
            const blogPost = blogPostValidation({ blogPostData, errorHandlers, sanitize });

            return Object.freeze({
                makeBlogPost: blogPost
            })
        } catch (error) {
            console.error("Error from blog-model handler: ", error);
            logEvents(
                `${error.no}:${error.code}\t${error.name || error.TypeError || error.ReferenceError}\t${error.message}`,
                "blogPostHandler.log"
            );
            throw new Error(error.message);
        }
    }
}
