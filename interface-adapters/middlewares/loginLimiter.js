const rateLimit = require('express-rate-limit');

const {logEvents} = require('./loggers/logger');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1minute

  max: 3, // max IP loggin requests /window/,min

  message: ' Too many loggin attempts for this IP address. Please try again in 60 seconds',

  handler: (req, res, next, options) => {
    logEvents(`Too many requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,'errLog.log');

    res.status(options.statusCode).send(options.message);

  },

  standardHeaders: true, //return rate limit in the `RateLimit-*` headers
  legacyHeaders: false // disabling `X-rateLimit-*` headers

});

module.exports = loginLimiter;

