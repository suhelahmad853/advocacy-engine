const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

// JWT authentication middleware
const checkAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Get employee data (excluding password)
    const employee = await Employee.findById(decoded.employeeId).select('-password');
    
    if (!employee) {
      return res.status(401).json({ error: 'Invalid token - employee not found' });
    }

    // Add employee to request object
    req.employee = employee;
    next();
    
  } catch (error) {
    console.error('Auth check error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Role-based access control middleware
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.employee) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.employee.role;
    
    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: userRole
      });
    }
  };
};

// Admin-only middleware
const requireAdmin = checkRole(['admin']);

// Manager or admin middleware
const requireManager = checkRole(['admin', 'manager']);

module.exports = {
  checkAuth,
  checkRole,
  requireAdmin,
  requireManager
}; 