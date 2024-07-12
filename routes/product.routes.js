const router = require("express").Router();
const requestResponseAdapter = require("../interface-adapters/adapter/request-response-adapter");
const {
    findAllProductControllerHandler,
    updateProductControllerHandler,
    deleteProductControllerHandler,
    createProductControllerHandler,
    rateProductControllerHandler,
    // findProductRatingControllerHandler,
    // findBestUserRaterControllerHandler,
    findOneProductControllerHandler
} = require("../interface-adapters/controllers/products");

const {
    authVerifyJwt,
    isAdmin,
    isBlocked
} = require("../interface-adapters/middlewares/auth-verifyJwt");


router
    .route("/")
    .post(async (req, res) => requestResponseAdapter(createProductControllerHandler)(req, res));

router
    .route("/:productId")
    .get(async (req, res) => requestResponseAdapter(findOneProductControllerHandler)(req, res));

router.
    route("/")
    .get(async (req, res) => requestResponseAdapter(findAllProductControllerHandler)(req, res));


router.
    route("/:productId")
    .delete(async (req, res) => requestResponseAdapter(deleteProductControllerHandler)(req, res));

router.
    route("/:productId")
    .put(async (req, res) => requestResponseAdapter(updateProductControllerHandler)(req, res));



// rating 
router.
    route("/:productId/:userId/rating")
    .post(async (req, res) => requestResponseAdapter(rateProductControllerHandler)(req, res));

// //product rating average
// router.
//     route("/:productId/rating")
//     .get(async (req, res) => requestResponseAdapter(findProductRatingControllerHandler)(req, res));

// //best user rater
// router.
//     route("/best-user/:productId")
//     .get(async (req, res) => requestResponseAdapter(findBestUserRaterControllerHandler)(req, res));




module.exports = router;