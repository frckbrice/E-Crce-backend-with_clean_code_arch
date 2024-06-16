const router = require("express").Router();
const {makeResponseCallback} = require("../interface-adapters/adapter/request-response-adapter");
const {
    registerUserControllerHandler,
     loginUserControllerHandler, 
     findAllUsersControllerHandler, 
     logoutUserControllerHandler, 
    refreshTokenUserControllerHandler, 
    findOneUserControllerHandler, 
    updateUserControllerHandler, 
    deleteUserControllerHandler,
    blockUserControllerHandler,
    unBlockUserControllerHandler
} = require("../interface-adapters/controllers/users")

const loginLimiter = require("../interface-adapters/middlewares/loginLimiter"); 
const {
    authVerifyJwt,
    isAdmin,
    isBlocked
} = require("../interface-adapters/middlewares/auth-verifyJwt");


router
    .route("/register")
    .post( async(req, res) => makeResponseCallback(registerUserControllerHandler)(req, res));

router
    .route("/login")
    .post(loginLimiter, async(req, res) => makeResponseCallback(loginUserControllerHandler)(req, res));

router.route("/").get(authVerifyJwt, isAdmin,async(req, res) => makeResponseCallback(findAllUsersControllerHandler)(req, res));

router
    .route("/logout")
    .post(async(req, res) => makeResponseCallback(logoutUserControllerHandler)(req, res));

router
    .route("/refresh")
    .get( async(req, res) => makeResponseCallback(refreshTokenUserControllerHandler)(req, res));

    //authVerifyJwt, isAdmin,
router  
    .route("/:userId")
    .get(authVerifyJwt, isAdmin, isBlocked,async(req, res) => makeResponseCallback(findOneUserControllerHandler)(req, res));

router 
    .route("/:userId")
    .put(async(req, res) => makeResponseCallback(updateUserControllerHandler)(req, res));
//authVerifyJwt, isAdmin,
router 
    .route("/:userId")
    .delete(async(req, res) => makeResponseCallback(deleteUserControllerHandler)(req, res));

router
    .route("/block-user/:userId")
    .post(async(req, res) => makeResponseCallback(blockUserControllerHandler)(req, res));
// authVerifyJwt, isAdmin to be added
router
    .route("/unblock-user/:userId")
    .post(async(req, res) => makeResponseCallback(unBlockUserControllerHandler)(req, res));
// authVerifyJwt, isAdmin to be added
module.exports = router;