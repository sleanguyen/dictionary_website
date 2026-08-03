const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'polyglot_dev_secret_change_me';

// Validates the JWT from the Authorization header and attaches the decoded
// payload (id, role) to req.user.
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Access denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Must run AFTER verifyToken. Only allows access if the decoded token's
// role is exactly 'admin'.
exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges required.' });
  }
  next();
};