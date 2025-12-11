const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const articlesRoutes = require('./routes/Articles');
const categoriesRoutes = require('./routes/Categories');
const authRoutes = require('./routes/Auth');
const connectDb = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

connectDb();

// Middleware
app.use(cors({
  origin: ['https://readitt.netlify.app', 'http://localhost:3000', 'http://localhost:5173'], // Whitelisted origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/categories', categoriesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', database: 'MongoDB' });
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});