

const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { connection } = require('./framework-and-drivers/database-access/db-connection.js');
const errorHandler = require('./middlewares/loggers/errorHandler.js');
const userRouter = require('./routes/user.router.js');

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
app.use("/users", userRouter);


//for no specified endpoint that is not found. this must after all the middlewares
app.all("*", (req, res) => {
    res.status(404);
    if (req.accepts("html")) {
      res.sendFile(path.join(__dirname, "views", "404.html"));
    } else if (req.accepts("json")) {
      res.json({ msg: "404 Not Found" });
    } else {
      res.type("txt").send("404 Not Found");
    }
});

app.use((req, res, next) => {
  const dntHeader = req.headers['dnt']; // Access DNT header (if present)
  if (dntHeader === '1') {
    console.log('User has DNT enabled');
    // Implement logic to handle DNT preference (e.g., disable tracking features)
  }
  next(); // Pass control to the next middleware or route handler
});


app.use(errorHandler);

app.listen(PORT, () => console.log(`Server started on port http://localhost:${PORT}`));

module.exports = app;
