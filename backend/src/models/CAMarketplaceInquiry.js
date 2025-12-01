// =====================================================
// CA MARKETPLACE INQUIRY MODEL
// Manages inquiries sent to CA firms through marketplace
// =====================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const enterpriseLogger = require('../utils/logger');

const CAMarketplaceInquiry = sequelize.define('CAMarketplaceInquiry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firmId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'firm_id',
    references: {
      model: 'ca_firms',
      key: 'id',
    },
    comment: 'CA firm that received the inquiry',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User who sent the inquiry (nullable for guest inquiries)',
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'client_name',
    comment: 'Name of the inquirer',
  },
  clientEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'client_email',
    validate: {
      isEmail: true,
    },
    comment: 'Email of the inquirer',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'message',
    comment: 'Inquiry message content',
  },
  status: {
    type: DataTypes.ENUM('pending', 'responded', 'closed', 'archived'),
    defaultValue: 'pending',
    allowNull: false,
    field: 'status',
    comment: 'Inquiry status',
  },
  respondedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'responded_at',
    comment: 'Timestamp when CA firm responded',
  },
  responseMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'response_message',
    comment: 'Response message from CA firm',
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    field: 'metadata',
    comment: 'Additional inquiry data',
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
  tableName: 'ca_marketplace_inquiries',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['firm_id'],
    },
    {
      fields: ['user_id'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['created_at'],
    },
    {
      fields: ['firm_id', 'status'],
      name: 'idx_inquiries_firm_status',
    },
  ],
});

// Instance methods
CAMarketplaceInquiry.prototype.markAsResponded = async function(responseMessage) {
  try {
    await this.update({
      status: 'responded',
      respondedAt: new Date(),
      responseMessage,
    });

    enterpriseLogger.info('Inquiry marked as responded', {
      inquiryId: this.id,
      firmId: this.firmId,
    });

    return this;
  } catch (error) {
    enterpriseLogger.error('Mark inquiry as responded error', {
      inquiryId: this.id,
      error: error.message,
    });
    throw error;
  }
};

// Class methods
CAMarketplaceInquiry.findByFirm = async function(firmId, options = {}) {
  try {
    const { status, limit = 50, offset = 0 } = options;
    const whereClause = { firmId };

    if (status) {
      whereClause.status = status;
    }

    return await CAMarketplaceInquiry.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  } catch (error) {
    enterpriseLogger.error('Find inquiries by firm error', {
      firmId,
      error: error.message,
    });
    throw error;
  }
};

CAMarketplaceInquiry.findByUser = async function(userId, options = {}) {
  try {
    const { limit = 50, offset = 0 } = options;

    return await CAMarketplaceInquiry.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  } catch (error) {
    enterpriseLogger.error('Find inquiries by user error', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

module.exports = CAMarketplaceInquiry;

