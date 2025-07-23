const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token and attach it to the request object.
      // IMPORTANT: Explicitly select the 'role' field here.
      req.user = await User.findById(decoded.id).select('-password role'); // <--- CHANGE IS HERE

      // Add a log to verify what's being attached to req.user
      console.log('User attached to request in protect middleware:', req.user);
      if (req.user && req.user.role) {
          console.log(`User role: ${req.user.role}`);
      } else {
          console.log('User object or role not found on req.user.');
      }


      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next(); // Move to the next function (the route handler or next middleware)
    } catch (error) {
      console.error('TOKEN FAILED (authMiddleware):', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else { // Moved this 'if (!token)' block to an else for clearer flow
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
