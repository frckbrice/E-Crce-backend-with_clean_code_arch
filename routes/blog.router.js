const express = require('express');
const router = express.Router();




router
    .route('/blogs')
    .post(async (req, res) => {
        // ... create blog post logic
    });

router.get('/blogs', async (req, res) => {
    // ... fetch blog posts logic
});

router
    .route('/blogs/:id')
    .get(async (req, res) => {
        // ... fetch specific blog post logic
    });

router
    .route('/blogs/:id')
    .put(async (req, res) => {
        // ... update blog post logic
    });

router
    .route('/blogs/:id')
    .delete(async (req, res) => {
        // ... delete blog post logic
    });

module.exports = router;
