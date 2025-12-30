const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pool settings for better performance
      maxPoolSize: 10,
      minPoolSize: 2,
      // Increased timeouts to handle cold starts (when server wakes up after inactivity)
      serverSelectionTimeoutMS: 30000, // 30s - allows time for cold start
      socketTimeoutMS: 60000, // 60s - prevents premature connection drops
      connectTimeoutMS: 30000, // 30s - initial connection timeout
      // Optimization flags
      compressors: ['zlib'],
    });

    // Enable query result caching
    mongoose.set('debug', false); // Disable debug in production

    console.log('MongoDB connected with optimized settings');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
