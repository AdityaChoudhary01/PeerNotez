const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog'); 
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const indexingService = require('../utils/indexingService'); // For SEO/Indexing

// Utility function for updating review stats (Only considers top-level, rated comments)
const updateBlogReviewStats = (blog) => {
    // Filter to only include top-level comments that provided a rating (> 0)
    const ratedReviews = blog.reviews.filter(r => !r.parentReviewId && r.rating > 0);
    
    blog.numReviews = ratedReviews.length;
    
    // Calculate new average rating
    blog.rating = ratedReviews.length > 0
        ? ratedReviews.reduce((acc, item) => item.rating + acc, 0) / ratedReviews.length
        : 0;
};

// ==========================================================
// 1. PUBLIC ROUTES (LISTING, SINGLE VIEW, REVIEWS)
// ==========================================================
// @route   GET /api/blogs
// @desc    Get all blog posts with search, filter, sort, and pagination
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;
        const { search, sort, isFeatured } = req.query; // Ensure isFeatured is extracted

        let query = {};
        
        // --- FEATURED BLOG FILTERING ---
        if (isFeatured === 'true') {
            query.isFeatured = true; 
        }
        // -------------------------------

        if (search) {
            query = {
                ...query, // Merge with existing query (e.g., isFeatured)
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { summary: { $regex: search, $options: 'i' } },
                ]
            };
        }

        let sortOptions = { createdAt: -1 }; 
        if (sort === 'highestRated') sortOptions = { rating: -1 };
        if (sort === 'mostViewed') sortOptions = { downloadCount: -1 };

        const count = await Blog.countDocuments(query);
        const blogs = await Blog.find(query)
            .populate('author', 'name avatar') 
            .sort(sortOptions)
            .limit(limit)
            .skip(limit * (page - 1));
            
        res.json({ blogs, page, totalPages: Math.ceil(count / limit) });
    } catch (error) {
        console.error("Error fetching blogs:", error); 
        res.status(500).json({ message: 'Server error: Could not fetch blog posts' });
    }
});

// @route   GET /api/blogs/id/:id
// @desc    Get a single blog post by its MongoDB ID (Protected for editing/internal use)
router.get('/id/:id', protect, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('author', 'name avatar')
            .populate({
                path: 'reviews.user',
                select: 'name avatar'
            });

        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found by ID.' });
        }
        
        // OPTIONAL SECURITY CHECK: Only allow author or admin to access this ID route directly
        if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to access this blog detail route.' });
        }

        res.json(blog);
    } catch (error) {
        // Mongoose cast error if the ID format is wrong
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Invalid Blog ID format.' });
        }
        console.error("Error fetching single blog post by ID:", error);
        res.status(500).json({ message: 'Server error: Could not fetch the requested blog post by ID' });
    }
});

// @route   GET /api/blogs/my-blogs
router.get('/my-blogs', protect, async (req, res) => {
    try {
        const limit = 8;
        const page = Number(req.query.page) || 1;
        
        const query = { author: req.user._id }; 

        const totalBlogs = await Blog.countDocuments(query);

        const blogs = await Blog.find(query)
          .populate('author', 'name avatar') 
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(limit * (page - 1));

        res.json({ blogs, page, totalPages: Math.ceil(totalBlogs / limit), totalBlogs });

    } catch (error) {
        console.error('Error fetching my blogs:', error);
        res.status(500).json({ message: 'Server Error occurred while fetching your blogs.' });
    }
});


// @route   GET /api/blogs/:slug
// @desc    Get a single full blog post by its URL slug and increment view count
router.get('/:slug', async (req, res) => {
    try {
        // Find and increment view count
        const blog = await Blog.findOneAndUpdate(
            { slug: req.params.slug },
            { $inc: { downloadCount: 1 } }, 
            { new: false } 
        );


        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found.' });
        }

        // Fetch the post again to get the updated document with populated fields
        const updatedBlog = await Blog.findById(blog._id)
                                .populate('author', 'name avatar')
                                .populate({
                                    path: 'reviews.user',
                                    select: 'name avatar'
                                });
                                
        res.json(updatedBlog);
    } catch (error) {
        console.error("Error fetching single blog post:", error);
        res.status(500).json({ message: 'Server error: Could not fetch the requested blog post' });
    }
});

// @route   POST /api/blogs/:id/reviews
// @desc    Create a new review/comment for a blog, supporting nested replies
router.post('/:id/reviews', protect, async (req, res) => {
    // ADDED: parentReviewId for nested comments
    const { rating, comment, parentReviewId } = req.body; 
    
    try {
        const blog = await Blog.findById(req.params.id);

        if (blog) {
            
            // ----------------------------------------------------
            // FIX START: Determine finalRating or if it should be absent
            // ----------------------------------------------------
            let finalRating;
            
            if (parentReviewId) {
                // For replies, set rating to undefined so Mongoose ignores it 
                // and avoids the 'min: 1' validation.
                finalRating = undefined;
            } else {
                // For top-level reviews, use the submitted rating (or 0 if not submitted)
                finalRating = Number(rating) || 0;
                
                // Top-Level Review Checks
                const alreadyReviewedTopLevel = blog.reviews.some(
                    r => r.user.toString() === req.user.id.toString() && !r.parentReviewId
                );
                if (alreadyReviewedTopLevel) {
                    return res.status(400).json({ message: 'You have already posted a top-level review for this blog.' });
                }
            }
            // ----------------------------------------------------
            // FIX END
            // ----------------------------------------------------


            // IMPORTANT: If finalRating is 0, the validation will still fail! 
            // We must only include the rating field if it's > 0 or if it's a top-level review 
            // that hasn't been rated (which we handle with 'required: false' on the schema).
            
            const reviewData = { 
                user: req.user.id, 
                comment,
                parentReviewId: parentReviewId || null 
            };
            
            // Only add the rating field if it is NOT undefined.
            // This prevents Mongoose from trying to save the value 0 for replies.
            if (finalRating !== undefined) {
                 reviewData.rating = finalRating;
            }


            blog.reviews.push(reviewData);

            // Only update stats if this is a top-level comment with a rating
            // The check needs to be against the submitted rating for accuracy.
            if (!parentReviewId && finalRating >= 1) { // Check against finalRating >= 1
                updateBlogReviewStats(blog);
            }

            await blog.save();
            
            const newReview = blog.reviews[blog.reviews.length - 1];

            res.status(201).json({ message: 'Comment added successfully!', review: newReview });
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (error) {
        // IMPROVED ERROR HANDLING: Catch Mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: "Validation Failed: " + error.message, 
                errors: error.errors 
            });
        }
        console.error('Error adding blog review:', error);
        res.status(500).json({ message: 'Server Error occurred while adding comment.' });
    }
});

// ==========================================================
// 2. PRIVATE/ADMIN ROUTES (CRUD)
// ==========================================================

// @route   POST /api/blogs
// @desc    Create a new blog post (Protected)
router.post('/', protect, async (req, res) => {
    const { title, summary, content, slug } = req.body;
    try {
        const newBlog = new Blog({
            title,
            summary,
            content,
            slug: slug || title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-'),
            author: req.user._id,
        });

        const savedBlog = await newBlog.save();
        
        // NEW: Increment user's blogCount (for Gamification)
        await req.user.updateOne({ $inc: { blogCount: 1 } });
        
        // Indexing API call for creation/update
        await indexingService.urlUpdated(savedBlog.slug, 'blog'); 
        res.status(201).json(savedBlog);

    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(400).json({ message: 'Failed to create blog. Slug might be duplicated.' });
    }
});


// @route   PUT /api/blogs/:id
// @desc    Update a blog (Owner or Admin)
router.put('/:id', protect, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        // Check if user is the author OR an admin
        if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to update this blog' });
        }
        
        const { title, summary, content, slug } = req.body;

        if (title) blog.title = title;
        if (summary) blog.summary = summary;
        if (content) blog.content = content;
        if (slug) blog.slug = slug;

        const updatedBlog = await blog.save();
        // Indexing API call for update
        await indexingService.urlUpdated(updatedBlog.slug, 'blog');
        res.json(updatedBlog);

    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ message: 'Server Error occurred while updating the blog.' });
    }
});

// @route   PUT /api/blogs/:id/toggle-featured
// @desc    Toggle a blog's featured status (Admin only)
router.put('/:id/toggle-featured', protect, admin, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found.' });
        }

        blog.isFeatured = !blog.isFeatured;

        const updatedBlog = await blog.save();
        res.json({
            message: `Blog's featured status updated to ${updatedBlog.isFeatured}.`,
            isFeatured: updatedBlog.isFeatured
        });

    } catch (error) {
        console.error('Error toggling blog featured status:', error);
        res.status(500).json({ message: 'Server Error occurred while updating the blog.' });
    }
});


// @route   DELETE /api/blogs/:id
// @desc    Delete a blog (Owner or Admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        // Check if user is the author OR an admin
        if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to delete this blog' });
        }
        
        // NEW: Decrement user's blogCount (for Gamification)
        await req.user.updateOne({ $inc: { blogCount: -1 } });
        
        await indexingService.urlDeleted(blog.slug, 'blog');
        await blog.deleteOne();
        res.json({ message: 'Blog removed successfully' });

    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ message: 'Server Error occurred while deleting the blog.' });
    }
});


module.exports = router;
