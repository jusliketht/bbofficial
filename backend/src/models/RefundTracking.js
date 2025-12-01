// =====================================================
// REFUND TRACKING MODEL
// Tracks refund status and history for ITR filings
// =====================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const enterpriseLogger = require('../utils/logger');

const RefundTracking = sequelize.define('RefundTracking', {
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
    comment: 'Reference to ITR filing',
  },
  expectedAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'expected_amount',
    comment: 'Expected refund amount',
  },
  status: {
    type: DataTypes.ENUM('processing', 'issued', 'credited', 'failed', 'adjusted'),
    allowNull: false,
    defaultValue: 'processing',
    field: 'status',
    comment: 'Current refund status',
  },
  statusDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'status_date',
    comment: 'Date of current status',
  },
  bankAccount: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'bank_account',
    comment: 'Bank account details for refund (JSON)',
  },
  refundReference: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'refund_reference',
    comment: 'Refund reference number from ITD',
  },
  interestAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'interest_amount',
    comment: 'Interest amount on refund',
  },
  timeline: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    field: 'timeline',
    comment: 'Array of status change events (JSON)',
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
  tableName: 'refund_tracking',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['filing_id'],
      unique: true,
      name: 'unique_refund_per_filing',
    },
    {
      fields: ['status'],
    },
    {
      fields: ['status_date'],
    },
    {
      fields: ['created_at'],
    },
  ],
});

module.exports = RefundTracking;

