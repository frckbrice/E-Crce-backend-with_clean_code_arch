//create a product with color enumeration, categoryas reference to categories
//collection, rating as an array of objects with reference to ratings collection, also a brand enumeration 


async function createProduct(productData, dbconnection) {

    console.log("from createProduct DB handler");
    const db = await dbconnection();
    try {
        const newProduct = await db.collection('products').insertOne({ ...productData });
        return newProduct
    } catch (error) {
        console.log("Error from product DB handler: ", error);
        logEvents(
            `${error.no}:${error.code}\t${error.name}\t${error.message}`,
            "product.log"
        );
    }
}




module.exports = ({ dbconnection }) => {

    return Object.freeze({
        createProductDbHandler: async (productData) => createProduct(productData, dbconnection)
    })
}