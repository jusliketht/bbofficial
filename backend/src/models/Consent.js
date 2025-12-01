// =====================================================
// CONSENT MODEL
// Tracks versioned consent for CA-grade compliance
// =====================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Consent = sequelize.define('Consent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  consentId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'consent_id',
    comment: 'Unique consent identifier (same across versions)',
  },
  returnVersionId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'return_version_id',
    references: {
      model: 'return_versions',
      key: 'id',
    },
    comment: 'Link to return version this consent applies to',
  },
  scope: {
    type: DataTypes.ENUM(
      'filing',
      'data_sharing',
      'e_sign',
      'document_access',
      'auto_fill',
      'ai_recommendations'
    ),
    allowNull: false,
    comment: 'Scope of consent',
  },
  level: {
    type: DataTypes.ENUM('per_field', 'global', 'section'),
    allowNull: false,
    defaultValue: 'global',
    comment: 'Level of consent granularity',
  },
  fieldPath: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'field_path',
    comment: 'Field path if level is per_field or section',
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Version number of this consent (increments on updates)',
  },
  givenBy: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'given_by',
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User who gave consent',
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'When consent was given',
  },
  status: {
    type: DataTypes.ENUM('given', 'revoked', 'expired'),
    allowNull: false,
    defaultValue: 'given',
    comment: 'Current status of consent',
  },
  revokedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'revoked_at',
    comment: 'When consent was revoked (if applicable)',
  },
  revokedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'revoked_by',
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User who revoked consent',
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at',
    comment: 'When consent expires (if applicable)',
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional metadata (IP address, device info, consent text, etc.)',
  },
  previousVersionId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'previous_version_id',
    references: {
      model: 'consents',
      key: 'id',
    },
    comment: 'Link to previous version of this consent',
  },
}, {
  tableName: 'consents',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['consent_id'],
    },
    {
      fields: ['return_version_id'],
    },
    {
      fields: ['given_by'],
    },
    {
      fields: ['scope'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['consent_id', 'version'],
      unique: true,
    },
    {
      fields: ['return_version_id', 'scope', 'level'],
    },
  ],
});

// Associations
Consent.associate = (models) => {
  Consent.belongsTo(models.ReturnVersion, {
    foreignKey: 'returnVersionId',
    as: 'returnVersion',
  });
  Consent.belongsTo(models.User, {
    foreignKey: 'givenBy',
    as: 'giver',
  });
  Consent.belongsTo(models.User, {
    foreignKey: 'revokedBy',
    as: 'revoker',
  });
  Consent.belongsTo(models.Consent, {
    foreignKey: 'previousVersionId',
    as: 'previousVersion',
  });
};

module.exports = Consent;

