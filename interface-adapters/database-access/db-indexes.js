const { dbconnection } = require('./db-connection');
require('dotenv').config();

// all the collections stated here are created if not exist.
module.exports = async function setupDb() {
  console.log('Setting up database indexes...')
  const db = await dbconnection();

  const allProductsIndexName = await db.collection("products").listIndexes().toArray();


  let indexArr = [];
  // create indexes only if not exist
  allProductsIndexName.forEach(element => {
    if (element.name === 'productTextIndex' || element.name === 'productUniqueIndex') {
      return;
    }
    indexArr = [...indexArr, db.collection('products').createIndexes([
      {
        key: { "title": "text", "description": "text", "category": "text", "seoKeywords": "text", "origin": "text", "variations": "text", "highlights": "text", "brand": "text" },
        name: 'productTextIndex',
        default_language: 'english',
        weights: { description: 10, title: 3 }
      },
      { key: { title: 1, }, name: 'productUniqueIndex' }
    ])]
  });

  const allUsersIndexName = await db.collection("users").listIndexes().toArray();
  allUsersIndexName.forEach(element => {
    if (element.name === 'userUniqueIndex') {
      return;
    }
    indexArr = [...indexArr, db.collection('users').createIndexes([
      { key: { email: 1, }, unique: true, name: 'userUniqueIndex' }
    ])]
  });

  const allRatingsIndexName = await db.collection("ratings").listIndexes().toArray();
  allRatingsIndexName.forEach(element => {
    if (element.name === 'ratingsUniqueIndex') {
      // db.collection('ratings').dropIndex('ratingsUniqueIndex');
      return;
    }
    indexArr = [...indexArr, db.collection('ratings').createIndexes([
      { key: { userId: 1, postId: 1 }, name: 'ratingUniqueIndex' }
    ])]
  });

  await Promise.all([
    ...indexArr
  ]);
}
