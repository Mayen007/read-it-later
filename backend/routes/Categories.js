const express = require('express');
const Category = require('../models/Category');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// GET /api/categories - list categories
router.get('/', authenticateToken, async (req, res) => {
  try {
    const categories = await Category.find({ user_id: req.user.id }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories - create category
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, color = '' } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const category = new Category({ name, color, user_id: req.user.id });
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Error creating category:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A category with this name already exists' });
    }

    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/categories/:id - update category
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, color } = req.body;
    const update = {};
    if (name) update.name = name;
    if (color !== undefined) update.color = color;
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      update,
      { new: true }
    );
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/categories/:id - delete category
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
