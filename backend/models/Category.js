const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true }, // User reference for multi-user support
  created_at: { type: Date, default: Date.now },
});

// Compound unique index: same user cannot have duplicate category names
categorySchema.index({ name: 1, user_id: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
