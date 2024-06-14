const { allowedOrigin } = require("./allowedOrigin");

const corsOptions = {
  origin: (origin, callback) => {
    // no origin because of postman/thunder testers
    if (allowedOrigin.includes(origin) || !origin) {
      console.log({ "original_request": origin });
      callback(null, true);
    } else {
      console.log("origin: ", origin);
      callback(new Error("NOT ALLOW BECAUSE OF CORS"));
    }
  },
  optionSuccessStatus: 200,
  credentials: true,
};

module.exports = corsOptions;
