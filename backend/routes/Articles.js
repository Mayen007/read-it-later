const express = require('express');
const Article = require('../models/Article');
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
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    const articles = await Article.find(query).sort({ created_at: -1 });
    console.log("Articles retrieved from DB:", articles.map(a => a._id)); // Log only IDs for brevity
    res.json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// POST /api/articles - Add new article
router.post('/', async (req, res) => {
  try {
    const { url, tags = [] } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const existing = await Article.findOne({ url });
    if (existing) return res.status(409).json({ error: 'Article already exists' });

    // 1. Create a placeholder article with 'pending' status
    const article = new Article({ url, tags, status: 'pending', title: 'Processing...', excerpt: 'Metadata extraction in progress.' });
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

// PUT /api/articles/:id - Update article
router.put('/:id', async (req, res) => {
  try {
    const { is_read, tags } = req.body;
    const updateData = {};
    if (is_read !== undefined) updateData.is_read = is_read;
    if (tags) updateData.tags = tags;
    updateData.updated_at = new Date();

    const article = await Article.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update article' });
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