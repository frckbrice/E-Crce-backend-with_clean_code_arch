/**
 *  Product = {
  title: 'T-shirt',
  descripton: 'These examples use strong verbs, descriptive adjectives, and focus on the key',
  price: 19.99,
  images: [ 'image1.jpg', 'image2.jpg' ],
  category: { '$ref': 'Clothing', '$id': '12365899' },
  inventory: 50,
  creationDate: 2013-03-24T00:00:00.000Z,
  expirationDate: 2025-08-20T00:00:00.000Z,
  origin: 'canada',
  variations: [
    {
      size: 'S',
      color: 'Red',
      material: 'Cotton',
      fit: 'Regular',
      quantity: 10
    },
    {
      size: 'M',
      color: 'Blue',
      material: 'Cotton',
      fit: 'Regular',
      quantity: 20
    }
  ],
  highlights: [ 'Comfortable', 'Stylish', '100% Cotton' ],
  already in variations -----> specifications: { material: 'Cotton', fit: 'Regular' },
  seoKeywords: [ 'Comfortable', 'Stylish', '100% Cotton' ],
  salePrice: 19,
  slug: 't-shirt',
  created_At: '2024-06-22T13:26:22.390Z',
  totalRatings: [ 0, 0, 0, 0, 0 ],
  totalReviews: 0,
  totalSales: 0,
  rateAverage: 0,
  lastModified: null,
  instock: true,
  latestRating: null
}https://www.amazon.de/
 */

/***
 * Rating = {
 *    userId: string,
 *    ratingValue: number,
 *    productId: string,
 *    date: string,
 *    id: string
 * }
 * 
 */

/*

  // const uri = 'mongodb://mongodb0.example.com:27017,mongodb1.example.com:27017/?replicaSet=myRepl'
  // For a sharded cluster, connect to the mongos instances; e.g.
  // const uri = 'mongodb://mongos0.example.com:27017,mongos1.example.com:27017/'
  
  
  const client = new MongoClient(uri);
  await client.connect();
  // Prereq: Create collections.
  await client
    .db('mydb1')
    .collection('foo')
    .insertOne({ abc: 0 }, { writeConcern: { w: 'majority' } });
  await client
    .db('mydb2')
    .collection('bar')
    .insertOne({ xyz: 0 }, { writeConcern: { w: 'majority' } });
  
  
    // Step 1: Start a Client Session
  const session = client.startSession();
  // Step 2: Optional. Define options to use for the transaction
  const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'local' },
    writeConcern: { w: 'majority' }
  };
  // Step 3: Use withTransaction to start a transaction, execute the callback, and commit (or abort on error)
  // Note: The callback for withTransaction MUST be async and/or return a Promise.
  try {
    await session.withTransaction(async () => {
      const coll1 = client.db('mydb1').collection('foo');
      const coll2 = client.db('mydb2').collection('bar');

      // Important:: You must pass the session to the operations
      await coll1.insertOne({ abc: 1 }, { session });
      await coll2.insertOne({ xyz: 999 }, { session });
    }, transactionOptions);
  } finally {
    await session.endSession();
    await client.close();
  }


*/