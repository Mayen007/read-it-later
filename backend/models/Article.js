const mongoose = require('mongoose');

// Define the Article schema
const articleSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: { type: String, default: 'Untitled' },
  excerpt: { type: String, default: '' },
  author: { type: String, default: '' },
  thumbnail_url: { type: String, default: '/logo.png' },
  tags: { type: [String], default: [] },
  // Categories: array of ObjectId references to Category collection
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  is_read: { type: Boolean, default: false },
  status: { type: String, default: 'pending', enum: ['pending', 'completed', 'failed'] }, // New field
  error_message: { type: String, default: '' }, // New field
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true }, // User reference for multi-user support
  created_at: { type: Date, default: Date.now },
});

// Compound unique index: same URL can exist for different users
articleSchema.index({ url: 1, user_id: 1 }, { unique: true });

// Additional performance indexes
articleSchema.index({ user_id: 1, created_at: -1 }); // For sorting by date
articleSchema.index({ user_id: 1, status: 1 }); // For filtering by status
articleSchema.index({ user_id: 1, is_read: 1 }); // For filtering read/unread
articleSchema.index({ categories: 1 }); // For category filtering

// Create the Article model
const Article = mongoose.model('Article', articleSchema);

// Export the model
module.exports = Article;
