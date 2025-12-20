// =====================================================
// FINANCE ROUTES
// Routes for finance operations (invoices, payments, etc.)
// =====================================================

const express = require('express');
const router = express.Router();
const financeController = require('../controllers/FinanceController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/rbac');

// All finance routes require authentication
router.use(authenticateToken);

// =====================================================
// INVOICE ROUTES
// =====================================================

// GET /finance/invoices/:filingId - Get invoice for a filing
router.get('/invoices/:filingId', financeController.getInvoice.bind(financeController));

// GET /finance/invoices/:invoiceId/payment-options - Get payment options
router.get('/invoices/:invoiceId/payment-options', financeController.getPaymentOptions.bind(financeController));

// POST /finance/invoices/:invoiceId/pay - Initiate payment
router.post('/invoices/:invoiceId/pay', financeController.initiatePayment.bind(financeController));

// =====================================================
// PAYMENT ROUTES
// =====================================================

// GET /finance/payments/:paymentId - Get payment status
router.get('/payments/:paymentId', financeController.getPaymentStatus.bind(financeController));

// =====================================================
// RECONCILIATION ROUTES
// =====================================================

// GET /finance/filings/:filingId/reconcile - Get reconciliation
router.get('/filings/:filingId/reconcile', financeController.getReconciliation.bind(financeController));

module.exports = router;

