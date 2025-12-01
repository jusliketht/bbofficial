// =====================================================
// NOTIFICATION MODEL
// Manages user notifications for the notifications center
// =====================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const enterpriseLogger = require('../utils/logger');

const Notification = sequelize.define('Notification', {
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
    comment: 'User who receives the notification',
  },
  type: {
    type: DataTypes.ENUM('system', 'filing', 'alert', 'marketing', 'document', 'deadline', 'refund'),
    allowNull: false,
    field: 'type',
    comment: 'Notification type category',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'title',
    comment: 'Notification title',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'message',
    comment: 'Notification message content',
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'read',
    comment: 'Whether notification has been read',
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'read_at',
    comment: 'Timestamp when notification was read',
  },
  actionUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'action_url',
    comment: 'Deep link URL for notification action',
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    field: 'metadata',
    comment: 'Additional notification data (filingId, documentId, etc.)',
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
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      fields: ['type'],
    },
    {
      fields: ['read'],
    },
    {
      fields: ['created_at'],
    },
    {
      fields: ['user_id', 'read'],
      name: 'idx_notifications_user_read',
    },
    {
      fields: ['user_id', 'type'],
      name: 'idx_notifications_user_type',
    },
  ],
});

// Instance methods
Notification.prototype.markAsRead = async function() {
  try {
    await this.update({
      read: true,
      readAt: new Date(),
    });

    enterpriseLogger.info('Notification marked as read', {
      notificationId: this.id,
      userId: this.userId,
    });

    return this;
  } catch (error) {
    enterpriseLogger.error('Mark notification as read error', {
      notificationId: this.id,
      error: error.message,
    });
    throw error;
  }
};

// Class methods
Notification.findUnreadByUser = async function(userId, options = {}) {
  try {
    const { type, limit } = options;
    const whereClause = {
      userId,
      read: false,
    };

    if (type) {
      whereClause.type = type;
    }

    return await Notification.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: limit || 50,
    });
  } catch (error) {
    enterpriseLogger.error('Find unread notifications error', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

Notification.markAllAsRead = async function(userId) {
  try {
    const result = await Notification.update(
      {
        read: true,
        readAt: new Date(),
      },
      {
        where: {
          userId,
          read: false,
        },
      }
    );

    enterpriseLogger.info('All notifications marked as read', {
      userId,
      updatedCount: result[0],
    });

    return result[0];
  } catch (error) {
    enterpriseLogger.error('Mark all notifications as read error', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

Notification.createNotification = async function(userId, notificationData) {
  try {
    const notification = await Notification.create({
      userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      actionUrl: notificationData.actionUrl,
      metadata: notificationData.metadata || {},
    });

    enterpriseLogger.info('Notification created', {
      notificationId: notification.id,
      userId,
      type: notificationData.type,
    });

    return notification;
  } catch (error) {
    enterpriseLogger.error('Create notification error', {
      userId,
      error: error.message,
    });
    throw error;
  }
};

module.exports = Notification;

