const MongoClient = require("mongodb").MongoClient;
const { MongoServerSelectionError, MongoServerClosedError, MongoServerError } = require("mongodb");
const { logEvents } = require("../../interface-adapters/middlewares/loggers/logger")
module.exports = {

    /**
 * Establishes a connection to the MongoDB database and returns a reference to the database.
 *
 * @return {Promise<Db>} A promise that resolves to a reference to the MongoDB database.
 */
    dbconnection: async () => {
        // The MongoClient is the object that references the connection to our
        // datastore (Atlas, for example)
        const client = new MongoClient(process.env.DB_URI);

        // The connect() method does not attempt a connection; instead it instructs
        // the driver to connect using the settings provided when a connection
        // is required.
        try {
            await client.connect();
        } catch (err) {
            console.log("error connecting to database", err);
            if (err instanceof MongoServerSelectionError || MongoServerClosedError || MongoServerError) {
                logEvents(
                    `${err.no}:${err.message}\t${err.syscall}\t${err.hostname}`,
                    "mongoErrLog.log"
                );
            }
        }

        // Provide the name of the database and collection you want to use.
        // If the database and/or collection do not exist, the driver and Atlas
        // will create them automatically when you first write data.
        const datastoreName = "digital-market-place-updates";


        // Create references to the database and collection in order to run
        // operations on them.
        const database = client.db(datastoreName);
        // const userCollection = database.collection("users");


        return database;
    }
}
