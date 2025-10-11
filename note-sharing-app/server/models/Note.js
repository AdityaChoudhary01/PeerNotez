const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const reviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true }
}, {
  timestamps: true
});

const NoteSchema = new Schema({
  title: { type: String, required: true },
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
  // KEEP this field for your existing frontend UI compatibility
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
  // CRITICAL FIX: Add timestamps to automatically manage createdAt and updatedAt
  timestamps: true 
});

module.exports = mongoose.model('Note', Note', NoteSchema);
