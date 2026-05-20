const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access denied. Token is missing.' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'maa_travels_super_secret_jwt_token_key_2026';
    const decoded = jwt.verify(token, jwtSecret);
    
    // Attach decoded user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};
