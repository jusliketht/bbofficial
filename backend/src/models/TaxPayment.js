// =====================================================
// TAX PAYMENT MODEL
// Tracks tax payments (advance tax, self-assessment tax, etc.)
// =====================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const enterpriseLogger = require('../utils/logger');

const TaxPayment = sequelize.define('TaxPayment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  filingId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'filing_id',
    references: {
      model: 'itr_filings',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  challanNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    field: 'challan_number',
    comment: 'ITNS 280 challan number',
  },
  assessmentYear: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'assessment_year',
    validate: {
      is: /^\d{4}-\d{2}$/, // Format: 2024-25
    },
  },
  typeOfPayment: {
    type: DataTypes.ENUM('advance_tax', 'self_assessment', 'regular_assessment'),
    allowNull: false,
    field: 'type_of_payment',
    comment: 'Type of tax payment',
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'amount',
    comment: 'Payment amount in INR',
  },
  paymentMethod: {
    type: DataTypes.ENUM('itd_direct', 'razorpay', 'offline'),
    allowNull: false,
    defaultValue: 'razorpay',
    field: 'payment_method',
    comment: 'Payment method used',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'verified'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'payment_status',
  },
  razorpayOrderId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'razorpay_order_id',
    comment: 'Razorpay order ID if paid via Razorpay',
  },
  razorpayPaymentId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'razorpay_payment_id',
    comment: 'Razorpay payment ID if paid via Razorpay',
  },
  itdTransactionId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'itd_transaction_id',
    comment: 'ITD transaction ID if paid via ITD gateway',
  },
  paymentProofUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'payment_proof_url',
    comment: 'URL to uploaded payment proof document',
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verified_at',
    comment: 'Timestamp when payment was verified',
  },
  verificationMethod: {
    type: DataTypes.ENUM('auto_26as', 'manual_upload'),
    allowNull: true,
    field: 'verification_method',
    comment: 'Method used to verify payment',
  },
  challanData: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'challan_data',
    comment: 'Challan details (ITNS 280 data)',
  },
  paymentDetails: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'payment_details',
    comment: 'Additional payment details (gateway response, etc.)',
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
  tableName: 'tax_payments',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['filing_id', 'payment_status'],
      name: 'idx_filing_payment_status',
    },
    {
      fields: ['challan_number'],
      name: 'idx_challan_number',
    },
    {
      fields: ['razorpay_payment_id'],
      name: 'idx_razorpay_payment_id',
    },
    {
      fields: ['itd_transaction_id'],
      name: 'idx_itd_transaction_id',
    },
    {
      fields: ['user_id'],
    },
    {
      fields: ['created_at'],
    },
  ],
});

// Instance methods
TaxPayment.prototype.markAsCompleted = async function(paymentDetails = {}) {
  try {
    await this.update({
      paymentStatus: 'completed',
      paymentDetails: {
        ...(this.paymentDetails || {}),
        ...paymentDetails,
      },
      updatedAt: new Date(),
    });

    enterpriseLogger.info('Tax payment marked as completed', {
      paymentId: this.id,
      filingId: this.filingId,
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

TaxPayment.prototype.markAsVerified = async function(verificationMethod, verificationDetails = {}) {
  try {
    await this.update({
      paymentStatus: 'verified',
      verificationMethod,
      verifiedAt: new Date(),
      paymentDetails: {
        ...(this.paymentDetails || {}),
        verificationDetails,
      },
      updatedAt: new Date(),
    });

    enterpriseLogger.info('Tax payment marked as verified', {
      paymentId: this.id,
      filingId: this.filingId,
      verificationMethod,
    });

    return this;
  } catch (error) {
    enterpriseLogger.error('Failed to mark payment as verified', {
      paymentId: this.id,
      error: error.message,
    });
    throw error;
  }
};

TaxPayment.prototype.markAsFailed = async function(failureReason) {
  try {
    await this.update({
      paymentStatus: 'failed',
      paymentDetails: {
        ...(this.paymentDetails || {}),
        failureReason,
        failedAt: new Date().toISOString(),
      },
      updatedAt: new Date(),
    });

    enterpriseLogger.info('Tax payment marked as failed', {
      paymentId: this.id,
      filingId: this.filingId,
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

// Class methods
TaxPayment.findByFiling = async function(filingId) {
  try {
    return await TaxPayment.findAll({
      where: { filingId },
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    enterpriseLogger.error('Failed to find payments by filing', {
      filingId,
      error: error.message,
    });
    throw error;
  }
};

TaxPayment.findByChallanNumber = async function(challanNumber) {
  try {
    return await TaxPayment.findOne({
      where: { challanNumber },
    });
  } catch (error) {
    enterpriseLogger.error('Failed to find payment by challan number', {
      challanNumber,
      error: error.message,
    });
    throw error;
  }
};

module.exports = TaxPayment;

