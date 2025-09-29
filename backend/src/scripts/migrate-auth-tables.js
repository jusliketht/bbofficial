// =====================================================
// AUTH TABLES MIGRATION SCRIPT
// =====================================================

require('dotenv').config();
const { sequelize } = require('../config/database');
const { User, UserSession, AuditLog, PasswordResetToken } = require('../models');
const enterpriseLogger = require('../utils/logger');

async function migrateAuthTables() {
  try {
    enterpriseLogger.info('Starting auth tables migration...');

    // Sync User model first (add new fields)
    await User.sync({ alter: true });
    enterpriseLogger.info('✅ User model synced with new fields');

    // Create new tables
    await UserSession.sync({ force: false });
    enterpriseLogger.info('✅ UserSession table created');

    await AuditLog.sync({ force: false });
    enterpriseLogger.info('✅ AuditLog table created');

    await PasswordResetToken.sync({ force: false });
    enterpriseLogger.info('✅ PasswordResetToken table created');

    // Add indexes
    await addIndexes();

    enterpriseLogger.info('🎉 Auth tables migration completed successfully');
  } catch (error) {
    enterpriseLogger.error('Auth tables migration failed', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

async function addIndexes() {
  const queryInterface = sequelize.getQueryInterface();

  // User table indexes
  try {
    await queryInterface.addIndex('users', ['email', 'auth_provider'], {
      unique: true,
      name: 'users_email_auth_provider_unique'
    });
    enterpriseLogger.info('✅ Added users email_auth_provider unique index');
  } catch (error) {
    if (error.message.includes('already exists')) {
      enterpriseLogger.info('ℹ️  users email_auth_provider index already exists');
    } else {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex('users', ['auth_provider'], {
      name: 'users_auth_provider_idx'
    });
    enterpriseLogger.info('✅ Added users auth_provider index');
  } catch (error) {
    if (error.message.includes('already exists')) {
      enterpriseLogger.info('ℹ️  users auth_provider index already exists');
    } else {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex('users', ['provider_id'], {
      name: 'users_provider_id_idx'
    });
    enterpriseLogger.info('✅ Added users provider_id index');
  } catch (error) {
    if (error.message.includes('already exists')) {
      enterpriseLogger.info('ℹ️  users provider_id index already exists');
    } else {
      throw error;
    }
  }

  // UserSession table indexes
  try {
    await queryInterface.addIndex('user_sessions', ['user_id'], {
      name: 'user_sessions_user_id_idx'
    });
    enterpriseLogger.info('✅ Added user_sessions user_id index');
  } catch (error) {
    if (error.message.includes('already exists')) {
      enterpriseLogger.info('ℹ️  user_sessions user_id index already exists');
    } else {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex('user_sessions', ['refresh_token_hash'], {
      name: 'user_sessions_refresh_token_hash_idx'
    });
    enterpriseLogger.info('✅ Added user_sessions refresh_token_hash index');
  } catch (error) {
    if (error.message.includes('already exists')) {
      enterpriseLogger.info('ℹ️  user_sessions refresh_token_hash index already exists');
    } else {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex('user_sessions', ['expires_at'], {
      name: 'user_sessions_expires_at_idx'
    });
    enterpriseLogger.info('✅ Added user_sessions expires_at index');
  } catch (error) {
    if (error.message.includes('already exists')) {
      enterpriseLogger.info('ℹ️  user_sessions expires_at index already exists');
    } else {
      throw error;
    }
  }

  // AuditLog table indexes
  try {
    await queryInterface.addIndex('audit_logs', ['user_id'], {
      name: 'audit_logs_user_id_idx'
    });
    enterpriseLogger.info('✅ Added audit_logs user_id index');
  } catch (error) {
    if (error.message.includes('already exists')) {
      enterpriseLogger.info('ℹ️  audit_logs user_id index already exists');
    } else {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex('audit_logs', ['action'], {
      name: 'audit_logs_action_idx'
    });
    enterpriseLogger.info('✅ Added audit_logs action index');
  } catch (error) {
    if (error.message.includes('already exists')) {
      enterpriseLogger.info('ℹ️  audit_logs action index already exists');
    } else {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex('audit_logs', ['timestamp'], {
      name: 'audit_logs_timestamp_idx'
    });
    enterpriseLogger.info('✅ Added audit_logs timestamp index');
  } catch (error) {
    if (error.message.includes('already exists')) {
      enterpriseLogger.info('ℹ️  audit_logs timestamp index already exists');
    } else {
      throw error;
    }
  }

  // PasswordResetToken table indexes
  try {
    await queryInterface.addIndex('password_reset_tokens', ['user_id'], {
      name: 'password_reset_tokens_user_id_idx'
    });
    enterpriseLogger.info('✅ Added password_reset_tokens user_id index');
  } catch (error) {
    if (error.message.includes('already exists')) {
      enterpriseLogger.info('ℹ️  password_reset_tokens user_id index already exists');
    } else {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex('password_reset_tokens', ['expires_at'], {
      name: 'password_reset_tokens_expires_at_idx'
    });
    enterpriseLogger.info('✅ Added password_reset_tokens expires_at index');
  } catch (error) {
    if (error.message.includes('already exists')) {
      enterpriseLogger.info('ℹ️  password_reset_tokens expires_at index already exists');
    } else {
      throw error;
    }
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateAuthTables()
    .then(() => {
      console.log('✅ Auth tables migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Auth tables migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateAuthTables };
