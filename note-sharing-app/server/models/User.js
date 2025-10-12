const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// FIX: Destructure Schema from mongoose to make it available
const Schema = mongoose.Schema; 

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: {
    type: String,
    // Note: The default avatar value should ideally be set here or handled client-side.
  },
  savedNotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
   role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Community Features (Required Schema)
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }], 
    
  // Gamification/Badge Data (Cached metrics)
  noteCount: { type: Number, default: 0 },
  blogCount: { type: Number, default: 0 },
}, {
    // Add timestamps for better data integrity and sitemap generation
    timestamps: true 
});

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema,'peerNotez_users');
