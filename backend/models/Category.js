const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  color: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
