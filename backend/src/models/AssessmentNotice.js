// =====================================================
// ASSESSMENT NOTICE MODEL
// Tracks assessment notices from Income Tax Department
// =====================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const enterpriseLogger = require('../utils/logger');

const AssessmentNotice = sequelize.define('AssessmentNotice', {
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
    comment: 'Reference to ITR filing (optional - notices can be standalone)',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User who received the notice',
  },
  noticeNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'notice_number',
    comment: 'Notice number from ITD',
  },
  noticeType: {
    type: DataTypes.ENUM('143(1)', '142(1)', '148', '153A', '153C', '154', '156', '245', 'OTHER'),
    allowNull: false,
    field: 'notice_type',
    comment: 'Type of assessment notice',
  },
  assessmentYear: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'assessment_year',
    comment: 'Assessment year (e.g., 2024-25)',
  },
  status: {
    type: DataTypes.ENUM('pending', 'acknowledged', 'responded', 'resolved', 'disputed', 'closed'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'status',
    comment: 'Current notice status',
  },
  receivedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'received_date',
    comment: 'Date notice was received',
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'due_date',
    comment: 'Response due date',
  },
  respondedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'responded_at',
    comment: 'Date when response was submitted',
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'resolved_at',
    comment: 'Date when notice was resolved',
  },
  subject: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'subject',
    comment: 'Notice subject/title',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description',
    comment: 'Notice description/details',
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'amount',
    comment: 'Amount mentioned in notice (if applicable)',
  },
  documentUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'document_url',
    comment: 'URL to download notice document',
  },
  responseText: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'response_text',
    comment: 'User response text',
  },
  responseDocuments: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    field: 'response_documents',
    comment: 'Array of response document URLs (JSON)',
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
  tableName: 'assessment_notices',
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
      fields: ['notice_number'],
      unique: true,
    },
    {
      fields: ['status'],
    },
    {
      fields: ['notice_type'],
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

module.exports = AssessmentNotice;

