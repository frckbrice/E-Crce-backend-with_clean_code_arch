const router = require("express").Router();
const {requestAdapter, userRequestResponseHandler} = require("../interface-adapters/adapter")

const loginLimiter = require("../interface-adapters/middlewares/loginLimiter"); 


router
    .route("/register")
    .post( async(req, res) => userRequestResponseHandler(requestAdapter(req, res)))


module.exports = router;