// =====================================================
// ADMIN ROUTES
// =====================================================

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');
const authMiddleware = require('../middleware/auth');
const enterpriseLogger = require('../utils/logger');

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticateToken);

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (!['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Apply admin role check to all routes
router.use(requireAdmin);

// User Management Routes
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/role', adminController.updateUserRole);

// System Statistics Routes
router.get('/stats', adminController.getSystemStats);
router.get('/activity', adminController.getRecentActivity);

// Error handling middleware
router.use((error, req, res, next) => {
  enterpriseLogger.error('Admin route error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    adminId: req.user?.id
  });

  res.status(error.statusCode || 500).json({
        success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

enterpriseLogger.info('Admin routes configured');

module.exports = router;