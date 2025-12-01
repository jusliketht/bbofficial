// =====================================================
// RETURN VERSION MODEL
// Tracks version history of ITR filings
// =====================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReturnVersion = sequelize.define('ReturnVersion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  returnId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'return_id',
    references: {
      model: 'itr_filings',
      key: 'id',
    },
  },
  versionNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'version_number',
    comment: 'Sequential version number (1, 2, 3, ...)',
  },
  dataSnapshot: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'data_snapshot',
    comment: 'Complete snapshot of form data at this version',
  },
  regime: {
    type: DataTypes.ENUM('old', 'new'),
    allowNull: false,
    defaultValue: 'old',
    comment: 'Tax regime used for this version',
  },
  assessmentYear: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'assessment_year',
    validate: {
      is: /^\d{4}-\d{2}$/,
    },
  },
  taxComputation: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'tax_computation',
    comment: 'Tax computation result for this version',
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
  changeSummary: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'change_summary',
    comment: 'Human-readable summary of changes in this version',
  },
  isCurrent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'is_current',
    comment: 'True if this is the current active version',
  },
}, {
  tableName: 'return_versions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['return_id'],
    },
    {
      fields: ['return_id', 'version_number'],
      unique: true,
    },
    {
      fields: ['return_id', 'is_current'],
    },
    {
      fields: ['created_by'],
    },
  ],
});

// Associations
ReturnVersion.associate = (models) => {
  ReturnVersion.belongsTo(models.ITRFiling, {
    foreignKey: 'returnId',
    as: 'return',
  });
  ReturnVersion.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });
};

module.exports = ReturnVersion;

