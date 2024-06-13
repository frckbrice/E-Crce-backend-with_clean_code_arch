

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { connection } = require('./database-access/db-connection.js');

connection().then((db) => {
    console.log("database connected: ", db.databaseName);
})

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));



app.use('/', (req, res) => {
    res.send('hello world');
});

app.use((req, res, next) => {
  const dntHeader = req.headers['dnt']; // Access DNT header (if present)
  if (dntHeader === '1') {
    console.log('User has DNT enabled');
    // Implement logic to handle DNT preference (e.g., disable tracking features)
  }
  next(); // Pass control to the next middleware or route handler
});




app.listen(PORT, () => console.log(`Server started on port http://localhost:${PORT}`));

module.exports = app;
