const jwt = require("jsonwebtoken");
const expressAsyncHandler = require("express-async-handler");

const authVerifyJwt = expressAsyncHandler((req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;


  if (!authHeader?.startsWith("Bearer ")) {
    return  res.status(401).send("UnAuthorized. need to login first");
  }

  //get the token from the header
  const token = authHeader.split(" ")[1];
  if (!token) {
    return  res.status(401).send("UnAuthorized. need to login first");
  }

  try {
    
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRETKEY,
    (err, decodedUserInfo) => {
      if (err) {
        return  res.status(403).send("ACCESS_FORBIDDEN. TOKEN_EXPIRED");
      }

      if (!decodedUserInfo) {
        return  res.status(401).send("UNAUTHORRIZED. NEED TO LOGIN FIRST");
      }
      const userInfo = {}
      userInfo.email = decodedUserInfo.email;
      userInfo.id = decodedUserInfo.id;
      userInfo.roles = decodedUserInfo.roles;
      userInfo.isBlocked = decodedUserInfo.isBlocked;
      req.user = userInfo;

      next();
    }
  );
  } catch (error) {
    console.error("catch error on authVerifyJwt",err);
    logEvents(
      `${e.no}:${e.code}\t${e.name}\t${e.message}`,
      "authVerifyJwt.log"
  );
  }
});

const isAdmin = (req, res, next) => {
  if (req.user.roles.includes("admin")) {
    next();
  } else {
    return  res.status(403).send("ACCESS_DENIED. NOT AN ADMIN");
  }
};

const isBlocked = (req, res, next) => {
  if (req.user.isBlocked) {
    return  res.redirect("/");
  } else {
    next();
  }
};

module.exports = {authVerifyJwt, isAdmin, isBlocked};
