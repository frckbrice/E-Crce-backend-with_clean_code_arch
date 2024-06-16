const express = require('express');
require('dotenv').config();
const cors = require('cors');
const path = require('path');

const { dbconnection } = require('./framework-and-drivers/database-access/db-connection.js');
const errorHandler = require('./interface-adapters/middlewares/loggers/errorHandler.js');
const router = require('./routes/auth-user.router.js');
const { logger } = require('./interface-adapters/middlewares/loggers/logger.js');

const app = express();

const PORT = process.env.PORT || 5000;
var cookieParser = require('cookie-parser');
const corsOptions = require('./interface-adapters/config/corsOptions.Js');


// databae connetion call function
dbconnection().then((db) => {
    console.log("database connected: ", db.databaseName);
});

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use('/users', router);

app.use("/", (_, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "index.html"));
});



//for no specified endpoint that is not found. this must after all the middlewares
app.all("*", (req, res) => {
    res.status(404);
    if (req.accepts("html")) {
        res.sendFile(path.join(__dirname, "public", "views", "404.html"));
    } else if (req.accepts("json")) {
        res.json({ msg: "404 Not Found" });
    } else {
        res.type("txt").send("404 Not Found");
    }
});

app.use((req, res, next) => {
    // Access DNT header (if present)
    const dntHeader = req.headers['dnt'];
    if (dntHeader === '1') {
        console.log('User has DNT enabled');
        // TODO: Implement logic to handle DNT preference (e.g., disable tracking features)
    }
    // Pass control to the next middleware or route handler
    next();
});


app.use(errorHandler);


app.listen(PORT, () => console.log(`Server started on port http://localhost:${PORT}`));
