const jwt = require("jsonwebtoken");

const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  console.log("\n\nin the verifcation service: before 401 \n\n");

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).send("UnAuthorized. need to login first");
  }

  console.log("\n\nin the verifcation service: after 401 \n\n");

  console.log("authHeader: ", authHeader);

  const token = authHeader.split(" ")[1];

  console.log("token", token);

  if (!token) {
    return res.status(401).send("UnAuthorized. need to login first");
  }

  console.log("\n\n secret key: ", process.env.ACCESS_TOKEN_SECRETKEY);
  console.log("\n\n");

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRETKEY,
    (err, decodedUserInfo) => {
      if (err) {
        console.log("\n\n error 403: ", err);
        console.log("\n\n");
        return res.status(403).json({ message: "Forbidden" });
      }

      if (!decodedUserInfo) {
        return res.status(400).json({ message: "no decodedUserInfo" });
      }
      req.user = decodedUserInfo.userInfo.username;
      req.userId = decodedUserInfo.userInfo.userId;
      req.roles = decodedUserInfo.userInfo.roles;
      if (decodedUserInfo.userInfo.email)
        req.email = decodedUserInfo.userInfo.email;
      req.picture = decodedUserInfo.userInfo.picture;
      console.log("\n\nuser", req.user);
      console.log("\n\ndecodeuser", decodedUserInfo);

      next();
    }
  );
};

module.exports = verifyJwt;
