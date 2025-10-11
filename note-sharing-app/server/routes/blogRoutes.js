const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog'); 
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Utility function for updating review stats
const updateBlogReviewStats = (blog) => {
    blog.numReviews = blog.reviews.length;
    blog.rating = blog.reviews.length > 0
        ? blog.reviews.reduce((acc, item) => item.rating + acc, 0) / blog.reviews.length
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
        
        // --- CRITICAL FIX: FEATURED BLOG FILTERING ---
        if (isFeatured === 'true') {
            query.isFeatured = true; 
        }
        // ---------------------------------------------

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

// @route   GET /api/blogs/my-blogs (Placed BEFORE /:slug)
// FIX: Uses req.user._id and populates author
router.get('/my-blogs', protect, async (req, res) => {
    try {
        const limit = 8;
        const page = Number(req.query.page) || 1;
        
        // Ensure consistent use of req.user._id for filtering
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
        const blog = await Blog.findOneAndUpdate(
            { slug: req.params.slug },
            { $inc: { downloadCount: 1 } }, 
            { new: false } 
        ).populate('author', 'name avatar')
         .populate({
             path: 'reviews.user',
             select: 'name avatar'
         });


        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found.' });
        }

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

// @route   POST /api/blogs/:id/reviews
// @desc    Create a new review/comment for a blog
router.post('/:id/reviews', protect, async (req, res) => {
    const { rating, comment } = req.body;
    try {
        const blog = await Blog.findById(req.params.id);
        if (blog) {
            const alreadyReviewed = blog.reviews.find(r => r.user.toString() === req.user.id.toString());
            if (alreadyReviewed) {
                return res.status(400).json({ message: 'You have already reviewed this blog' });
            }

            const review = { user: req.user.id, rating: Number(rating), comment };
            blog.reviews.push(review);

            updateBlogReviewStats(blog);

            await blog.save();
            res.status(201).json({ message: 'Review added successfully!', review });
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (error) {
        console.error('Error adding blog review:', error);
        res.status(500).json({ message: 'Server Error occurred while adding review.' });
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

        await blog.deleteOne();
        res.json({ message: 'Blog removed successfully' });

    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ message: 'Server Error occurred while deleting the blog.' });
    }
});


module.exports = router;
