const { allowedOrigin } = require("./allowedOrigin");

const corsOptions = {
  origin: (origin, callback) => {
    // no origin because of postman/thunderclient testers
    if (allowedOrigin.includes(origin) || !origin) {
      console.log("CORS origin: ", `${origin}|thunderclient`);
      callback(null, true);
    } else {
      console.log("origin: ", origin || "thunderclient");
      callback(new Error("NOT ALLOW BECAUSE OF CORS"));
    }
  },
  optionSuccessStatus: 200,
  credentials: true,
};

module.exports = corsOptions;
