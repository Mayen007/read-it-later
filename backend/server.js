const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const articlesRoutes = require('./routes/articles');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*', // allow all origins for dev, including Chrome extension
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/articles', articlesRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', database: 'MongoDB' });
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});