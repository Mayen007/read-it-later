const express = require('express');
const Article = require('../models/Article');
const Category = require('../models/Category');
const axios = require('axios');
const cheerio = require('cheerio');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Helper: Extract metadata from URL
const extractMetadata = async (url) => {
  try {
    const { data } = await axios.get(url, {
      timeout: 5000, // Reduced from 10s to 5s for faster response
      maxRedirects: 3, // Limit redirects
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate', // Enable compression
      },
      decompress: true, // Auto-decompress responses
    });
    const $ = cheerio.load(data);

    // Try multiple metadata sources in order of preference
    const title = $('meta[property="og:title"]').attr('content')
      || $('meta[name="twitter:title"]').attr('content')
      || $('title').text().trim()
      || new URL(url).hostname;

    let excerpt = $('meta[property="og:description"]').attr('content')
      || $('meta[name="description"]').attr('content')
      || $('meta[name="twitter:description"]').attr('content')
      || '';

    // If no meta description, try to extract first paragraph
    if (!excerpt) {
      // Try common article paragraph selectors
      const firstParagraph = $('article p').first().text().trim()
        || $('.content p').first().text().trim()
        || $('main p').first().text().trim()
        || $('p').first().text().trim();

      if (firstParagraph && firstParagraph.length > 50) {
        // Truncate to reasonable length
        excerpt = firstParagraph.length > 300
          ? firstParagraph.substring(0, 297) + '...'
          : firstParagraph;
      }
    }

    const author = $('meta[property="article:author"]').attr('content')
      || $('meta[name="author"]').attr('content')
      || '';

    const thumbnail_url = $('meta[property="og:image"]').attr('content')
      || $('meta[name="twitter:image"]').attr('content')
      || '/logo.png';

    return { title, excerpt, author, thumbnail_url };
  } catch (error) {
    console.error(`Metadata extraction failed for ${url}:`, error.message);
    // Fallback to URL-based title
    try {
      const urlObj = new URL(url);
      const pathTitle = urlObj.pathname
        .split('/')
        .filter(Boolean)
        .pop()
        ?.replace(/[-_]/g, ' ')
        .replace(/\.\w+$/, '') || urlObj.hostname;

      return {
        title: decodeURIComponent(pathTitle),
        excerpt: `Article from ${urlObj.hostname}`,
        author: '',
        thumbnail_url: '/logo.png'
      };
    } catch {
      return {
        title: 'Saved Article',
        excerpt: 'Content extraction unavailable',
        author: '',
        thumbnail_url: '/logo.png'
      };
    }
  }
};

// GET /api/articles - List all articles
// Supports optional query params: search, category (category id)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = { user_id: req.user.id }; // Filter by authenticated user
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.categories = category; // filter by category id

    // Optimize query with lean() and select only needed fields
    const articles = await Article.find(query)
      .populate('categories', 'name color')
      .select('-__v') // Exclude version key
      .sort({ created_at: -1 })
      .lean() // Return plain JavaScript objects for faster serialization
      .exec();

    // Set cache headers for browser caching (30 seconds)
    res.set('Cache-Control', 'private, max-age=30');
    res.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Helper: resolve category identifiers or names to ObjectId array
const resolveCategories = async (categoriesInput = [], userId) => {
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
    let cat = await Category.findOne({ name, user_id: userId });
    if (!cat) {
      cat = new Category({ name, user_id: userId });
      try {
        await cat.save();
      } catch (e) {
        // ignore duplicate key race and refetch
        cat = await Category.findOne({ name, user_id: userId });
      }
    }
    if (cat) resolved.push(cat._id);
  }
  return resolved;
};

// POST /api/articles - Add new article
// Accepts optional `tags` (string[]) and `categories` (array of category ids)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { url, tags = [], categories = [] } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const existing = await Article.findOne({ url, user_id: req.user.id });
    if (existing) return res.status(409).json({ error: 'Article already exists' });

    // Resolve categories (names -> ids) and create if needed
    const categoryIds = await resolveCategories(categories, req.user.id);

    // 1. Create a placeholder article with 'pending' status
    const article = new Article({
      url,
      tags,
      categories: categoryIds,
      status: 'pending',
      title: 'Processing...',
      excerpt: 'Metadata extraction in progress.',
      user_id: req.user.id
    });
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
          status: 'completed'
        }, { new: true });
        console.log(`Metadata extracted and updated for article: ${article._id}`);
      })
      .catch(async (error) => {
        // 4. Update status to 'failed' if extraction fails
        console.error(`Error during background metadata extraction for ${url}:`, error);
        await Article.findByIdAndUpdate(article._id, {
          status: 'failed',
          error_message: error.message
        }, { new: true });
      });

  } catch (error) {
    console.error("Error saving initial article:", error);
    res.status(500).json({ error: 'Failed to save article initially' });
  }
});

// GET /api/articles/:id - Get single article
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const article = await Article.findOne({ _id: req.params.id, user_id: req.user.id })
      .populate('categories', 'name color')
      .select('-__v')
      .lean()
      .exec();
    if (!article) return res.status(404).json({ error: 'Article not found' });

    // Cache for 1 minute
    res.set('Cache-Control', 'private, max-age=60');
    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// PUT /api/articles/:id - Update article
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { is_read, tags, categories } = req.body;
    const updateData = {};
    if (is_read !== undefined) updateData.is_read = is_read;
    if (tags) updateData.tags = tags;
    if (categories) updateData.categories = await resolveCategories(categories, req.user.id);

    const article = await Article.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      updateData,
      { new: true, lean: true }
    ).populate('categories', 'name color');
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// PUT /api/articles/bulk-categories - Assign categories to multiple articles
router.put('/bulk-categories', authenticateToken, async (req, res) => {
  try {
    const { assignments } = req.body; // [{ id, categories: [catId, ...] }]
    if (!Array.isArray(assignments)) return res.status(400).json({ error: 'Invalid payload' });
    await Promise.all(assignments.map(a =>
      Article.findOneAndUpdate(
        { _id: a.id, user_id: req.user.id },
        { categories: a.categories }
      )
    ));
    res.json({ message: 'Bulk category assignment completed' });
  } catch (error) {
    console.error('Bulk category assignment error:', error);
    res.status(500).json({ error: 'Failed to assign categories in bulk' });
  }
});

// DELETE /api/articles/:id - Delete article
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    console.log("Attempting to delete article with ID:", req.params.id);
    const article = await Article.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json({ message: 'Article deleted' });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

module.exports = router;