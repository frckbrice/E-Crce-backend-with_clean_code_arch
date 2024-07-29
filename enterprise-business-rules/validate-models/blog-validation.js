const productValidation = require("./product-validation-fcts")();
const userValidation = require("./user-validation-functions");

const { validateObjectId, slugify, } = productValidation;


/**
 * Validates the cover image file extension to ensure it is one of the optimized types: png, jpeg, or jpg.
 *
 * @param {string} cover_image - The cover image file name to validate.
 * @param {Error} InvalidPropertyError - The error object to throw if the cover image is invalid.
 * @return {string} The validated cover image file name.
 */
const validateCoverImage = ({ cover_image, InvalidPropertyError }) => {

    const ext = cover_image.split('.').pop();
    if (ext !== 'png' && ext !== 'jpeg' && ext !== 'jpg') {
        throw new InvalidPropertyError(
            `Invalid cover image.`
        )
    }
    return cover_image;
}

//validate tags as an array of strings
const validateTags = (tags, InvalidPropertyError) => {
    if (!tags || !tags.length) {
        throw new InvalidPropertyError(
            `Tags are required.`
        )
    }
    return tags ?? [];
}

/**
 * Validates the image URLs to ensure they have valid formats: jpg, jpeg, or png.
 *
 * @param {Object} param0 - Object containing image_urls array and InvalidPropertyError
 * @return {Array} Array of validated image URLs
 */
const validateImageUrls = ({ image_urls, InvalidPropertyError }) => {
    const validatedImages = image_urls.filter(image => validateCoverImage({ coverImage: image, InvalidPropertyError }));

    if (validatedImages.length !== image_urls.length) {
        throw new InvalidPropertyError(
            `Invalid image format in image_urls.`
        );
    }

    return validatedImages;
}


/**
 * Normalizes the text of a blog post by capitalizing the first letter of each word and sanitizing the text.
 *
 * @param {function} sanitize - The function used to sanitize the text.
 * @param {string} title - The title of the blog post.
 * @param {string} content - The content of the blog post.
 * @param {string} author - The author of the blog post.
 * @param {string} category - The category of the blog post.
 * @return {Object} An object containing the normalized title, content, author, and category.
 */
function normaliseBlogText(sanitize, title, content, author, category) {
    const normaliseBlogTextd = {};

    const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

    if (title) normaliseBlogTextd.title = sanitize(capitalize(title));
    if (content) normaliseBlogTextd.content = sanitize(capitalize(content));
    if (author) normaliseBlogTextd.author = sanitize(capitalize(author));
    if (category) normaliseBlogTextd.category = sanitize(capitalize(category));


    return normaliseBlogTextd;
}

function validateBlogText({ title, category, InvalidPropertyError, sanitize }) {
    const text = title ? sanitize(title) : category ? sanitize(category) : "";
    if (text.length < 2) {
        throw new InvalidPropertyError(`A product's title/category must be at least 2 characters long.`);
    }
    return text
}

//validate title length

//validate  product description
function validateBlogContent({ content, InvalidPropertyError, sanitize, ...others }) {
    let text = content ? sanitize(content) : sanitize(others);
    if (text.length < 50) {
        throw new InvalidPropertyError(
            `A product's title must be at least 20 characters long.`
        )
    }
    return text;
}

/**
 * Validates and processes blog post data to create a blog post object.
 *
 * @param {Object} blogPostData - The blog post data including title, content, author, tags, image URLs, cover image, and category.
 * @param {Object} errorHandlers - Object containing RequiredParameterError and InvalidPropertyError classes for error handling.
 * @param {Function} sanitize - Function to sanitize input data.
 * @return {Object} The resulting blog post object with validated and processed data.
 */
const blogPostValidation = ({ blogPostData, errorHandlers, sanitize }) => {
    const { RequiredParameterError, InvalidPropertyError } = errorHandlers;

    let {
        title = "",
        content = "",
        author = "",
        tags = [],
        image_urls = [],
        cover_image = "",
        category = ""
    } = blogPostData, errors = [];

    const resultingBlogPostData = {
        isLiked: false,
        isDisliked: false,
        likers: [],
        comments: [],
        numViews: 0,
        created_at: new Date().toISOString(),
        lastModified: null
    };

    if (!title || !content || !author || !tags || !image_urls || !cover_image || !category) {
        errors.push("All parameters are required");
    }

    if (content)
        content = validateBlogContent({ content, InvalidPropertyError, sanitize });
    if (cover_image)
        cover_image = validateCoverImage({ cover_image, InvalidPropertyError });
    if (title)
        title = validateBlogText({ title, InvalidPropertyError, sanitize });
    if (tags)
        tags = validateTags(tags, InvalidPropertyError);
    if (image_urls)
        image_urls = validateImageUrls({ image_urls, InvalidPropertyError });
    if (category)
        category = validateBlogText({ category, InvalidPropertyError, sanitize });

    if (errors.length) {
        throw new RequiredParameterError(errors);
    }

    const normaliseBlogTextd = normaliseBlogText(sanitize, title, content, author, category);
    const { title: normalisedTitle, content: normalisedContent, author: normalisedAuthor, category: normalisedCategory } = normaliseBlogTextd;

    resultingBlogPostData.content = normalisedContent;
    resultingBlogPostData.author = normalisedAuthor;
    resultingBlogPostData.category = normalisedCategory;
    resultingBlogPostData.tags = tags;
    resultingBlogPostData.image_urls = validateImageUrls({ image_urls, InvalidPropertyError }),
        resultingBlogPostData.cover_image = cover_image;
    resultingBlogPostData.title = normalisedTitle;
    resultingBlogPostData.slug = slugify(normalisedTitle);

    return resultingBlogPostData;
}
module.exports = Object.freeze({
    blogPostValidation,
    validateCoverImage,
    validateTags,
    validateImageUrls,
    validateObjectId
});
