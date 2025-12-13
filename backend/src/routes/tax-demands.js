// =====================================================
// TAX DEMAND ROUTES
// Routes for tax demand management
// =====================================================

const express = require('express');
const router = express.Router();
const taxDemandController = require('../controllers/TaxDemandController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest: validate } = require('../middleware/validateRequest');

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/tax-demands
 * @desc    Create a new tax demand
 * @access  Private
 */
router.post(
  '/',
  validate({
    demandNumber: { required: true, type: 'string' },
    demandType: { required: true, type: 'string' },
    assessmentYear: { required: true, type: 'string' },
    subject: { required: true, type: 'string' },
    totalAmount: { required: true, type: 'number' },
  }),
  taxDemandController.createDemand,
);

/**
 * @route   GET /api/tax-demands
 * @desc    Get all demands for the authenticated user
 * @access  Private
 * @query   status - Filter by status (optional)
 * @query   demandType - Filter by demand type (optional)
 * @query   assessmentYear - Filter by assessment year (optional)
 */
router.get('/', taxDemandController.getUserDemands);

/**
 * @route   GET /api/tax-demands/overdue
 * @desc    Get overdue demands for the authenticated user
 * @access  Private
 */
router.get('/overdue', taxDemandController.getOverdueDemands);

/**
 * @route   GET /api/tax-demands/:id
 * @desc    Get demand by ID
 * @access  Private
 */
router.get('/:id', taxDemandController.getDemand);

/**
 * @route   POST /api/tax-demands/:id/payment
 * @desc    Record payment for a demand
 * @access  Private
 * @body    { amount: number, paymentMethod: string, transactionId?: string, paymentDate?: string }
 */
router.post(
  '/:id/payment',
  validate({
    amount: { required: true, type: 'number' },
    paymentMethod: { required: true, type: 'string' },
    transactionId: { required: false, type: 'string' },
    paymentDate: { required: false, type: 'string' },
  }),
  taxDemandController.recordPayment,
);

/**
 * @route   POST /api/tax-demands/:id/dispute
 * @desc    Dispute a demand
 * @access  Private
 * @body    { disputeReason: string, disputeDocuments?: string[] }
 */
router.post(
  '/:id/dispute',
  validate({
    disputeReason: { required: true, type: 'string' },
    disputeDocuments: { required: false, type: 'array' },
  }),
  taxDemandController.disputeDemand,
);

/**
 * @route   PATCH /api/tax-demands/:id/status
 * @desc    Update demand status
 * @access  Private
 * @body    { status: string, message?: string }
 */
router.patch(
  '/:id/status',
  validate({
    status: {
      required: true,
      type: 'string',
      enum: ['pending', 'acknowledged', 'disputed', 'partially_paid', 'paid', 'waived', 'closed'],
    },
  }),
  taxDemandController.updateStatus,
);

module.exports = router;

