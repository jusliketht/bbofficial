// =====================================================
// PAYMENT MODEL
// Service fee payments (user → platform)
// Different from TaxPayment (which is for tax payments to ITD)
// =====================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const enterpriseLogger = require('../utils/logger');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  invoiceId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'invoice_id',
    references: {
      model: 'invoices',
      key: 'id',
    },
    comment: 'Reference to invoice',
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'amount',
    comment: 'Payment amount in INR',
  },
  method: {
    type: DataTypes.ENUM('UPI', 'card', 'netbanking', 'wallet', 'razorpay', 'offline'),
    allowNull: false,
    defaultValue: 'razorpay',
    field: 'method',
    comment: 'Payment method used',
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'status',
    comment: 'Payment status',
  },
  gatewayRef: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'gateway_ref',
    comment: 'Payment gateway reference (Razorpay order ID, etc.)',
  },
  gatewayResponse: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'gateway_response',
    comment: 'Full gateway response (for debugging)',
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'paid_at',
    comment: 'Timestamp when payment was completed',
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'failure_reason',
    comment: 'Reason for payment failure',
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional payment metadata',
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at',
  },
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['invoice_id'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['gateway_ref'],
    },
    {
      fields: ['created_at'],
    },
    {
      fields: ['method'],
    },
  ],
});

// Instance methods
Payment.prototype.markAsCompleted = async function(gatewayResponse = {}) {
  try {
    await this.update({
      status: 'completed',
      paidAt: new Date(),
      gatewayResponse: {
        ...(this.gatewayResponse || {}),
        ...gatewayResponse,
      },
      updatedAt: new Date(),
    });

    enterpriseLogger.info('Payment marked as completed', {
      paymentId: this.id,
      invoiceId: this.invoiceId,
      amount: this.amount,
    });

    return this;
  } catch (error) {
    enterpriseLogger.error('Failed to mark payment as completed', {
      paymentId: this.id,
      error: error.message,
    });
    throw error;
  }
};

Payment.prototype.markAsFailed = async function(failureReason, gatewayResponse = {}) {
  try {
    await this.update({
      status: 'failed',
      failureReason,
      gatewayResponse: {
        ...(this.gatewayResponse || {}),
        ...gatewayResponse,
      },
      updatedAt: new Date(),
    });

    enterpriseLogger.info('Payment marked as failed', {
      paymentId: this.id,
      invoiceId: this.invoiceId,
      failureReason,
    });

    return this;
  } catch (error) {
    enterpriseLogger.error('Failed to mark payment as failed', {
      paymentId: this.id,
      error: error.message,
    });
    throw error;
  }
};

Payment.prototype.markAsRefunded = async function(refundDetails = {}) {
  try {
    await this.update({
      status: 'refunded',
      metadata: {
        ...(this.metadata || {}),
        refund: refundDetails,
        refundedAt: new Date().toISOString(),
      },
      updatedAt: new Date(),
    });

    enterpriseLogger.info('Payment marked as refunded', {
      paymentId: this.id,
      invoiceId: this.invoiceId,
      refundDetails,
    });

    return this;
  } catch (error) {
    enterpriseLogger.error('Failed to mark payment as refunded', {
      paymentId: this.id,
      error: error.message,
    });
    throw error;
  }
};

// Class methods
Payment.findByInvoice = async function(invoiceId) {
  try {
    return await Payment.findAll({
      where: { invoiceId },
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    enterpriseLogger.error('Failed to find payments by invoice', {
      invoiceId,
      error: error.message,
    });
    throw error;
  }
};

Payment.findByGatewayRef = async function(gatewayRef) {
  try {
    return await Payment.findOne({
      where: { gatewayRef },
    });
  } catch (error) {
    enterpriseLogger.error('Failed to find payment by gateway ref', {
      gatewayRef,
      error: error.message,
    });
    throw error;
  }
};

module.exports = Payment;

