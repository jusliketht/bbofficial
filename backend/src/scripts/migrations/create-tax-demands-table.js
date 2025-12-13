// =====================================================
// MIGRATION: Create tax_demands table
// =====================================================
// Run this script to create the tax_demands table
// Usage: node src/scripts/migrations/create-tax-demands-table.js

const { sequelize } = require('../../config/database');
const enterpriseLogger = require('../../utils/logger');

async function createTaxDemandsTable() {
  try {
    enterpriseLogger.info('Creating tax_demands table...');
    console.log('\n=== Creating Tax Demands Table ===\n');

    // Check if table exists
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'tax_demands'
    `);
    
    const tableExists = tables.length > 0;

    if (!tableExists) {
      console.log('Creating tax_demands table...');
      await sequelize.query(`
        CREATE TABLE tax_demands (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          filing_id UUID REFERENCES itr_filings(id) ON DELETE SET NULL,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          demand_number VARCHAR(255) NOT NULL UNIQUE,
          demand_type VARCHAR(50) NOT NULL CHECK (demand_type IN ('ASSESSMENT', 'INTEREST', 'PENALTY', 'TAX', 'OTHER')),
          assessment_year VARCHAR(10) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'disputed', 'partially_paid', 'paid', 'waived', 'closed')),
          total_amount DECIMAL(15, 2) NOT NULL,
          paid_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
          outstanding_amount DECIMAL(15, 2) NOT NULL,
          received_date TIMESTAMP NOT NULL,
          due_date TIMESTAMP,
          paid_at TIMESTAMP,
          subject TEXT NOT NULL,
          description TEXT,
          breakdown JSONB DEFAULT '{}',
          document_url TEXT,
          dispute_reason TEXT,
          dispute_documents JSONB DEFAULT '[]',
          dispute_status VARCHAR(50) CHECK (dispute_status IN ('pending', 'under_review', 'accepted', 'rejected')),
          payment_history JSONB DEFAULT '[]',
          timeline JSONB DEFAULT '[]',
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log('✅ tax_demands table created');

      // Create indexes
      await sequelize.query(`
        CREATE INDEX idx_tax_demands_user_id ON tax_demands(user_id)
      `);
      console.log('✅ Index on user_id created');

      await sequelize.query(`
        CREATE INDEX idx_tax_demands_filing_id ON tax_demands(filing_id)
      `);
      console.log('✅ Index on filing_id created');

      await sequelize.query(`
        CREATE INDEX idx_tax_demands_status ON tax_demands(status)
      `);
      console.log('✅ Index on status created');

      await sequelize.query(`
        CREATE INDEX idx_tax_demands_demand_type ON tax_demands(demand_type)
      `);
      console.log('✅ Index on demand_type created');

      await sequelize.query(`
        CREATE INDEX idx_tax_demands_due_date ON tax_demands(due_date)
      `);
      console.log('✅ Index on due_date created');

      await sequelize.query(`
        CREATE INDEX idx_tax_demands_received_date ON tax_demands(received_date)
      `);
      console.log('✅ Index on received_date created');

      await sequelize.query(`
        CREATE INDEX idx_tax_demands_created_at ON tax_demands(created_at)
      `);
      console.log('✅ Index on created_at created');
    } else {
      console.log('tax_demands table already exists');
    }

    console.log('\n✅ Migration completed successfully!\n');
    enterpriseLogger.info('Tax demands table migration completed');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    enterpriseLogger.error('Tax demands table migration failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error; // Re-throw instead of exiting
  }
  // Note: Don't close sequelize connection here - let caller handle it
}

// Run migration if called directly
if (require.main === module) {
  createTaxDemandsTable()
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

module.exports = createTaxDemandsTable;

