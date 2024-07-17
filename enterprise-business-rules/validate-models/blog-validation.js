const productValidation = require("./product-validation-fcts")();

const { validateDescription, validateTitle, validateObjectId } = productValidation;

//validate cover image for only more optimized types
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


//validate image_urls as an array of strings
const validateImageUrls = ({ image_urls, InvalidPropertyError }) => {
    return image_urls.map(image => validateCoverImage({ coverImage: image, InvalidPropertyError }));
}


// create blog post model validation
const blogPostValidation = ({ blogPostData, errorHandlers }) => {

    // blog post props
    const {
        title,
        content,
        author,
        tags,
        image_urls,
        cover_image,
    } = blogPostData;

    const { RequiredParameterError, InvalidPropertyError } = errorHandlers;
    const resultingBlogPostData = {};
    const errors = [];
    if (!title) {
        errors.push(`Blog post title is required`);
    } else resultingBlogPostData.title = validateTitle({ title, InvalidPropertyError });
    if (!content) {
        errors.push(`Blog post description is required`);
    } else resultingBlogPostData.content = validateDescription({ description: content, InvalidPropertyError });

    if (!cover_image)
        errors.push(`Blog post cover image is required`);
    else resultingBlogPostData.cover_image = validateCoverImage({ cover_image, InvalidPropertyError });
    if (!author) {
        errors.push(`Blog post author is required`);
    } else resultingBlogPostData.author = validateTitle({ title: author, InvalidPropertyError });
    if (!tags) {
        errors.push(`Blog post tags are required`);
    } else resultingBlogPostData.tags = validateTags(tags, InvalidPropertyError);
    if (!image_urls) {
        errors.push(`Blog post image_urls are required`);
    } else resultingBlogPostData.image_urls = validateImageUrls({ image_urls, InvalidPropertyError });

    if (errors.length) {
        throw new RequiredParameterError(errors.join("\n"));
    }

    resultingBlogPostData.isLiked = false;
    resultingBlogPostData.isDisliked = false;
    resultingBlogPostData.likes = [];
    resultingBlogPostData.comments = [];
    resultingBlogPostData.numViews = 0;
    resultingBlogPostData.created_at = new Date().toISOString();
    resultingBlogPostData.lastModifiedDate = null;

    console.log("successfully validated blog post: ");
    return resultingBlogPostData;
}
module.exports = Object.freeze({
    blogPostValidation,
    validateCoverImage,
    validateTags,
    validateImageUrls,
    validateTitle,
    validateDescription,
})