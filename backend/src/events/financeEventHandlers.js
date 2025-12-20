// =====================================================
// FINANCE EVENT HANDLERS
// Subscribe to ITR lifecycle events and trigger finance operations
// Finance reacts to ITR states. ITR never reacts to finance.
// =====================================================

const domainEventEmitter = require('./DomainEventEmitter');
const financeDomain = require('../domain/FinanceDomain');
const enterpriseLogger = require('../utils/logger');
const { ITR_DOMAIN_STATES } = require('../domain/states');

/**
 * Initialize finance event handlers
 * Called once during application startup
 */
function initializeFinanceEventHandlers() {
  enterpriseLogger.info('Initializing finance event handlers...');

  // Subscribe to ITR_STATE_TRANSITION events
  domainEventEmitter.on('ITR_STATE_TRANSITION', async (event) => {
    try {
      const { filingId, fromState, toState, context } = event;

      enterpriseLogger.info('Finance handler received state transition', {
        filingId,
        fromState,
        toState,
      });

      // Handle COMPUTED state → estimate fees
      if (toState === ITR_DOMAIN_STATES.COMPUTED) {
        try {
          const feeEstimate = await financeDomain.estimateFees(filingId, context);
          enterpriseLogger.info('Fee estimated on COMPUTED state', {
            filingId,
            estimatedAmount: feeEstimate.estimatedAmount,
          });
        } catch (error) {
          // Don't fail ITR state transition if fee estimation fails
          enterpriseLogger.error('Fee estimation failed (non-blocking)', {
            filingId,
            error: error.message,
          });
        }
      }

      // Handle LOCKED state → generate invoice
      if (toState === ITR_DOMAIN_STATES.LOCKED) {
        try {
          // First estimate fees (if not already done)
          const feeEstimate = await financeDomain.estimateFees(filingId, context);
          
          // Then generate invoice
          const invoice = await financeDomain.generateInvoice(filingId, feeEstimate);
          enterpriseLogger.info('Invoice generated on LOCKED state', {
            filingId,
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
          });
        } catch (error) {
          // Don't fail ITR state transition if invoice generation fails
          enterpriseLogger.error('Invoice generation failed (non-blocking)', {
            filingId,
            error: error.message,
          });
        }
      }

      // Handle FILED state → finalize invoice
      if (toState === ITR_DOMAIN_STATES.FILED) {
        try {
          const invoice = await financeDomain.finalizeInvoice(filingId);
          if (invoice) {
            enterpriseLogger.info('Invoice finalized on FILED state', {
              filingId,
              invoiceId: invoice.id,
            });
          }
        } catch (error) {
          // Don't fail ITR state transition if invoice finalization fails
          enterpriseLogger.error('Invoice finalization failed (non-blocking)', {
            filingId,
            error: error.message,
          });
        }
      }

      // Handle ACKNOWLEDGED state → track refund
      if (toState === ITR_DOMAIN_STATES.ACKNOWLEDGED) {
        try {
          const refundTracking = await financeDomain.trackRefund(filingId, context.refundData);
          enterpriseLogger.info('Refund tracking initiated on ACKNOWLEDGED state', {
            filingId,
            refundTrackingId: refundTracking.id,
            expectedAmount: refundTracking.expectedAmount,
          });
        } catch (error) {
          // Don't fail ITR state transition if refund tracking fails
          enterpriseLogger.error('Refund tracking failed (non-blocking)', {
            filingId,
            error: error.message,
          });
        }
      }

      // Handle COMPLETED state → settlement & analytics (optional)
      if (toState === ITR_DOMAIN_STATES.COMPLETED) {
        try {
          const reconciliation = await financeDomain.reconcile(filingId);
          enterpriseLogger.info('Reconciliation completed on COMPLETED state', {
            filingId,
            summary: reconciliation.summary,
          });
        } catch (error) {
          // Don't fail ITR state transition if reconciliation fails
          enterpriseLogger.error('Reconciliation failed (non-blocking)', {
            filingId,
            error: error.message,
          });
        }
      }

    } catch (error) {
      // Catch-all error handler - never let finance errors break ITR flow
      enterpriseLogger.error('Finance event handler error (non-blocking)', {
        event: event.type,
        filingId: event.filingId,
        error: error.message,
        stack: error.stack,
      });
    }
  });

  enterpriseLogger.info('Finance event handlers initialized successfully');
}

module.exports = {
  initializeFinanceEventHandlers,
};

