const mongoose = require('mongoose');

let reconnectTimer = null;
let reconnectDelayMs = 5000;
const MAX_RECONNECT_DELAY_MS = 60000;

const scheduleReconnect = () => {
  if (reconnectTimer) {
    return;
  }

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectDB();
  }, reconnectDelayMs);

  reconnectDelayMs = Math.min(reconnectDelayMs * 2, MAX_RECONNECT_DELAY_MS);
};

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
    reconnectDelayMs = 5000;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log(`Retrying MongoDB connection in ${reconnectDelayMs / 1000}s...`);
    scheduleReconnect();
  }
};

module.exports = connectDB;
