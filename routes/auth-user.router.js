const router = require("express").Router();
const {makeResponseCallback} = require("../interface-adapters/adapter/response-adapter");
const {createUserControllerHandler, loginUserControllerHandler} = require("../interface-adapters/controllers/users")

const loginLimiter = require("../interface-adapters/middlewares/loginLimiter"); 


router
    .route("/register")
    .post( async(req, res) => makeResponseCallback(createUserControllerHandler)(req, res));

router
    .route("/login")
    // .post(loginLimiter, async() => makeResponseCallback(loginUserControllerHandler))
    .post(loginLimiter, async(req, res) => makeResponseCallback(loginUserControllerHandler)(req, res));


module.exports = router;