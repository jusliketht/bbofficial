// =====================================================
// ASSESSMENT NOTICE ROUTES
// Routes for assessment notice management
// =====================================================

const express = require('express');
const router = express.Router();
const assessmentNoticeController = require('../controllers/AssessmentNoticeController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest: validate } = require('../middleware/validateRequest');

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/assessment-notices
 * @desc    Create a new assessment notice
 * @access  Private
 */
router.post(
  '/',
  validate({
    noticeNumber: { required: true, type: 'string' },
    noticeType: { required: true, type: 'string' },
    assessmentYear: { required: true, type: 'string' },
    subject: { required: true, type: 'string' },
  }),
  assessmentNoticeController.createNotice,
);

/**
 * @route   GET /api/assessment-notices
 * @desc    Get all notices for the authenticated user
 * @access  Private
 * @query   status - Filter by status (optional)
 * @query   noticeType - Filter by notice type (optional)
 * @query   assessmentYear - Filter by assessment year (optional)
 */
router.get('/', assessmentNoticeController.getUserNotices);

/**
 * @route   GET /api/assessment-notices/overdue
 * @desc    Get overdue notices for the authenticated user
 * @access  Private
 */
router.get('/overdue', assessmentNoticeController.getOverdueNotices);

/**
 * @route   GET /api/assessment-notices/:id
 * @desc    Get notice by ID
 * @access  Private
 */
router.get('/:id', assessmentNoticeController.getNotice);

/**
 * @route   PATCH /api/assessment-notices/:id/status
 * @desc    Update notice status
 * @access  Private
 * @body    { status: string, message?: string }
 */
router.patch(
  '/:id/status',
  validate({
    status: {
      required: true,
      type: 'string',
      enum: ['pending', 'acknowledged', 'responded', 'resolved', 'disputed', 'closed'],
    },
  }),
  assessmentNoticeController.updateStatus,
);

/**
 * @route   POST /api/assessment-notices/:id/response
 * @desc    Submit response to notice
 * @access  Private
 * @body    { responseText: string, responseDocuments?: string[] }
 */
router.post(
  '/:id/response',
  validate({
    responseText: { required: false, type: 'string' },
    responseDocuments: { required: false, type: 'array' },
  }),
  assessmentNoticeController.submitResponse,
);

/**
 * @route   POST /api/assessment-notices/check-portal
 * @desc    Check for new notices from Income Tax Portal
 * @access  Private
 */
router.post('/check-portal', assessmentNoticeController.checkPortal);

module.exports = router;

