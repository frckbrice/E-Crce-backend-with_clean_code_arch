const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

/**
 * Asynchronously logs events with a message to a specified log file.
 *
 * @param {string} message - The message to be logged.
 * @param {string} logFileName - The name of the log file.
 */
// const logEvents = (message, logFileName) => {
//   const dateTime = format(new Date(), "yyyy-MM-dd\tHH:mm:ss");
//   const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

//   fs.appendFile(path.join(__dirname, "..", "logs", logFileName), logItem, (err) => {
//     if (err) {
//       console.error(err);
//     }
//   });
// };


const logEvents = async (message, logFileName) => {
  const dateTime = format(new Date(), "yyyy-MM-dd\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    );
  } catch (err) {
    console.log(err);
  }
};

/**
 * Middleware function that logs the request method, URL, and origin to a log file and the console.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {void}
 */
const logger = (err, req, res, next) => {
  logEvents(`${req.method}\t${req.url}\t${err.TypeError}`, "reqLog.log");
  console.log(`${req.method} ${req.path}`);
  next();
};

module.exports = { logEvents, logger };
