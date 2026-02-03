const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: false, min: 1, max: 5 }, 
  comment: { type: String, required: true },
  parentReviewId: { type: Schema.Types.ObjectId, default: null } 
}, {
  timestamps: true
});

const NoteSchema = new Schema({
  title: { type: String, required: true },
  description: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: [20, 'Description must be at least 20 characters long'] 
  },
  university: { type: String, required: true, trim: true },
  course: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  cloudinaryId: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadDate: { type: Date, default: Date.now },
  reviews: [reviewSchema],
  rating: {
    type: Number,
    required: true,
    default: 0
  },
  numReviews: {
    type: Number,
    required: true,
    default: 0
  },
  downloadCount: {
    type: Number,
    required: true,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  // FIX 3: Enable automatic timestamps (createdAt, updatedAt)
  timestamps: true 
});

// Create text index for better search performance
NoteSchema.index({ title: 'text', description: 'text', subject: 'text' });

module.exports = mongoose.model('Note', NoteSchema);
