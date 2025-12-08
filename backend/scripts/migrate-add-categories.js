/**
 * Migration script: create a default 'Uncategorized' category and assign it
 * to articles that don't have the `categories` field set.
 *
 * Usage: set MONGODB_URI in env or .env, then run:
 *   node backend/scripts/migrate-add-categories.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDb = require('../config/db');
const Article = require('../models/Article');
const Category = require('../models/Category');

dotenv.config();

const run = async () => {
  try {
    await connectDb();

    let uncategorized = await Category.findOne({ name: 'Uncategorized' });
    if (!uncategorized) {
      uncategorized = new Category({ name: 'Uncategorized', slug: 'uncategorized' });
      await uncategorized.save();
      console.log('Created Uncategorized category:', uncategorized._id);
    }

    const res = await Article.updateMany(
      { $or: [{ categories: { $exists: false } }, { categories: { $size: 0 } }] },
      { $set: { categories: [uncategorized._id], updated_at: new Date() } }
    );
    console.log('Articles updated:', res.nModified || res.modifiedCount || res);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

run();
