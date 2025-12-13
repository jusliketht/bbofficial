// =====================================================
// MIGRATION: Create system_settings table
// =====================================================
// Run this script to create the system_settings table
// Usage: node src/scripts/migrations/create-system-settings-table.js

const { sequelize } = require('../../config/database');
const enterpriseLogger = require('../../utils/logger');

async function createSystemSettingsTable() {
  try {
    enterpriseLogger.info('Creating system_settings table...');
    console.log('\n=== Creating System Settings Table ===\n');

    // Check if table exists
    const tablesResult = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'system_settings'
    `, { type: require('sequelize').QueryTypes.SELECT });
    
    const tables = Array.isArray(tablesResult) ? tablesResult : [];
    const tableExists = tables.length > 0;

    if (!tableExists) {
      console.log('Creating system_settings table...');
      await sequelize.query(`
        CREATE TABLE system_settings (
          key VARCHAR(255) PRIMARY KEY,
          value JSONB NOT NULL DEFAULT '{}',
          category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'tax', 'security', 'integrations', 'notifications')),
          updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log('✅ system_settings table created');

      // Create index on category for faster queries
      await sequelize.query(`
        CREATE INDEX idx_system_settings_category ON system_settings(category)
      `);
      console.log('✅ Index on category created');
    } else {
      console.log('system_settings table already exists');
    }

    console.log('\n✅ Migration completed successfully!\n');
    enterpriseLogger.info('System settings table migration completed');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    enterpriseLogger.error('System settings table migration failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error; // Re-throw instead of exiting
  }
  // Note: Don't close sequelize connection here - let caller handle it
}

// Run migration if called directly
if (require.main === module) {
  createSystemSettingsTable()
    .then(async () => {
      console.log('Migration script completed');
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('Migration script failed:', error);
      await sequelize.close();
      process.exit(1);
    });
}

module.exports = createSystemSettingsTable;

