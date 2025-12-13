// =====================================================
// TAX DEMAND MODEL
// Tracks tax demands from Income Tax Department
// =====================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const enterpriseLogger = require('../utils/logger');

const TaxDemand = sequelize.define('TaxDemand', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  filingId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'filing_id',
    references: {
      model: 'itr_filings',
      key: 'id',
    },
    comment: 'Reference to ITR filing (optional - demands can be standalone)',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User who received the demand',
  },
  demandNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'demand_number',
    comment: 'Demand number from ITD',
  },
  demandType: {
    type: DataTypes.ENUM('ASSESSMENT', 'INTEREST', 'PENALTY', 'TAX', 'OTHER'),
    allowNull: false,
    field: 'demand_type',
    comment: 'Type of tax demand',
  },
  assessmentYear: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'assessment_year',
    comment: 'Assessment year (e.g., 2024-25)',
  },
  status: {
    type: DataTypes.ENUM('pending', 'acknowledged', 'disputed', 'partially_paid', 'paid', 'waived', 'closed'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'status',
    comment: 'Current demand status',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'total_amount',
    comment: 'Total demand amount',
  },
  paidAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'paid_amount',
    comment: 'Amount paid so far',
  },
  outstandingAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'outstanding_amount',
    comment: 'Outstanding amount (calculated)',
  },
  receivedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'received_date',
    comment: 'Date demand was received',
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'due_date',
    comment: 'Payment due date',
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'paid_at',
    comment: 'Date when demand was fully paid',
  },
  subject: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'subject',
    comment: 'Demand subject/title',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description',
    comment: 'Demand description/details',
  },
  breakdown: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    field: 'breakdown',
    comment: 'Breakdown of demand components (tax, interest, penalty)',
  },
  documentUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'document_url',
    comment: 'URL to download demand document',
  },
  disputeReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'dispute_reason',
    comment: 'Reason for disputing the demand',
  },
  disputeDocuments: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    field: 'dispute_documents',
    comment: 'Array of dispute document URLs (JSON)',
  },
  disputeStatus: {
    type: DataTypes.ENUM('pending', 'under_review', 'accepted', 'rejected'),
    allowNull: true,
    field: 'dispute_status',
    comment: 'Dispute status (if disputed)',
  },
  paymentHistory: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    field: 'payment_history',
    comment: 'Array of payment transactions (JSON)',
  },
  timeline: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    field: 'timeline',
    comment: 'Array of status change events (JSON)',
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    field: 'metadata',
    comment: 'Additional metadata (ITD reference, case details, etc.)',
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
  tableName: 'tax_demands',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      fields: ['filing_id'],
    },
    {
      fields: ['demand_number'],
      unique: true,
    },
    {
      fields: ['status'],
    },
    {
      fields: ['demand_type'],
    },
    {
      fields: ['due_date'],
    },
    {
      fields: ['received_date'],
    },
    {
      fields: ['created_at'],
    },
  ],
});

module.exports = TaxDemand;

