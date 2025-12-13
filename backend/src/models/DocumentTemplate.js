// =====================================================
// DOCUMENT TEMPLATE MODEL
// Stores document templates for OCR and data extraction
// =====================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const enterpriseLogger = require('../utils/logger');

const DocumentTemplate = sequelize.define('DocumentTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('Form16', 'Form16A', 'Form26AS', 'AIS', 'RentReceipt', 'InvestmentProof', 'BankStatement', 'Other'),
    allowNull: false,
    field: 'type',
    comment: 'Document type',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'name',
    comment: 'Template name',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description',
    comment: 'Template description',
  },
  fields: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
    field: 'fields',
    comment: 'Array of field definitions for extraction',
  },
  mapping: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    field: 'mapping',
    comment: 'Field mapping configuration for data extraction',
  },
  ocrConfig: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    field: 'ocr_config',
    comment: 'OCR processing configuration',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
    comment: 'Whether template is active',
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User who created the template',
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
  tableName: 'document_templates',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['type'],
    },
    {
      fields: ['is_active'],
    },
    {
      fields: ['created_by'],
    },
    {
      fields: ['created_at'],
    },
  ],
});

module.exports = DocumentTemplate;

