const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'your-access-token-secret-change-in-production';

// Middleware to verify JWT and attach user to request
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Attach user ID to request object
    req.user = { id: decoded.userId };
    next();
  });
};

module.exports = authenticateToken;
