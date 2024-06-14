const router = require("express").Router();
const {makeResponseCallback} = require("../interface-adapters/adapter/response-adapter");
const {createUserControllerHandler, loginUserControllerHandler, findAllUsersControllerHandler, logoutUserControllerHandler, refreshTokenUserControllerHandler, findOneUserControllerHandler, updateUserControllerHandler, deleteUserControllerHandler} = require("../interface-adapters/controllers/users")

const loginLimiter = require("../interface-adapters/middlewares/loginLimiter"); 


router
    .route("/register")
    .post( async(req, res) => makeResponseCallback(createUserControllerHandler)(req, res));

router
    .route("/login")
    // .post(loginLimiter, async() => makeResponseCallback(loginUserControllerHandler))
    .post(loginLimiter, async(req, res) => makeResponseCallback(loginUserControllerHandler)(req, res));

router.route("/").get(async(req, res) => {
    console.log("all users routes req url", req.url);
    makeResponseCallback(findAllUsersControllerHandler)(req, res);
});

router
    .route("/logout")
    .post(async(req, res) => makeResponseCallback(logoutUserControllerHandler)(req, res));

router
    .route("/refresh")
    .post(async(req, res) => makeResponseCallback(refreshTokenUserControllerHandler)(req, res));

router  
    .route("/:userId")
    .get(async(req, res) => makeResponseCallback(findOneUserControllerHandler)(req, res));

router 
    .route("/:userId")
    .put(async(req, res) => makeResponseCallback(updateUserControllerHandler)(req, res));

router 
    .route("/:userId")
    .delete(async(req, res) => makeResponseCallback(deleteUserControllerHandler)(req, res));


module.exports = router;