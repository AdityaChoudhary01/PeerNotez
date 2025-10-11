const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// New Review Schema for Blogs
const blogReviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, {
  timestamps: true
});

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  content: { type: String, required: true }, // Markdown content
  slug: { type: String, required: true, unique: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  createdAt: { type: Date, default: Date.now },
  
  // Blog Management & Review Fields
  reviews: [blogReviewSchema],
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  downloadCount: { type: Number, required: true, default: 0 }, // Tracks views
  isFeatured: { type: Boolean, required: true, default: false },
});

// Auto-generate slug before validation
blogSchema.pre('validate', function(next) {
    if (this.isNew && !this.slug && this.title) {
        this.slug = this.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
    }
    next();
});

module.exports = mongoose.model('Blog', blogSchema);
