const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  color: { type: String, default: '' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true }, // User reference for multi-user support
  created_at: { type: Date, default: Date.now },
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
