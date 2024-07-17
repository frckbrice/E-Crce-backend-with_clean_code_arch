const router = require("express").Router();
const requestResponseAdapter = require("../interface-adapters/adapter/request-response-adapter");
const productControllerHamdlers = require("../interface-adapters/controllers/products");

const {
    authVerifyJwt,
    isAdmin,
    isBlocked
} = require("../interface-adapters/middlewares/auth-verifyJwt");


router
    .route("/")
    .post(async (req, res) => requestResponseAdapter(productControllerHamdlers.createProductControllerHandler)(req, res));

router
    .route("/:productId")
    .get(async (req, res) => requestResponseAdapter(productControllerHamdlers.findOneProductControllerHandler)(req, res));

router.
    route("/")
    .get(async (req, res) => requestResponseAdapter(productControllerHamdlers.findAllProductControllerHandler)(req, res));


router.
    route("/:productId")
    .delete(async (req, res) => requestResponseAdapter(productControllerHamdlers.deleteProductControllerHandler)(req, res));

router.
    route("/:productId")
    .put(async (req, res) => requestResponseAdapter(productControllerHamdlers.updateProductControllerHandler)(req, res));

// rating 
router.
    route("/:productId/:userId/rating")
    .post(async (req, res) => requestResponseAdapter(productControllerHamdlers.rateProductControllerHandler)(req, res));


module.exports = router;
