const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// Reusable role guard — pass an array of allowed role_ids
const verifyRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role_id)) {
    return res.status(403).json({ message: 'Unauthorised' });
  }
  next();
};

module.exports = { verifyToken, verifyRole };