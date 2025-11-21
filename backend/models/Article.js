const mongoose = require('mongoose');

// Define the Article schema
const articleSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  title: { type: String, default: 'Untitled' },
  excerpt: { type: String, default: '' },
  author: { type: String, default: '' },
  thumbnail_url: { type: String, default: '/logo.png' },
  tags: { type: [String], default: [] },
  is_read: { type: Boolean, default: false },
  status: { type: String, default: 'pending', enum: ['pending', 'completed', 'failed'] }, // New field
  error_message: { type: String, default: '' }, // New field
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

// Create the Article model
const Article = mongoose.model('Article', articleSchema);

// Export the model
module.exports = Article;
