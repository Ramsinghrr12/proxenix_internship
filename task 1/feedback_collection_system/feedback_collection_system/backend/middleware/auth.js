const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware - headers:', req.headers);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('Auth middleware - token:', token ? 'Token present' : 'No token');
    
    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Auth middleware - decoded token:', decoded);
    
    const user = await User.findById(decoded.userId).select('-password');
    console.log('Auth middleware - found user:', user ? user._id : 'No user found');
    
    if (!user) {
      console.log('Auth middleware - User not found');
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    req.user = user;
    console.log('Auth middleware - User authenticated:', user._id);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      next();
    });
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(403).json({ message: 'Access denied.' });
  }
};

module.exports = { auth, adminAuth }; 