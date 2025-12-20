// =====================================================
// FINANCE CONTROLLER
// Handles finance-related API requests
// =====================================================

const financeDomain = require('../domain/FinanceDomain');
const { Invoice, Payment } = require('../models');
const { ITRFiling } = require('../models');
const enterpriseLogger = require('../utils/logger');
const { successResponse, errorResponse, notFoundResponse, validationErrorResponse } = require('../utils/responseFormatter');

class FinanceController {
  /**
   * Get invoice for a filing
   * GET /finance/invoices/:filingId
   */
  async getInvoice(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      // Verify filing belongs to user
      const filing = await ITRFiling.findByPk(filingId, {
        attributes: ['id', 'userId'],
      });

      if (!filing) {
        return notFoundResponse(res, 'Filing');
      }

      if (filing.userId !== userId && !['SUPER_ADMIN', 'PLATFORM_ADMIN'].includes(req.user.role)) {
        return errorResponse(res, new Error('Unauthorized'), 403);
      }

      // Get invoice
      const invoice = await Invoice.findOne({
        where: { filingId },
      });

      if (!invoice) {
        return notFoundResponse(res, 'Invoice');
      }

      return successResponse(res, { invoice }, 'Invoice retrieved successfully');
    } catch (error) {
      enterpriseLogger.error('Get invoice failed', {
        error: error.message,
        stack: error.stack,
        filingId: req.params.filingId,
      });
      return errorResponse(res, error, 500);
    }
  }

  /**
   * Get payment options for an invoice
   * GET /finance/invoices/:invoiceId/payment-options
   */
  async getPaymentOptions(req, res) {
    try {
      const { invoiceId } = req.params;

      const invoice = await Invoice.findByPk(invoiceId);

      if (!invoice) {
        return notFoundResponse(res, 'Invoice');
      }

      // Return payment options
      const paymentOptions = [
        { method: 'UPI', enabled: true },
        { method: 'card', enabled: true },
        { method: 'netbanking', enabled: true },
        { method: 'wallet', enabled: true },
      ];

      return successResponse(res, { paymentOptions }, 'Payment options retrieved');
    } catch (error) {
      enterpriseLogger.error('Get payment options failed', {
        error: error.message,
        invoiceId: req.params.invoiceId,
      });
      return errorResponse(res, error, 500);
    }
  }

  /**
   * Initiate payment for an invoice
   * POST /finance/invoices/:invoiceId/pay
   */
  async initiatePayment(req, res) {
    try {
      const userId = req.user.userId;
      const { invoiceId } = req.params;
      const { method, amount } = req.body;

      // Get invoice
      const invoice = await Invoice.findByPk(invoiceId);

      if (!invoice) {
        return notFoundResponse(res, 'Invoice');
      }

      // Verify invoice belongs to user
      if (invoice.userId !== userId) {
        return errorResponse(res, new Error('Unauthorized'), 403);
      }

      // Check if invoice is already paid
      if (invoice.paymentStatus === 'paid') {
        return validationErrorResponse(res, {
          payment: 'Invoice is already paid',
        });
      }

      // Validate payment method
      const validMethods = ['UPI', 'card', 'netbanking', 'wallet', 'razorpay'];
      if (!validMethods.includes(method)) {
        return validationErrorResponse(res, {
          method: `Invalid payment method. Valid methods: ${validMethods.join(', ')}`,
        });
      }

      // Create payment record
      const payment = await financeDomain.recordPayment(invoiceId, {
        amount: amount || invoice.totalAmount,
        method,
        status: 'pending',
      });

      // In a real implementation, you would:
      // 1. Create a Razorpay order
      // 2. Return the order details to the frontend
      // 3. Frontend handles payment UI
      // 4. Webhook updates payment status

      return successResponse(res, {
        payment: {
          id: payment.id,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
        },
        // In production, include Razorpay order details here
        gatewayOrderId: null, // Would be populated by payment gateway integration
      }, 'Payment initiated successfully');
    } catch (error) {
      enterpriseLogger.error('Initiate payment failed', {
        error: error.message,
        invoiceId: req.params.invoiceId,
      });
      return errorResponse(res, error, 500);
    }
  }

  /**
   * Get payment status
   * GET /finance/payments/:paymentId
   */
  async getPaymentStatus(req, res) {
    try {
      const userId = req.user.userId;
      const { paymentId } = req.params;

      const payment = await Payment.findByPk(paymentId, {
        include: [{
          model: Invoice,
          attributes: ['id', 'userId', 'filingId'],
        }],
      });

      if (!payment) {
        return notFoundResponse(res, 'Payment');
      }

      // Verify payment belongs to user
      if (payment.Invoice.userId !== userId) {
        return errorResponse(res, new Error('Unauthorized'), 403);
      }

      return successResponse(res, { payment }, 'Payment status retrieved');
    } catch (error) {
      enterpriseLogger.error('Get payment status failed', {
        error: error.message,
        paymentId: req.params.paymentId,
      });
      return errorResponse(res, error, 500);
    }
  }

  /**
   * Get reconciliation for a filing
   * GET /finance/filings/:filingId/reconcile
   */
  async getReconciliation(req, res) {
    try {
      const userId = req.user.userId;
      const { filingId } = req.params;

      // Verify filing belongs to user
      const filing = await ITRFiling.findByPk(filingId, {
        attributes: ['id', 'userId'],
      });

      if (!filing) {
        return notFoundResponse(res, 'Filing');
      }

      if (filing.userId !== userId && !['SUPER_ADMIN', 'PLATFORM_ADMIN'].includes(req.user.role)) {
        return errorResponse(res, new Error('Unauthorized'), 403);
      }

      // Get reconciliation
      const reconciliation = await financeDomain.reconcile(filingId);

      return successResponse(res, { reconciliation }, 'Reconciliation retrieved');
    } catch (error) {
      enterpriseLogger.error('Get reconciliation failed', {
        error: error.message,
        filingId: req.params.filingId,
      });
      return errorResponse(res, error, 500);
    }
  }
}

module.exports = new FinanceController();

