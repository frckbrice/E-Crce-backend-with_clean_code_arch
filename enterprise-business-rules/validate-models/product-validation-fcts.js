
//validate and normalise product title
function validateTitle({ title, InvalidPropertyError }) {
    if (title.length < 2)
        throw new InvalidPropertyError(`A product's title must be at least 2 characters long.`);
    return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
}

//validate title length

//validate and normalise product description
function validateDescription({ descripton, InvalidPropertyError }) {
    if (descripton.length < 50) {
        throw new InvalidPropertyError(
            `A product's title must be at least 20 characters long.`
        )
    }
    return descripton.charAt(0).toUpperCase() + descripton.slice(1);
}

/**
 * 1.
Converts the title to lowercase using the toLowerCase() method.
2.
Trims any leading or trailing whitespace using the trim() method.
3.
Removes any non-alphanumeric characters, spaces, underscores, and hyphens using the
 regular expression /[^\w\s-]/g and the replace() method.
4.
Replaces any consecutive spaces, underscores, or hyphens with a single hyphen using the 
regular expression /[\s_-]+/g and the replace() method.
5.
Removes any leading or trailing hyphens using the regular expression /^-+|-+$/g and the replace() method.

 * @param {*} title 
 * @returns 
 */
function slugify(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

//defines a category as a DBRefs of the category collection
function validateCategory(category, InvalidPropertyError) {

    if (!category || !category.ref || !category.id) {
        throw new InvalidPropertyError(
            `A product must have a valid category.`
        )
    }
    return { $ref: category.ref, $id: category.id };
}

//validate quantity
function validateNumber(quantity, InvalidPropertyError) {
    if (quantity < 0) {
        throw new InvalidPropertyError(
            `A product's quantity must be greater than or equal to 0.`
        )
    }
    return quantity;
}


// constructs an enumeration of colors
function validateColors(colors, InvalidPropertyError) {
    console.log("color: ", colors)

    if (!Array.isArray(colors)) {
        return [colors];
    }

    const validColors = new Set(["Black", "Brown", "green", "white"]);
    if (colors.length === 0 || !colors.some(color => validColors.has(color))) {
        throw new InvalidPropertyError(
            `A product must have at least one color.`
        )
    }

    return [...new Set(colors)];
}

// constructs an enumeration of brands
function validateBrands(brands, InvalidPropertyError) {

    console.log("brand: ", brands)
    if (!Array.isArray(brands)) {
        return [brands];
    }

    const validbrands = new Set(["Apple", "Samsung", "Microsoft", "Lenovo", "Acer", "Asus", "HP", "Dell"]);
    if (brands.length === 0 || !brands.some(color => validbrands.has(color))) {
        throw new InvalidPropertyError(
            `A product must have at least one color.`
        )
    }

    return [...new Set(brands)];
}


//validate and normalize product rating: rating is an array of refences to users in the users collection
function validateRating(rating, InvalidPropertyError) {
    const ratingObj = {};

    return rating;
}

// validate image type for png jpg 
const validateImageType = (image, InvalidPropertyError) => {

    console.log("image: ", image)
    const extention = image.split(".").pop();
    if (extention !== "png" && extention !== "jpg") {
        throw new InvalidPropertyError(
            `Invalid image type.`
        )
    }

    return image;
}

//validate images as array of strings
const normaliseImages = (images) => {
    console.log("images: ", images)
    return images.map(validateImageType);
}

//validate variations of product as an object with properties size, color, material, fit, quantity
const validateVariation = (variations) => {
    console.log("variations: ", variations)

    const newVariation = variations.map((variation) => ({
        size: variation.size ? String(variation.size) : null,
        color: variation.color ? String(variation.color) : null,
        material: variation.material ? String(variation.material) : null,
        fit: variation.fit ? String(variation.fit) : null,
        quantity: variation.quantity ? validateNumber(variation.quantity) : null,
    }));
    return newVariation;
}

//validate dimensions of a product as an object with properties length, width, height

// count total product reviews
const CalculateTotalReviews = (totalRatings) => {
    if (!totalRatings || !totalRatings.length) return 0
    return totalRatings.reduce((acc, curr) => acc + curr, 0);
}

//calculate average rating
const calculateAverageRating = (totalRatings) => {
    if (!totalRatings || !totalRatings.length) return 0
    return totalRatings.reduce((acc, curr, idx) => acc + curr * (idx + 1), 0) / resultingProductData.totalReviews;
}

// validate uuid  as ObjectId
const validateUUID = (id, InvalidPropertyError) => {
    // const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    // console.log(id);
    const regex = /^[a-fA-F0-9]{24}$/; // ObjectId validation regex
    if (!regex.test(id)) {
        throw new InvalidPropertyError(`Invalid product ObjectId.`)
    }
    return id;
}

// validate rating model 
const validateRatingModel = (ratingModel, InvalidPropertyError) => {
    const { productId, userId, ratingValue } = ratingModel;

    // validate IDs
    const productUUID = validateUUID(productId, InvalidPropertyError);
    const userUUID = validateUUID(userId, InvalidPropertyError);

    // validate rating value
    const validRatingValues = [1, 2, 3, 4, 5];
    if (!ratingValue || !validRatingValues.includes(ratingValue)) {
        throw new InvalidPropertyError(
            `Invalid rating value.`
        )
    }

    return {
        productId: productUUID,
        userId: userUUID,
        ratingValue,
        date: new Date().toISOString(),
    };
}

//basic product validation 
const basicProductValidation = ({ productData, errorHandlers }) => {

    console.log("start validations: ")
    const errors = [];
    const { RequiredParameterError, InvalidPropertyError } = errorHandlers;
    const resultingProductData = {};

    if (!productData.title) {
        errors.push(`Product title is required`);
    } else resultingProductData.title = validateTitle({ title: productData.title, InvalidPropertyError });

    if (!productData.descripton) {
        errors.push(`Product descripton is required`);
    } else resultingProductData.descripton = validateDescription({ descripton: productData.descripton, InvalidPropertyError });

    if (!productData.price) {
        errors.push(`Product price is required`);
    } else resultingProductData.price = validateNumber(productData.price, InvalidPropertyError);

    if (!productData.images || !productData.images.length) {
        errors.push(`Product images are required`);
    } else resultingProductData.images = normaliseImages(productData.images, InvalidPropertyError);

    if (productData.category) {
        resultingProductData.category = validateCategory(productData.category, InvalidPropertyError);
    }
    if (productData.colors) {
        resultingProductData.colors = validateColors(productData.colors, InvalidPropertyError);
    }
    if (productData.inventory) {
        resultingProductData.inventory = validateNumber(productData.inventory, InvalidPropertyError);
    }
    if (!productData.creationDate) {
        errors.push(`Product creation date is required`);
    } else resultingProductData.creationDate = new Date(productData.creationDate);
    if (!productData.expirationDate) {
        errors.push(`Product expiration date is required`);
    } else resultingProductData.expirationDate = new Date(productData.expirationDate);
    if (!productData.origin) {
        errors.push(`Product origin is required`);
    } else resultingProductData.origin = productData.origin;
    if (!productData.variations.length) {
        resultingProductData.variations = [];
    } else resultingProductData.variations = validateVariation(productData.variations)
    // if (productData.weight) {
    //     resultingProductData.weight = validateQuantity(productData.weight);
    // }
    // if (productData.dimensions) {
    //     resultingProductData.dimensions = productData.dimensions;
    // }
    if (!productData.highlights || !productData.highlights.length) {
        errors.push(`Product highlights are required`);
    } else resultingProductData.highlights = productData.highlights || [];

    // if (productData.specifications) {
    //     resultingProductData.specifications = productData.specifications || {};
    // }
    if (productData.shipping) {
        resultingProductData.shipping = productData.shipping;
    }
    if (!productData.seoKeywords.length) {
        errors.push(`Product seoKeywords are required`);
    } else resultingProductData.seoKeywords = productData.seoKeywords;
    // if (productData.size) {
    //     resultingProductData.size = productData.size;
    // }
    if (productData.materials) {
        resultingProductData.materials = productData.materials || {};
    }
    // if (productData.subcategory) {
    //     resultingProductData.subcategory = validateCategory(productData.subcategory) || resultingProductData.category;
    // }
    if (productData.lowStockThreshold) {
        resultingProductData.lowStockThreshold = validateNumber(productData.lowStockThreshold) || 10;
    }
    if (productData.salePrice) {
        resultingProductData.salePrice = validateNumber(productData.salePrice) || resultingProductData.price;
    }

    resultingProductData.slug = slugify(resultingProductData.title);
    resultingProductData.creationDate = new Date(resultingProductData.creationDate);
    resultingProductData.expirationDate = new Date(resultingProductData.expirationDate);
    resultingProductData.created_At = new Date().toISOString();
    resultingProductData.totalRatings = Array.from({ length: 5 }, () => 0);
    resultingProductData.totalReviews = 0;
    resultingProductData.totalSales = 0;
    resultingProductData.latestRating = null;
    resultingProductData.rateAverage = 0;
    resultingProductData.lastModified = new Date().toISOString();
    resultingProductData.instock = Boolean(resultingProductData.inventory && resultingProductData.inventory > 0)
    resultingProductData.brands = productData.brands || [];

    if (errors.length) {
        throw new RequiredParameterError(errors.join(', '));
    }
    console.log("end of validations: ");
    return resultingProductData;
}

module.exports = () => {
    return Object.freeze({
        basicProductValidation,
        CalculateTotalReviews,
        calculateAverageRating,
        validateUUID,
        validateRatingModel
    })
}
