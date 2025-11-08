const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  title: { type: String, default: 'Untitled' },
  excerpt: { type: String, default: '' },
  author: { type: String, default: '' },
  thumbnail_url: { type: String, default: '/logo.png' },
  tags: { type: [String], default: [] },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Article', articleSchema);