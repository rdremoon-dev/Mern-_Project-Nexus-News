const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res
        .status(401)
        .json({ message: 'Not authorized, user not found' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message:
          'Account not verified. Please verify your email before continuing.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Not authorized, invalid or expired token' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = { protect, authorizeAdmin };
