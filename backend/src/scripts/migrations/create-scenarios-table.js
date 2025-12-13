// =====================================================
// MIGRATION: Create scenarios table
// =====================================================
// Run this script to create the scenarios table
// Usage: node src/scripts/migrations/create-scenarios-table.js

const { sequelize } = require('../../config/database');
const enterpriseLogger = require('../../utils/logger');

async function createScenariosTable() {
  try {
    enterpriseLogger.info('Creating scenarios table...');
    console.log('\n=== Creating Scenarios Table ===\n');

    // Check if table exists
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'scenarios'
    `);
    
    const tableExists = tables.length > 0;

    if (!tableExists) {
      console.log('Creating scenarios table...');
      await sequelize.query(`
        CREATE TABLE scenarios (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          filing_id UUID REFERENCES itr_filings(id) ON DELETE SET NULL,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          scenario_type VARCHAR(100) NOT NULL,
          changes JSONB NOT NULL DEFAULT '{}',
          simulation_result JSONB,
          is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
          tags TEXT[] DEFAULT '{}',
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log('✅ scenarios table created');

      // Create indexes
      await sequelize.query(`
        CREATE INDEX idx_scenarios_user_id ON scenarios(user_id)
      `);
      console.log('✅ Index on user_id created');

      await sequelize.query(`
        CREATE INDEX idx_scenarios_filing_id ON scenarios(filing_id)
      `);
      console.log('✅ Index on filing_id created');

      await sequelize.query(`
        CREATE INDEX idx_scenarios_scenario_type ON scenarios(scenario_type)
      `);
      console.log('✅ Index on scenario_type created');

      await sequelize.query(`
        CREATE INDEX idx_scenarios_is_favorite ON scenarios(is_favorite)
      `);
      console.log('✅ Index on is_favorite created');

      await sequelize.query(`
        CREATE INDEX idx_scenarios_created_at ON scenarios(created_at)
      `);
      console.log('✅ Index on created_at created');
    } else {
      console.log('scenarios table already exists');
    }

    console.log('\n✅ Migration completed successfully!\n');
    enterpriseLogger.info('Scenarios table migration completed');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    enterpriseLogger.error('Scenarios table migration failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  createScenariosTable()
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

module.exports = createScenariosTable;

