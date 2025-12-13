// =====================================================
// MIGRATION: Create report_templates table
// =====================================================
// Run this script to create the report_templates table
// Usage: node src/scripts/migrations/create-report-templates-table.js

const { sequelize } = require('../../config/database');
const enterpriseLogger = require('../../utils/logger');

async function createReportTemplatesTable() {
  try {
    enterpriseLogger.info('Creating report_templates table...');
    console.log('\n=== Creating Report Templates Table ===\n');

    // Check if table exists
    const tablesResult = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'report_templates'
    `, { type: require('sequelize').QueryTypes.SELECT });
    
    const tables = Array.isArray(tablesResult) ? tablesResult : [];
    const tableExists = tables.length > 0;

    if (!tableExists) {
      console.log('Creating report_templates table...');
      await sequelize.query(`
        CREATE TABLE report_templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          metrics JSONB NOT NULL DEFAULT '[]',
          dimensions JSONB DEFAULT '[]',
          filters JSONB DEFAULT '{}',
          aggregation VARCHAR(50) DEFAULT 'count',
          created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          CONSTRAINT unique_template_name_per_user UNIQUE (name, created_by)
        )
      `);
      console.log('✅ report_templates table created');
    } else {
      console.log('report_templates table already exists');
    }

    console.log('\n✅ Migration completed successfully!\n');
    enterpriseLogger.info('Report templates table migration completed');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    enterpriseLogger.error('Report templates table migration failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error; // Re-throw instead of exiting
  }
  // Note: Don't close sequelize connection here - let caller handle it
}

// Run migration if called directly
if (require.main === module) {
  createReportTemplatesTable()
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

module.exports = createReportTemplatesTable;

