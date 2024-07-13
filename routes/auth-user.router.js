const router = require("express").Router();
const makeResponseCallback = require("../interface-adapters/adapter/request-response-adapter");

const userControllerHandlers = require("../interface-adapters/controllers/users")

const loginLimiter = require("../interface-adapters/middlewares/loginLimiter");
const {
    authVerifyJwt,
    isAdmin,
    isBlocked
} = require("../interface-adapters/middlewares/auth-verifyJwt");


router
    .route("/auth/register")
    .post(async (req, res) => makeResponseCallback(userControllerHandlers.registerUserControllerHandler)(req, res));

router
    .route("/auth/login")
    .post(loginLimiter, async (req, res) => makeResponseCallback(userControllerHandlers.loginUserControllerHandler)(req, res));

// forgot password route

router
    .route("/auth/forgot-password")
    .post(async (req, res) => makeResponseCallback(userControllerHandlers.forgotPasswordControllerHandler)(req, res));

router      // TODO: implement reset password simulated. update this with the correct route for reset password in line 32 below
    .route("/auth/reset-password/:token")
    .put(async (req, res) => makeResponseCallback(userControllerHandlers.resetPasswordControllerHandler)(req, res));

router
    .route("/auth/reset-password")
    .put(async (req, res) => makeResponseCallback(userControllerHandlers.resetPasswordControllerHandler)(req, res));

router
    .route("/")
    .get(authVerifyJwt, isAdmin, async (req, res) => makeResponseCallback(userControllerHandlers.findAllUsersControllerHandler)(req, res));

router
    .route("/logout")
    .post(async (req, res) => makeResponseCallback(userControllerHandlers.logoutUserControllerHandler)(req, res));

router
    .route("/refresh")
    .get(async (req, res) => makeResponseCallback(userControllerHandlers.refreshTokenUserControllerHandler)(req, res));

//authVerifyJwt, isAdmin,
router
    .route("/:userId")
    .get(authVerifyJwt, isAdmin, isBlocked, async (req, res) => makeResponseCallback(userControllerHandlers.findOneUserControllerHandler)(req, res));

router
    .route("/:userId")
    .put(async (req, res) => makeResponseCallback(updateUserControllerHandler)(req, res));
//authVerifyJwt, isAdmin,
router
    .route("/:userId")
    .delete(async (req, res) => makeResponseCallback(deleteUserControllerHandler)(req, res));

router
    .route("/block-user/:userId")
    .post(async (req, res) => makeResponseCallback(blockUserControllerHandler)(req, res));
// authVerifyJwt, isAdmin to be added
router
    .route("/unblock-user/:userId")
    .post(async (req, res) => makeResponseCallback(unBlockUserControllerHandler)(req, res));
// authVerifyJwt, isAdmin to be added




module.exports = router;
