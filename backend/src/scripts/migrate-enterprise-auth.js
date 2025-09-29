// =====================================================
// ENTERPRISE AUTH MIGRATION SCRIPT
// Updates User model with new role enum and ca_firm_id
// Creates CAFirm table
// =====================================================

require('dotenv').config();
const { sequelize } = require('../config/database');
const { User, CAFirm, UserSession, AuditLog, PasswordResetToken } = require('../models');
const enterpriseLogger = require('../utils/logger');

async function migrateEnterpriseAuth() {
  enterpriseLogger.info('Starting enterprise auth migration...');
  
  try {
    // 1. Create CAFirm table first
    await CAFirm.sync({ alter: true });
    enterpriseLogger.info('✅ CAFirm table created/updated');

    // 2. Update User table with new role enum and ca_firm_id
    await User.sync({ alter: true });
    enterpriseLogger.info('✅ User table updated with new role enum and ca_firm_id');

    // 3. Sync other auth tables
    await UserSession.sync({ alter: true });
    enterpriseLogger.info('✅ UserSession table synced');

    await AuditLog.sync({ alter: true });
    enterpriseLogger.info('✅ AuditLog table synced');

    await PasswordResetToken.sync({ alter: true });
    enterpriseLogger.info('✅ PasswordResetToken table synced');

    // 4. Add indexes
    const queryInterface = sequelize.getQueryInterface();

    // CAFirm indexes
    try {
      await queryInterface.addIndex('ca_firms', ['gst_number'], { 
        unique: true, 
        name: 'ca_firms_gst_number_unique' 
      });
      enterpriseLogger.info('✅ Added ca_firms gst_number unique index');
    } catch (error) { /* ignore if exists */ }

    try {
      await queryInterface.addIndex('ca_firms', ['created_by'], { 
        name: 'ca_firms_created_by_index' 
      });
      enterpriseLogger.info('✅ Added ca_firms created_by index');
    } catch (error) { /* ignore if exists */ }

    try {
      await queryInterface.addIndex('ca_firms', ['status'], { 
        name: 'ca_firms_status_index' 
      });
      enterpriseLogger.info('✅ Added ca_firms status index');
    } catch (error) { /* ignore if exists */ }

    // User ca_firm_id index
    try {
      await queryInterface.addIndex('users', ['ca_firm_id'], { 
        name: 'users_ca_firm_id_index' 
      });
      enterpriseLogger.info('✅ Added users ca_firm_id index');
    } catch (error) { /* ignore if exists */ }

    // 5. Update existing users with new role enum values
    const roleMapping = {
      'user': 'END_USER',
      'ca': 'CA',
      'ca_firm_admin': 'CA_FIRM_ADMIN',
      'platform_admin': 'PLATFORM_ADMIN',
      'super_admin': 'SUPER_ADMIN'
    };

    for (const [oldRole, newRole] of Object.entries(roleMapping)) {
      const updateResult = await User.update(
        { role: newRole },
        { where: { role: oldRole } }
      );
      
      if (updateResult[0] > 0) {
        enterpriseLogger.info(`✅ Updated ${updateResult[0]} users from ${oldRole} to ${newRole}`);
      }
    }

    // 6. Create default CA firm for testing
    const existingFirm = await CAFirm.findOne({ where: { name: 'Default CA Firm' } });
    if (!existingFirm) {
      const defaultFirm = await CAFirm.create({
        name: 'Default CA Firm',
        gstNumber: '29ABCDE1234F1Z5',
        address: '123 Business Street, Mumbai, Maharashtra 400001',
        phone: '+91-9876543210',
        email: 'admin@defaultcafirm.com',
        createdBy: '00000000-0000-0000-0000-000000000000', // Placeholder UUID
        status: 'active',
        metadata: {
          description: 'Default CA firm for testing and development',
          established: new Date().getFullYear()
        }
      });
      enterpriseLogger.info('✅ Created default CA firm', { firmId: defaultFirm.id });
    }

    enterpriseLogger.info('🎉 Enterprise auth migration completed successfully');
    console.log('✅ Enterprise auth migration completed');
    
  } catch (error) {
    enterpriseLogger.error('Enterprise auth migration failed', { 
      error: error.message, 
      stack: error.stack 
    });
    console.error('❌ Enterprise auth migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrateEnterpriseAuth();
