const express = require('express');
const router = express.Router();

//get blog controller handlers
const blogcontrollerHandlers = require("../interface-adapters/controllers/blog")

//call the adapter
const requestResponseAdapter = require("../interface-adapters/adapter/request-response-adapter");
const {
    authVerifyJwt,
    isAdmin,
    isBlocked
} = require("../interface-adapters/middlewares/auth-verifyJwt");


// create blog post
router
    .route('/')
    .post(authVerifyJwt,
        isAdmin,
        isBlocked, async (req, res) => requestResponseAdapter(blogcontrollerHandlers.createBlogPostControllerHandler)(req, res));


//get all blog posts
router
    .route("/")
    .get(async (req, res) => requestResponseAdapter(blogcontrollerHandlers.findAllBlogPostControllerHandler)(req, res));

// get single blog post
router
    .route('/:blogId')
    .get(async (req, res) => requestResponseAdapter(blogcontrollerHandlers.findOneblogPostControllerHandler)(req, res));

// update blog post
router
    .route('/:blogId')
    .put(authVerifyJwt,
        isAdmin,
        isBlocked, async (req, res) => requestResponseAdapter(blogcontrollerHandlers.updateBlogPostControllerHandler)(req, res));


// delete blog post
router
    .route('/:blogId')
    .delete(async (req, res) => requestResponseAdapter(blogcontrollerHandlers.deleteBlogPostControllerHandler)(req, res));

// react on a blog post
router
    .route('/:blogId')
    .patch(authVerifyJwt, async (req, res) => requestResponseAdapter(blogcontrollerHandlers.rateBlogPostControllerHandler)(req, res));

module.exports = router;
