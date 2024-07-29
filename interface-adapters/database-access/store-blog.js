// create a blogPost post 

const { ObjectId, DBRef } = require("mongodb");
const { options } = require("sanitize-html");
const MongoClient = require("mongodb").MongoClient;

// create blog post only if the blog with that title doesn't exist
async function createBlogPostPost({ blogPostData, dbconnection, logEvents }) {
    const db = await dbconnection();

    const retryCount = 0;

    try {
        const updateResult = await db.collection('blogPosts').updateOne(
            { slug: blogPostData.slug }, // Filter for existing documents with matching slug
            { $set: blogPostData }, // Update document with provided data
            { upsert: true } // Insert a new document if no match is found
        );

        if (updateResult.upsertedCount === 1) {
            return {
                message: "Blog post created successfully",
                statusCode: 201
            };
        } else if (updateResult.modifiedCount === 1) {
            logEvents("Blog post with that slug already exists, updated content");
            return {
                message: "Blog post with that slug already exists, content updated",
                statusCode: 409
            };
        } else {
            logEvents("Unexpected update result during blog post creation");
            throw new Error("Unexpected update result");
        }
    } catch (error) {
        logEvents(
            `${error.no}:${error.code}\t${error.ReferenceError || error.TypeError}\t${error.message}`,
            "blogPost.log"
        );
        if (shouldRetry(error) && retryCount < 3) { // Define retry logic and limit
            logEvents({ "retry": "Retrying blog post creation due to network error:" }, "blogPost.log");
            const delay = calculateDelay(retryCount); // Implement exponential backoff
            await new Promise((resolve) => setTimeout(resolve, delay));
            retryCount++;
            return createBlogPostPost({ blogPostData, dbconnection, logEvents });

        } else {
            throw error; // Re-throw non-retryable errors
        }
    }
}


function shouldRetry(error) {
    // Implement logic to identify retryable errors (e.g., network errors)
    return error.message.includes("network timeout");
}

function calculateDelay(retryCount) {
    // Implement exponential backoff calculation (e.g., 2 ^ retryCount * 100 milliseconds)
    return Math.pow(2, retryCount) * 100;
}



// find one blogPost from DB
const findOneBlogPost = async ({ blogPostId, dbconnection, logEvents }) => {
    try {
        const db = await dbconnection();
        const blogPost = await db.collection('blogPosts').findOne(
            { _id: new ObjectId(blogPostId) },
            {
                projection: {
                    _id: 1, title: 1, content: 1, category: 1, numViews: 1, tags: 1, author: 1, slug: 1, cover_image: 1, created_at: 1, lastModified: 1,
                    comments: 1, likes: { username: 1 }
                }
            }
        );
        const id = blogPost._id.toString()
        delete blogPost._id;
        return {
            id,
            ...blogPost
        } ?? null;
    } catch (error) {
        console.log("Error from blogPost DB handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.ReferenceError || error.TypeError}\t${error.message}`,
            "blogPost.log"
        );
        return null;
    }
}



// find all blogPosts from the database using aggregate pipeline and tags
const findAllBlogPosts = async ({ dbconnection, logEvents, ...options }) => {
    const proj = { _id: 1, title: 1, content: 1, category: 1, numViews: 1, tags: 1, author: 1, slug: 1, cover_image: 1, created_at: 1, lastModified: 1 };

    const { filterOptions } = options;

    /** TODO: initiate the data transfer from frontend */
    const { category, page = 1, perPage = 10, searchTerm, projection = proj } = { ...filterOptions };

    const skip = (Number(page) - 1) * Number(perPage);
    const limit = +perPage;

    const pipeline = [
        { $match: { ...(searchTerm && { $text: { $search: searchTerm } }), ...(category && { category }) } },
        { $project: projection },
        { $skip: skip },
        { $sort: { created_at: -1 } },
        { $limit: limit }
    ];

    const db = await dbconnection();

    try {
        /* this is less optimal since it fetch all the documents before applying pagination. */
        const [blogPosts, totalBlogPosts] = await Promise.all([
            db.collection('blogPosts').aggregate(pipeline).toArray(),
            db.collection('blogPosts').countDocuments({ ...(searchTerm && { $text: { $search: searchTerm } }), ...(category && { category }) })
        ]);

        const totalPages = Math.ceil(totalBlogPosts / perPage);

        return {
            data: blogPosts.map(blogPost => {
                const id = blogPost._id.toString()
                delete blogPost._id;
                return {
                    id,
                    ...blogPost
                }
            }),
            totalBlogPosts,
            totalPages,
            page,
            perPage: +perPage
        };
    } catch (error) {
        console.log("Error from find all blog post DB handler: ", error);
        logEvents(`${error.no}:${error.code}\t${error.ReferenceError || error.TypeError}\t${error.message}`, "blogPost.log");
        return [];
    }
};



// update existing blogPost
const updateBlogPost = async ({ blogPostId, blogPostData, dbconnection, logEvents }) => {
    const db = await dbconnection();
    try {
        const updatedBlogPost = await db.collection('blogPosts').updateOne(
            { _id: new ObjectId(blogPostId) },
            { $set: { ...blogPostData } },
            { returnOriginal: false }
        );

        delete blogPostData._id;
        return updatedBlogPost.modifiedCount > 0 ? { id: blogPostId, ...blogPostData, } : null;
    } catch (error) {
        console.log("Error from updateBlogPost DB handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.ReferenceError || error.TypeError}\t${error.message}`,
            "blogPost.log"
        );
        return null;
    }
}

// delete blogPost from DB
const deleteBlogPost = async ({ blogPostId, dbconnection, logEvents }) => {
    const db = await dbconnection();
    try {
        const result = await db.collection('blogPosts').deleteOne({ _id: blogPostId });
        return result.deletedCount > 0 ? { id: blogPostId } : null;
    } catch (error) {
        console.log("Error from deleteBlogPost DB handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.ReferenceError || error.TypeError}\t${error.message}`,
            "blogPost.log"
        );
        return null;
    }
};

const updateBlogPostLikeDbHandler = async ({ blogPostId, currentUserId, logEvents, data }) => {

    const client = new MongoClient(process.env.DB_URI);
    const session = client.startSession();

    /* start a transaction session */
    const transactionOptions = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' }
    };
    console.log("hit rate DB Handler ", data)
    const lastModified = Date.now();
    /* set up filter */
    const filter = { _id: new ObjectId(blogPostId) };
    try {
        return await session.withTransaction(async () => {

            /* initialize db collections. clientSession and client MUST be in the same session */
            const blogPostCollection = client.db("digital-market-place-updates").collection("blogPosts");
            console.log("hit DB H. after collections init ",)
            // check if the blogPost exists
            const existingBlogPost = await blogPostCollection.findOne(filter, { session });
            console.log("hit DB H. after check exists ", existingBlogPost)
            if (!existingBlogPost) {// cannot rate ghost blogPost.
                console.error("no existing blog post. abort transaction");
                session.abortTransaction();
                return {
                    error: {
                        code: 404,
                        message: "blogPost not found! transaction aborted.",
                    }
                };
            }
            //** check if this user has already rated this blogPost */

            const hasAlreadyReact = existingBlogPost?.likers.length && existingBlogPost.likers?.find((liker) => {
                return liker.id.toString() === currentUserId
            })
            console.log("hit DB H. after check hasAlreadyReact ", hasAlreadyReact)
            /* check if this user has already like this blogPost */
            const isLiked = existingBlogPost.isLiked;
            const isDisliked = existingBlogPost.isDisliked;
            let updatedBlogPost;
            if (hasAlreadyReact) {

                /**if he like already liked post, return */
                if ((isLiked && data.isLiked) || (isDisliked && data.isDisliked)) {
                    console.log("hit DB H.check if this user has already liked before return ", hasAlreadyReact)
                    return {
                        message: "this user has already liked this post"
                    };
                }
                console.log("hit DB H.check start new check")
                // has already react, it was dislike and current is like
                if (isDisliked && data.isLiked) {
                    //no need to push liker again
                    console.log("hit DB H has already react positive before")
                    updatedBlogPost = await blogPostCollection.findOneAndUpdate(
                        filter,
                        {
                            // $push: {   
                            //     id: currentUserId,
                            // },
                            $inc: {
                                numViews: 1,
                            },
                            $set: {
                                lastModified,
                                isLiked: true,
                                isDisliked: false,
                            }
                        },
                        { session }
                    );
                } else

                    // has already react, it was a like and current is dislike
                    if (isLiked && data.isDisLiked) {
                        console.log("hit DB H has already react negative before")
                        // remove the user id from liste of likers ids
                        updatedBlogPost = await blogPostCollection.findOneAndUpdate(
                            filter,
                            {
                                $pull: {
                                    id: currentUserId,
                                },
                                $inc: {
                                    numViews: 1,
                                },
                                $set: {
                                    lastModified,
                                    isLiked: false,
                                    isDisliked: true,
                                }
                            },
                            { session }
                        );
                    }

            } else {
                updatedBlogPost = await blogPostCollection.findOneAndUpdate(
                    filter,
                    {
                        $push: {
                            id: currentUserId,
                        },
                        $inc: {
                            numViews: 1,
                        },
                        $set: {
                            lastModified,
                            isLiked: data.isLiked ?? false,
                            isDisliked: data.isDisliked ?? false,
                        }
                    },
                    { session }
                );
            }
            console.log("hit DB H. end checking process")
            // await session.commitTransaction(); NO NEED TO EXPLICITELY DO IT, IT'S DONE BEHIND THE SCENE BY MONGODB DRIVER
            return { updatedBlogPost };
        }, transactionOptions);

    } catch (error) {
        console.log("Error from updateBlogPostLikeDbHandler DB handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.ReferenceError || error.TypeError}\t${error.message}`,
            "blogPost.log"
        );
        throw new Error(error.message || error.ReferenceError || error.TypeError);
    } finally {
        // End the session
        session.endSession();
        await client.close();
    }
}


module.exports = ({ dbconnection, logEvents }) => {

    return Object.freeze({
        createBlogPostDbHandler: async ({ blogPostData }) => createBlogPostPost({ blogPostData, dbconnection, logEvents }),
        findOneBlogPostDbHandler: async ({ blogPostId }) => findOneBlogPost({ blogPostId, dbconnection, logEvents }),
        findAllBlogPostsDbHandler: async (options) => findAllBlogPosts({ dbconnection, logEvents, ...options }),
        updateBlogPostDbHandler: async ({ blogPostId, blogPostData }) => updateBlogPost({ blogPostId, blogPostData, dbconnection, logEvents }),
        deleteBlogPostDbHandler: async ({ blogPostId }) => deleteBlogPost({ blogPostId, dbconnection, logEvents }),
        likeBlogPostDbHandler: async (blogPostId, currentUserId, data) => updateBlogPostLikeDbHandler({ blogPostId, logEvents, currentUserId, data })
    })
}
