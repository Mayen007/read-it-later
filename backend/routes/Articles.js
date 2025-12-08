const express = require('express');
const Article = require('../models/Article');
const Category = require('../models/Category');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

// Helper: Extract metadata from URL
const extractMetadata = async (url) => {
  try {
    const { data } = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(data);
    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Untitled';
    const excerpt = $('meta[property="og:description"]').attr('content') || '';
    const author = $('meta[property="article:author"]').attr('content') || '';
    const thumbnail_url = $('meta[property="og:image"]').attr('content') || '/logo.png';
    return { title, excerpt, author, thumbnail_url };
  } catch (error) {
    return { title: 'Error loading article', excerpt: 'Failed to extract content', author: '', thumbnail_url: '/logo.png' };
  }
};

// GET /api/articles - List all articles
// Supports optional query params: search, category (category id)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.categories = category; // filter by category id

    // Populate category names for convenience in responses
    const articles = await Article.find(query).populate('categories', 'name slug color').sort({ created_at: -1 });
    console.log("Articles retrieved from DB:", articles.map(a => a._id));
    res.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Helper: resolve category identifiers or names to ObjectId array
const resolveCategories = async (categoriesInput = []) => {
  if (!Array.isArray(categoriesInput)) return [];
  const resolved = [];
  for (const c of categoriesInput) {
    // if looks like an ObjectId string (24 hex chars), use as-is
    if (typeof c === 'string' && /^[0-9a-fA-F]{24}$/.test(c)) {
      resolved.push(c);
      continue;
    }

    // Otherwise assume it's a category name; find or create
    const name = String(c).trim();
    if (!name) continue;
    let cat = await Category.findOne({ name });
    if (!cat) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      cat = new Category({ name, slug });
      try {
        await cat.save();
      } catch (e) {
        // ignore duplicate key race and refetch
        cat = await Category.findOne({ name });
      }
    }
    if (cat) resolved.push(cat._id);
  }
  return resolved;
};

// POST /api/articles - Add new article
// Accepts optional `tags` (string[]) and `categories` (array of category ids)
router.post('/', async (req, res) => {
  try {
    const { url, tags = [], categories = [] } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const existing = await Article.findOne({ url });
    if (existing) return res.status(409).json({ error: 'Article already exists' });

    // Resolve categories (names -> ids) and create if needed
    const categoryIds = await resolveCategories(categories);

    // 1. Create a placeholder article with 'pending' status
    const article = new Article({ url, tags, categories: categoryIds, status: 'pending', title: 'Processing...', excerpt: 'Metadata extraction in progress.' });
    await article.save();

    // 2. Send immediate response to client
    res.status(202).json({ message: 'Article processing started', article }); // 202 Accepted

    // 3. Initiate heavy processing in the background (non-blocking)
    //    We don't 'await' this call, allowing the response to be sent first.
    //    The .then() and .catch() will run later in the event loop.
    extractMetadata(url)
      .then(async (metadata) => {
        // 4. Update the article with extracted metadata and 'completed' status
        await Article.findByIdAndUpdate(article._id, {
          ...metadata,
          status: 'completed',
          updated_at: new Date()
        }, { new: true });
        console.log(`Metadata extracted and updated for article: ${article._id}`);
      })
      .catch(async (error) => {
        // 4. Update status to 'failed' if extraction fails
        console.error(`Error during background metadata extraction for ${url}:`, error);
        await Article.findByIdAndUpdate(article._id, {
          status: 'failed',
          error_message: error.message,
          updated_at: new Date()
        }, { new: true });
      });

  } catch (error) {
    console.error("Error saving initial article:", error);
    res.status(500).json({ error: 'Failed to save article initially' });
  }
});

// GET /api/articles/:id - Get single article
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate('categories', 'name slug color');
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// PUT /api/articles/:id - Update article
router.put('/:id', async (req, res) => {
  try {
    const { is_read, tags, categories } = req.body;
    const updateData = {};
    if (is_read !== undefined) updateData.is_read = is_read;
    if (tags) updateData.tags = tags;
    if (categories) updateData.categories = await resolveCategories(categories);
    updateData.updated_at = new Date();

    const article = await Article.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('categories', 'name slug color');
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// PUT /api/articles/bulk-categories - Assign categories to multiple articles
router.put('/bulk-categories', async (req, res) => {
  try {
    const { assignments } = req.body; // [{ id, categories: [catId, ...] }]
    if (!Array.isArray(assignments)) return res.status(400).json({ error: 'Invalid payload' });
    await Promise.all(assignments.map(a => Article.findByIdAndUpdate(a.id, { categories: a.categories, updated_at: new Date() })));
    res.json({ message: 'Bulk category assignment completed' });
  } catch (error) {
    console.error('Bulk category assignment error:', error);
    res.status(500).json({ error: 'Failed to assign categories in bulk' });
  }
});

// DELETE /api/articles/:id - Delete article
router.delete('/:id', async (req, res) => {
  try {
    console.log("Attempting to delete article with ID:", req.params.id);
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json({ message: 'Article deleted' });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

module.exports = router;