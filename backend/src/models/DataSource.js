// =====================================================
// DATA SOURCE MODEL
// Tracks data sources for ITR fields (Form16, Form26AS, AIS, etc.)
// =====================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DataSource = sequelize.define('DataSource', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sourceType: {
    type: DataTypes.ENUM(
      'Form16',
      'Form16A',
      'Form26AS',
      'AIS',
      'PreviousReturn',
      'BankStatement',
      'InvestmentProof',
      'RentAgreement',
      'Manual',
      'ERI',
      'Other'
    ),
    allowNull: false,
    field: 'source_type',
    comment: 'Type of data source',
  },
  sourceId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'source_id',
    comment: 'External source identifier (e.g., document ID, API response ID)',
  },
  documentId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'document_id',
    references: {
      model: 'documents',
      key: 'id',
    },
    comment: 'Link to uploaded document if applicable',
  },
  returnVersionId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'return_version_id',
    references: {
      model: 'return_versions',
      key: 'id',
    },
    comment: 'Link to return version this source was used for',
  },
  assessmentYear: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'assessment_year',
    validate: {
      is: /^\d{4}-\d{2}$/,
    },
  },
  fieldPath: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'field_path',
    comment: 'Dot-notation path to the field (e.g., "income.salary", "deductions.section80C")',
  },
  fieldValue: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'field_value',
    comment: 'Value extracted from this source',
  },
  confidence: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 1.0,
    validate: {
      min: 0,
      max: 1,
    },
    comment: 'Confidence score (0-1) for the extracted value',
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional metadata (extraction method, timestamp, etc.)',
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'is_verified',
    comment: 'Whether the source data has been verified by user',
  },
  verifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'verified_by',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verified_at',
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'data_sources',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['return_version_id'],
    },
    {
      fields: ['source_type'],
    },
    {
      fields: ['assessment_year'],
    },
    {
      fields: ['field_path'],
    },
    {
      fields: ['document_id'],
    },
    {
      fields: ['return_version_id', 'field_path'],
    },
  ],
});

// Associations
DataSource.associate = (models) => {
  DataSource.belongsTo(models.ReturnVersion, {
    foreignKey: 'returnVersionId',
    as: 'returnVersion',
  });
  DataSource.belongsTo(models.Document, {
    foreignKey: 'documentId',
    as: 'document',
  });
  DataSource.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });
  DataSource.belongsTo(models.User, {
    foreignKey: 'verifiedBy',
    as: 'verifier',
  });
};

module.exports = DataSource;

