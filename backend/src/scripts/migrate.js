// =====================================================
// DATABASE MIGRATION SCRIPT - SEQUELIZE STANDARDIZED
// =====================================================

// Load environment variables first
require('dotenv').config();

const { sequelize } = require('../config/database');
const enterpriseLogger = require('../utils/logger');

// Import all models to ensure they're registered
const User = require('../models/User');
const { FamilyMember } = require('../models/Member');
const ITRFiling = require('../models/ITRFiling');
const ITRDraft = require('../models/ITRDraft');
const { Document } = require('../models/Document');
const { ServiceTicket } = require('../models/ServiceTicket');
const { ServiceTicketMessage } = require('../models/ServiceTicketMessage');
const { Invoice } = require('../models/Invoice');

const runMigrations = async () => {
  try {
    // Test connection first
    await sequelize.authenticate();
    enterpriseLogger.info('Database connection established');

    // Create tables in dependency order
    await createTablesInOrder();
    enterpriseLogger.info('Database tables created successfully');

    // Now add indexes manually
    await addIndexes();
    enterpriseLogger.info('Database indexes created successfully');

    // Verify tables exist
    const tables = await sequelize.getQueryInterface().showAllTables();
    enterpriseLogger.info('Database tables verified', { tables });

    return true;
  } catch (error) {
    enterpriseLogger.error('Migration failed', { error: error.message, stack: error.stack });
    return false;
  }
};

const createTablesInOrder = async () => {
  try {
    // Create tables in dependency order
    await User.sync({ force: false, alter: false });
    enterpriseLogger.info('Users table created');
    
    await FamilyMember.sync({ force: false, alter: false });
    enterpriseLogger.info('Family members table created');
    
    await ITRFiling.sync({ force: false, alter: false });
    enterpriseLogger.info('ITR filings table created');
    
    await ITRDraft.sync({ force: false, alter: false });
    enterpriseLogger.info('ITR drafts table created');
    
    await Document.sync({ force: false, alter: false });
    enterpriseLogger.info('Documents table created');
    
    await ServiceTicket.sync({ force: false, alter: false });
    enterpriseLogger.info('Service tickets table created');
    
    await ServiceTicketMessage.sync({ force: false, alter: false });
    enterpriseLogger.info('Service ticket messages table created');
    
    await Invoice.sync({ force: false, alter: false });
    enterpriseLogger.info('Invoices table created');
    
  } catch (error) {
    enterpriseLogger.error('Failed to create tables in order', { error: error.message });
    throw error;
  }
};

const addIndexes = async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    
    // Add indexes for family_members table (skip if they already exist)
    try {
      await queryInterface.addIndex('family_members', ['pan_number'], {
        unique: true,
        name: 'family_members_pan_number_unique'
      });
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
    }
    
    try {
      await queryInterface.addIndex('family_members', ['user_id'], {
        name: 'family_members_user_id_index'
      });
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
    }
    
    try {
      await queryInterface.addIndex('family_members', ['relationship'], {
        name: 'family_members_relationship_index'
      });
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
    }
    
    try {
      await queryInterface.addIndex('family_members', ['is_dependent'], {
        name: 'family_members_is_dependent_index'
      });
    } catch (e) {
      if (!e.message.includes('already exists')) throw e;
    }
    
    enterpriseLogger.info('Indexes added successfully');
  } catch (error) {
    enterpriseLogger.error('Failed to add indexes', { error: error.message });
    throw error;
  }
};

const runSeedData = async () => {
  try {
    enterpriseLogger.info('Starting seed data insertion...');

    // Create test users with correct password hashes
    const bcrypt = require('bcryptjs');
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    const userPasswordHash = await bcrypt.hash('admin123', 12);
    const caPasswordHash = await bcrypt.hash('admin123', 12);
    const platformPasswordHash = await bcrypt.hash('admin123', 12);
    const charteredPasswordHash = await bcrypt.hash('admin123', 12);

    const testUsers = [
      {
        email: 'admin@burnblack.com',
        passwordHash: adminPasswordHash,
        fullName: 'Admin User',
        role: 'super_admin',
        status: 'active',
        emailVerified: true
      },
      {
        email: 'user@burnblack.com',
        passwordHash: userPasswordHash,
        fullName: 'Test User',
        role: 'user',
        status: 'active',
        emailVerified: true
      },
      {
        email: 'ca@burnblack.com',
        passwordHash: caPasswordHash,
        fullName: 'CA Professional',
        role: 'ca_firm_admin',
        status: 'active',
        emailVerified: true
      },
      {
        email: 'platform@burnblack.com',
        passwordHash: platformPasswordHash,
        fullName: 'Platform Admin',
        role: 'platform_admin',
        status: 'active',
        emailVerified: true
      },
      {
        email: 'chartered@burnblack.com',
        passwordHash: charteredPasswordHash,
        fullName: 'Chartered Accountant',
        role: 'ca',
        status: 'active',
        emailVerified: true
      }
    ];

    for (const userData of testUsers) {
      await User.findOrCreate({
        where: { email: userData.email },
        defaults: userData
      });
    }

    enterpriseLogger.info('Seed data inserted successfully');
    return true;
  } catch (error) {
    enterpriseLogger.error('Seed data insertion failed', { error: error.message });
    return false;
  }
};

const resetDatabase = async () => {
  try {
    enterpriseLogger.info('Resetting database...');
    
    // Drop all tables
    await sequelize.drop();
    enterpriseLogger.info('All tables dropped');

    // Recreate tables
    await sequelize.sync({ force: true });
    enterpriseLogger.info('Tables recreated');

    // Insert seed data
    await runSeedData();
    
    enterpriseLogger.info('Database reset completed successfully');
    return true;
  } catch (error) {
    enterpriseLogger.error('Database reset failed', { error: error.message });
    return false;
  }
};

// Main execution
const main = async () => {
  const command = process.argv[2];
  
  switch (command) {
    case 'migrate':
      const migrateResult = await runMigrations();
      process.exit(migrateResult ? 0 : 1);
      break;
      
    case 'seed':
      const seedResult = await runSeedData();
      process.exit(seedResult ? 0 : 1);
      break;
      
    case 'reset':
      const resetResult = await resetDatabase();
      process.exit(resetResult ? 0 : 1);
      break;
      
    default:
      console.log('Usage: node migrate.js [migrate|seed|reset]');
      process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    enterpriseLogger.error('Migration script failed', { error: error.message });
    process.exit(1);
  });
}

module.exports = {
  runMigrations,
  runSeedData,
  resetDatabase
};