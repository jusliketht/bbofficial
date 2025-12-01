// =====================================================
// FOREIGN ASSET MODEL
// Tracks foreign assets declared in Schedule FA (ITR-2/ITR-3)
// =====================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const enterpriseLogger = require('../utils/logger');

const ForeignAsset = sequelize.define('ForeignAsset', {
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
  assetType: {
    type: DataTypes.ENUM('bank_account', 'equity_holding', 'immovable_property', 'other'),
    allowNull: false,
    field: 'asset_type',
    comment: 'Type of foreign asset',
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'country',
    comment: 'Country where asset is located',
  },
  assetDetails: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'asset_details',
    comment: 'Type-specific asset details (bank account, equity, property)',
  },
  declarationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'declaration_date',
    comment: 'Date of declaration',
  },
  valuationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'valuation_date',
    comment: 'Date of valuation',
  },
  valuationAmountInr: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'valuation_amount_inr',
    comment: 'Valuation amount in INR',
  },
  valuationAmountForeign: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'valuation_amount_foreign',
    comment: 'Valuation amount in foreign currency',
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'currency',
    comment: 'Foreign currency code (USD, GBP, etc.)',
  },
  exchangeRate: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true,
    field: 'exchange_rate',
    comment: 'Exchange rate used for conversion',
  },
  dtaaApplicable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'dtaa_applicable',
    comment: 'Whether DTAA benefits are applicable',
  },
  dtaaCountry: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'dtaa_country',
    comment: 'DTAA country if applicable',
  },
  supportingDocuments: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    field: 'supporting_documents',
    comment: 'Array of document URLs/IDs',
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
  tableName: 'foreign_assets',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['filing_id', 'asset_type'],
      name: 'idx_filing_asset_type',
    },
    {
      fields: ['user_id'],
    },
    {
      fields: ['country'],
    },
    {
      fields: ['created_at'],
    },
  ],
});

// Instance methods
ForeignAsset.prototype.updateValuation = async function(valuationAmountInr, valuationAmountForeign, exchangeRate, valuationDate) {
  try {
    await this.update({
      valuationAmountInr,
      valuationAmountForeign,
      exchangeRate,
      valuationDate: valuationDate || new Date(),
      updatedAt: new Date(),
    });

    enterpriseLogger.info('Foreign asset valuation updated', {
      assetId: this.id,
      filingId: this.filingId,
      valuationAmountInr,
    });

    return this;
  } catch (error) {
    enterpriseLogger.error('Failed to update foreign asset valuation', {
      assetId: this.id,
      error: error.message,
    });
    throw error;
  }
};

ForeignAsset.prototype.addDocument = async function(documentUrl, documentType) {
  try {
    const documents = this.supportingDocuments || [];
    documents.push({
      url: documentUrl,
      type: documentType,
      uploadedAt: new Date().toISOString(),
    });

    await this.update({
      supportingDocuments: documents,
      updatedAt: new Date(),
    });

    enterpriseLogger.info('Document added to foreign asset', {
      assetId: this.id,
      documentUrl,
      documentType,
    });

    return this;
  } catch (error) {
    enterpriseLogger.error('Failed to add document to foreign asset', {
      assetId: this.id,
      error: error.message,
    });
    throw error;
  }
};

// Class methods
ForeignAsset.findByFiling = async function(filingId) {
  try {
    return await ForeignAsset.findAll({
      where: { filingId },
      order: [['assetType', 'ASC'], ['createdAt', 'ASC']],
    });
  } catch (error) {
    enterpriseLogger.error('Failed to find foreign assets by filing', {
      filingId,
      error: error.message,
    });
    throw error;
  }
};

ForeignAsset.findByFilingAndType = async function(filingId, assetType) {
  try {
    return await ForeignAsset.findAll({
      where: { filingId, assetType },
      order: [['createdAt', 'ASC']],
    });
  } catch (error) {
    enterpriseLogger.error('Failed to find foreign assets by filing and type', {
      filingId,
      assetType,
      error: error.message,
    });
    throw error;
  }
};

module.exports = ForeignAsset;

