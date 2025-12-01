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
  console.log('Admin middleware - User:', req.user);
  console.log('Admin middleware - Role:', req.user?.role);

  if (!['SUPER_ADMIN', 'PLATFORM_ADMIN'].includes(req.user.role)) {
    console.log('Admin access denied for role:', req.user.role);
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  console.log('Admin access granted for role:', req.user.role);
  next();
};

// Apply admin role check to all routes
router.use(requireAdmin);

// Test route after middleware
router.get('/test', (req, res) => {
  res.json({ message: 'Admin test route working', user: req.user });
});

// User Management Routes
router.get('/users', adminController.getUsers);
router.get('/users/export', adminController.exportUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/role', adminController.updateUserRole);
router.post('/users/:id/activate', adminController.activateUser);
router.post('/users/:id/deactivate', adminController.deactivateUser);
router.post('/users/:id/suspend', adminController.suspendUser);
router.post('/users/:id/reset-password', adminController.resetPassword);
router.post('/users/:id/invalidate-sessions', adminController.invalidateSessions);
router.get('/users/:id/activity', adminController.getUserActivity);
router.get('/users/:id/filings', adminController.getUserFilings);
router.get('/users/:id/transactions', adminController.getUserTransactions);
router.post('/users/bulk', adminController.bulkOperations);

// System Statistics Routes
router.get('/stats', adminController.getSystemStats);
router.get('/activity', adminController.getRecentActivity);

// Filing Management Routes
router.get('/filings', adminController.getFilings);
router.get('/filings/export', adminController.exportFilings);
router.get('/filings/issues', adminController.getFilingIssues);
router.get('/filings/stats', adminController.getFilingStats);
router.get('/filings/analytics', adminController.getFilingAnalytics);
router.get('/filings/:id', adminController.getFilingDetails);
router.put('/filings/:id', adminController.updateFiling);
router.post('/filings/:id/reprocess', adminController.reprocessFiling);
router.post('/filings/:id/cancel', adminController.cancelFiling);
router.get('/filings/:id/audit-log', adminController.getFilingAuditLog);
router.get('/filings/:id/documents', adminController.getFilingDocuments);
router.post('/filings/:id/override-validation', adminController.overrideValidation);
router.post('/filings/:id/flag-review', adminController.flagForReview);
router.post('/filings/:id/add-notes', adminController.addAdminNotes);

// Document Management Routes
router.get('/documents', adminController.getDocuments);
router.get('/documents/storage', adminController.getStorageStats);
router.get('/documents/:id', adminController.getDocumentDetails);
router.delete('/documents/:id', adminController.deleteDocument);
router.post('/documents/:id/reprocess', adminController.reprocessDocument);
router.get('/documents/:id/extracted-data', adminController.getExtractedData);
router.put('/documents/:id/extracted-data', adminController.updateExtractedData);
router.get('/documents/templates', adminController.getDocumentTemplates);
router.post('/documents/templates', adminController.createDocumentTemplate);
router.put('/documents/templates/:id', adminController.updateDocumentTemplate);

// Dashboard & Analytics Routes
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/charts/:type', adminController.getChartData);
router.get('/dashboard/alerts', adminController.getSystemAlerts);
router.get('/analytics/users', adminController.getUserAnalytics);
router.get('/analytics/revenue', adminController.getRevenueAnalytics);

// Error handling middleware
router.use((error, req, res, next) => {
  enterpriseLogger.error('Admin route error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    adminId: req.user?.id,
  });

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

enterpriseLogger.info('Admin routes configured');

module.exports = router;