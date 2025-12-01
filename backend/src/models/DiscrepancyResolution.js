// =====================================================
// DISCREPANCY RESOLUTION MODEL
// Tracks resolution history for discrepancies
// =====================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DiscrepancyResolution = sequelize.define('DiscrepancyResolution', {
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
  discrepancyId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'discrepancy_id',
    comment: 'Unique identifier for the discrepancy',
  },
  fieldPath: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'field_path',
    comment: 'Field path (e.g., income.salary.gross)',
  },
  manualValue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'manual_value',
    comment: 'Value entered manually by user',
  },
  sourceValue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'source_value',
    comment: 'Value from source (AIS, 26AS, Form16)',
  },
  resolvedValue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'resolved_value',
    comment: 'Final resolved value',
  },
  resolutionAction: {
    type: DataTypes.ENUM('accept_manual', 'accept_source', 'custom', 'explained'),
    allowNull: false,
    field: 'resolution_action',
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resolvedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'resolved_by',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'resolved_at',
  },
  confidenceScore: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    field: 'confidence_score',
    comment: 'AI suggestion confidence score (0-1)',
  },
}, {
  tableName: 'discrepancy_resolutions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['filing_id'],
    },
    {
      fields: ['resolved_by'],
    },
    {
      fields: ['resolved_at'],
    },
    {
      fields: ['field_path'],
    },
  ],
});

module.exports = DiscrepancyResolution;

