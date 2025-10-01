const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog'); // Assuming correct path

// ==========================================================
// 1. ROUTE TO GET ALL BLOGS (For Homepage Preview)
// ==========================================================
// @route   GET /api/blogs
// @desc    Get all blog posts, populated with author details for the homepage preview
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find()
            // Fetch author name and avatar
            .populate('author', 'name avatar') 
            .sort({ createdAt: -1 })
            .limit(4); 
            
        res.json(blogs);
    } catch (error) {
        console.error("Error fetching homepage blogs:", error); 
        res.status(500).json({ message: 'Server error: Could not fetch blog posts' });
    }
});

// ==========================================================
// 2. NEW ROUTE TO GET A SINGLE BLOG POST BY SLUG (The Fix)
// ==========================================================
// @route   GET /api/blogs/:slug
// @desc    Get a single full blog post by its URL slug
router.get('/:slug', async (req, res) => {
    try {
        // Use findOne to search the collection by the slug parameter from the URL
        const blog = await Blog.findOne({ slug: req.params.slug })
                               .populate('author', 'name avatar'); // Populate the author details

        if (!blog) {
            // If Mongoose returns null, the blog doesn't exist
            return res.status(404).json({ message: 'Blog post not found.' });
        }

        // Return the full blog object (including the 'content' field)
        res.json(blog);
    } catch (error) {
        console.error("Error fetching single blog post:", error);
        res.status(500).json({ message: 'Server error: Could not fetch the requested blog post' });
    }
});

module.exports = router;
