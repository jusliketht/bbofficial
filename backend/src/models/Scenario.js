// =====================================================
// SCENARIO MODEL
// Stores saved tax scenarios for users
// =====================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const enterpriseLogger = require('../utils/logger');

const Scenario = sequelize.define('Scenario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User who created the scenario',
  },
  filingId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'filing_id',
    references: {
      model: 'itr_filings',
      key: 'id',
    },
    comment: 'Associated filing (optional)',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'name',
    comment: 'Scenario name',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description',
    comment: 'Scenario description',
  },
  scenarioType: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'scenario_type',
    comment: 'Type of scenario (section80C, section80D, etc.)',
  },
  changes: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
    field: 'changes',
    comment: 'Scenario changes (JSON)',
  },
  simulationResult: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'simulation_result',
    comment: 'Cached simulation result (JSON)',
  },
  isFavorite: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_favorite',
    comment: 'Whether scenario is marked as favorite',
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
    field: 'tags',
    comment: 'Scenario tags for organization',
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    field: 'metadata',
    comment: 'Additional metadata (JSON)',
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
  tableName: 'scenarios',
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
      fields: ['scenario_type'],
    },
    {
      fields: ['is_favorite'],
    },
    {
      fields: ['created_at'],
    },
  ],
});

module.exports = Scenario;

