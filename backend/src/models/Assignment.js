// =====================================================
// ASSIGNMENT MODEL
// Links clients (Members) to users (preparers/reviewers)
// Enables multi-tenant client assignment system
// =====================================================

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const enterpriseLogger = require('../utils/logger');

const Assignment = sequelize.define('Assignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'assignment_id',
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'family_members',
      key: 'id',
    },
    field: 'client_id',
    comment: 'Reference to Member (client)',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    field: 'user_id',
    comment: 'Reference to User (preparer/reviewer)',
  },
  role: {
    type: DataTypes.ENUM('preparer', 'reviewer', 'admin'),
    allowNull: false,
    comment: 'Assignment role: preparer (data entry), reviewer (validation), admin (firm admin)',
  },
  activeFrom: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'active_from',
    comment: 'Assignment start date',
  },
  activeTo: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'active_to',
    comment: 'Assignment end date (null = active indefinitely)',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'revoked'),
    defaultValue: 'active',
    allowNull: false,
    comment: 'Assignment status',
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    field: 'created_by',
    comment: 'User who created this assignment',
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional assignment metadata',
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
  },
}, {
  tableName: 'assignments',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['client_id'],
    },
    {
      fields: ['user_id'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['role'],
    },
    {
      unique: true,
      fields: ['client_id', 'user_id', 'role'],
      name: 'unique_client_user_role',
    },
  ],
});

// Instance methods
Assignment.prototype.isActive = function() {
  if (this.status !== 'active') {
    return false;
  }
  
  const now = new Date();
  if (this.activeFrom && new Date(this.activeFrom) > now) {
    return false;
  }
  
  if (this.activeTo && new Date(this.activeTo) < now) {
    return false;
  }
  
  return true;
};

Assignment.prototype.revoke = async function(revokedBy, reason = null) {
  try {
    await this.update({
      status: 'revoked',
      activeTo: new Date(),
      metadata: {
        ...this.metadata,
        revokedBy,
        revokedAt: new Date().toISOString(),
        revocationReason: reason,
      },
    });
    
    enterpriseLogger.info('Assignment revoked', {
      assignmentId: this.id,
      clientId: this.clientId,
      userId: this.userId,
      revokedBy,
      reason,
    });
    
    return this;
  } catch (error) {
    enterpriseLogger.error('Revoke assignment error', {
      assignmentId: this.id,
      error: error.message,
    });
    throw error;
  }
};

Assignment.prototype.extend = async function(newActiveTo, extendedBy) {
  try {
    await this.update({
      activeTo: newActiveTo,
      metadata: {
        ...this.metadata,
        extendedBy,
        extendedAt: new Date().toISOString(),
        previousActiveTo: this.activeTo,
      },
    });
    
    enterpriseLogger.info('Assignment extended', {
      assignmentId: this.id,
      clientId: this.clientId,
      userId: this.userId,
      newActiveTo,
      extendedBy,
    });
    
    return this;
  } catch (error) {
    enterpriseLogger.error('Extend assignment error', {
      assignmentId: this.id,
      error: error.message,
    });
    throw error;
  }
};

// Class methods
Assignment.findActiveByClient = async function(clientId) {
  try {
    return await Assignment.findAll({
      where: {
        clientId,
        status: 'active',
      },
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    enterpriseLogger.error('Find active assignments by client error', {
      clientId,
      error: error.message,
    });
    throw error;
  }
};

Assignment.findActiveByUser = async function(userId, role = null) {
  try {
    const whereClause = {
      userId,
      status: 'active',
    };
    
    if (role) {
      whereClause.role = role;
    }
    
    return await Assignment.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    enterpriseLogger.error('Find active assignments by user error', {
      userId,
      role,
      error: error.message,
    });
    throw error;
  }
};

Assignment.findByClientAndUser = async function(clientId, userId, role = null) {
  try {
    const whereClause = {
      clientId,
      userId,
      status: 'active',
    };
    
    if (role) {
      whereClause.role = role;
    }
    
    return await Assignment.findOne({
      where: whereClause,
    });
  } catch (error) {
    enterpriseLogger.error('Find assignment by client and user error', {
      clientId,
      userId,
      role,
      error: error.message,
    });
    throw error;
  }
};

// Hooks
Assignment.beforeCreate(async (assignment) => {
  enterpriseLogger.info('Creating assignment', {
    clientId: assignment.clientId,
    userId: assignment.userId,
    role: assignment.role,
    createdBy: assignment.createdBy,
  });
});

Assignment.beforeUpdate(async (assignment) => {
  if (assignment.changed('status')) {
    enterpriseLogger.info('Assignment status changed', {
      assignmentId: assignment.id,
      oldStatus: assignment._previousDataValues.status,
      newStatus: assignment.status,
    });
  }
});

module.exports = Assignment;

