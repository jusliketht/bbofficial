#!/usr/bin/env node
// =====================================================
// ADD MISSING USER COLUMNS
// Adds pan_number, pan_verified, and other missing columns to users table
// =====================================================

require('dotenv').config();
const { sequelize } = require('../config/database');
const enterpriseLogger = require('../utils/logger');

async function addMissingUserColumns() {
  try {
    const { DataTypes } = require('sequelize');
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('users');
    
    // Add pan_number column if it doesn't exist
    if (!tableDescription.pan_number) {
      enterpriseLogger.info('Adding pan_number column to users table...');
      await queryInterface.addColumn('users', 'pan_number', {
        type: DataTypes.STRING(10),
        allowNull: true,
      });
      enterpriseLogger.info('pan_number column added');
    } else {
      enterpriseLogger.info('pan_number column already exists');
    }
    
    // Add pan_verified column if it doesn't exist
    if (!tableDescription.pan_verified) {
      enterpriseLogger.info('Adding pan_verified column to users table...');
      await queryInterface.addColumn('users', 'pan_verified', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
      enterpriseLogger.info('pan_verified column added');
    } else {
      enterpriseLogger.info('pan_verified column already exists');
    }
    
    // Add pan_verified_at column if it doesn't exist
    if (!tableDescription.pan_verified_at) {
      enterpriseLogger.info('Adding pan_verified_at column to users table...');
      await queryInterface.addColumn('users', 'pan_verified_at', {
        type: DataTypes.DATE,
        allowNull: true,
      });
      enterpriseLogger.info('pan_verified_at column added');
    } else {
      enterpriseLogger.info('pan_verified_at column already exists');
    }
    
    // Add last_login_at column if it doesn't exist
    if (!tableDescription.last_login_at) {
      enterpriseLogger.info('Adding last_login_at column to users table...');
      await queryInterface.addColumn('users', 'last_login_at', {
        type: DataTypes.DATE,
        allowNull: true,
      });
      enterpriseLogger.info('last_login_at column added');
    } else {
      enterpriseLogger.info('last_login_at column already exists');
    }
    
    // Add onboarding_completed column if it doesn't exist
    if (!tableDescription.onboarding_completed) {
      enterpriseLogger.info('Adding onboarding_completed column to users table...');
      await queryInterface.addColumn('users', 'onboarding_completed', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
      enterpriseLogger.info('onboarding_completed column added');
    } else {
      enterpriseLogger.info('onboarding_completed column already exists');
    }

    // Add date_of_birth column if it doesn't exist
    if (!tableDescription.date_of_birth) {
      enterpriseLogger.info('Adding date_of_birth column to users table...');
      await queryInterface.addColumn('users', 'date_of_birth', {
        type: DataTypes.DATEONLY,
        allowNull: true,
      });
      enterpriseLogger.info('date_of_birth column added');
    } else {
      enterpriseLogger.info('date_of_birth column already exists');
    }

    // Add metadata column if it doesn't exist
    if (!tableDescription.metadata) {
      enterpriseLogger.info('Adding metadata column to users table...');
      await queryInterface.addColumn('users', 'metadata', {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      });
      // Add GIN index for metadata column
      enterpriseLogger.info('Adding GIN index for metadata column...');
      await queryInterface.addIndex('users', ['metadata'], {
        using: 'gin',
        name: 'idx_users_metadata_gin',
        concurrently: false,
      });
      enterpriseLogger.info('metadata column and index added');
    } else {
      enterpriseLogger.info('metadata column already exists');
    }
    
    enterpriseLogger.info('All missing columns checked/added successfully');
    return true;
  } catch (error) {
    enterpriseLogger.error('Error adding missing columns:', error.message);
    enterpriseLogger.error('Stack:', error.stack);
    return false;
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  addMissingUserColumns()
    .then((success) => {
      if (success) {
        console.log('✅ Missing columns added successfully');
        process.exit(0);
      } else {
        console.log('❌ Failed to add missing columns');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { addMissingUserColumns };

