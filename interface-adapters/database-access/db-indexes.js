import { makeDb } from '../src/data-access'
import dotenv from 'dotenv'
dotenv.config();

// database collection will automatically be created if it does not exist
// indexes will only be added if they don't exist
//Although indexes improve query performance, adding an index has negative performance impact for write operations
(async function setupDb() {
  console.log('Setting up database...')

  const db = await makeDb()
  const result = await db
    .collection('users')
    .createIndexes([
      { key: { id: 1 }, name: 'userId_idx' },
      { key: { email: 1 }, name: 'email_idx' },
      { background: true, sparse: true }
    ], function (err, result) {
      console.log(result);
      callback(result);
    });

  db.collection("Rating")
    .createIndex([{ userId: 1 }, { postId: 1 }, { background: true, sparse: true }], function (err, result) {
      console.log(result);
      callback(result);
    })


  process.exit()
})()
