// create a blogPost post 

const { ObjectId, DBRef } = require("mongodb");
// const MongoClient = require("mongodb").MongoClient;

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
            logEvents({ "retry": "Retrying blog post creation due to error:" }, "blogPost.log");
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
const findOneBlogPost = async ({ blogPostId, dbconnection }) => {

    const db = await dbconnection();
    try {
        // const blogPost = await db.collection('blogPosts').findOne({ _id: new ObjectId(blogPostId) }, {
        //     projection: { _id: 1, title: 1, content: 1, category: 1, numViews: 1, tags: 1, author: 1, slug: 1, cover_image: 1, created_at: 1, lastModified: 1 }
        // });
        // if (!blogPost) {
        //     console.log("No blogPost found");
        //     return null;
        // }

        const pipeline = [
            {
                $match: { _id: new ObjectId(blogPostId) }, // Match blog post by ID
            },
            {
                $lookup: {
                    from: "comments", // Specify comments collection
                    localField: "_id", // Reference local field (blog post ID)
                    foreignField: "blogPostId", // Reference foreign field in comments (postId)
                    as: "comments", // Name for the joined comments array
                },
            },
            {
                $lookup: {
                    from: "users", // Specify users collection
                    localField: "likers", // Reference array of user IDs in blog post (optional)
                    foreignField: "_id", // Reference user ID field in users collection
                    as: "likes", // Name for the joined users array
                },
            },
            {
                $project: {
                    // Specify desired fields from blog post
                    title: 1,
                    content: 1,
                    // ... other blog post fields
                    comments: 1,
                    likes: { // Project only desired user fields from likes array
                        _id: 0,
                        username: 1,
                        // ... other user fields
                    },
                },
            },
        ];

        const blogPost = await db.collection('blogPosts').aggregate(pipeline).toArray();

        return blogPost[0] || null;
        // const { _id, ...rest } = blogPost;
        // const id = _id.toString()
        // const isDeleted = delete blogPost._id;

        if (isDeleted) {
            return { id, ...rest };
        }
        // return rest;
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
const findAllBlogPosts = async ({ dbconnection, logEvents, ...filterOptions }) => {
    const proj = { _id: 1, title: 1, content: 1, category: 1, numViews: 1, tags: 1, author: 1, slug: 1, cover_image: 1, created_at: 1, lastModified: 1 };

    /** TODO: initiate the data transfer from frontend */
    const { category, page = 1, perPage = 10, searchTerm, projection = proj } = filterOptions;

    const skip = (page - 1) * perPage;
    const limit = perPage;

    const pipeline = [
        { $match: { ...(searchTerm && { $text: { $search: searchTerm } }), ...(category && { category }) } },
        { $project: projection },
        { $skip: skip },
        { $sort: { created_at: -1 } },
        { $limit: limit }
    ];
    // const pipeline = [
    //     { $match: { ...(searchTerm && { $text: { $search: searchTerm } }), ...(category && { category }) } },
    //     { $project: projection }, // Use projection to specify desired fields
    //     { $sort: { created_at: -1 } },
    // ];

    const db = await dbconnection();

    try {
        /* this is less optimal since it fetch all the documents before applying pagination. */
        const [blogPosts, totalBlogPosts] = await Promise.all([
            db.collection('blogPosts').aggregate(pipeline).toArray(),
            db.collection('blogPosts').countDocuments({ ...(searchTerm && { $text: { $search: searchTerm } }), ...(category && { category }) })
        ]);

        // const cursor = db.collection('blogPosts').aggregate(pipeline).sort({ created_at: -1 }).skip(skip).limit(limit);
        // const blogPosts = await cursor.toArray();

        // const totalBlogPosts = await db.collection('blogPosts').countDocuments({ ...(searchTerm && { $text: { $search: searchTerm } }), ...(category && { category }) });


        const totalPages = Math.ceil(totalBlogPosts / perPage);

        return {
            data: blogPosts.map(blogPost => {
                const id = blogPost._id.toString()
                delete blogPost._id;
                return {
                    ...blogPost,
                    id
                }
            }),
            totalBlogPosts,
            totalPages,
            page,
            perPage
        };
    } catch (error) {
        console.log("Error from blogPost DB handler: ", error);
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
        console.log("Error from blogPost DB handler: ", error);
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
        console.log("Error from blogPost DB handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.ReferenceError || error.TypeError}\t${error.message}`,
            "blogPost.log"
        );
        return null;
    }
};

//TODO: create a transaction to like and dislike a blog post, 
const updateBlogPostLikeDbHandler = async ({ blogPostId, dbconnection, logEvents }) => {

    const db = await dbconnection();
    try {
        const updatedBlogPost = await db.collection('blogPosts').updateOne(
            { _id: new ObjectId(blogPostId) },
            { $inc: { numViews: 1 } },
            { returnOriginal: false }
        );
        return updatedBlogPost.modifiedCount > 0 ? { id: blogPostId } : null;
    } catch (error) {
        console.log("Error from blogPost DB handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.ReferenceError || error.TypeError}\t${error.message}`,
            "blogPost.log"
        );
        return null;
    }
}



module.exports = ({ dbconnection, logEvents }) => {

    return Object.freeze({
        createBlogPostDbHandler: async ({ blogPostData }) => createBlogPostPost({ blogPostData, dbconnection, logEvents }),
        findOneBlogPostDbHandler: async ({ blogPostId }) => findOneBlogPost({ blogPostId, dbconnection, logEvents }),
        findAllBlogPostsDbHandler: async (filterOptions) => findAllBlogPosts({ dbconnection, logEvents, ...filterOptions }),
        updateBlogPostDbHandler: async ({ blogPostId, blogPostData }) => updateBlogPost({ blogPostId, blogPostData, dbconnection, logEvents }),
        deleteBlogPostDbHandler: async ({ blogPostId }) => deleteBlogPost({ blogPostId, dbconnection, logEvents }),
    })
}
