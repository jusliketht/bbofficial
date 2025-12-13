// =====================================================
// MIGRATION: Create itr_v_processing table
// =====================================================
// Run this script to create the itr_v_processing table
// Usage: node src/scripts/migrations/create-itrv-processing-table.js

const { sequelize } = require('../../config/database');
const enterpriseLogger = require('../../utils/logger');

async function createITRVProcessingTable() {
  try {
    enterpriseLogger.info('Creating itr_v_processing table...');
    console.log('\n=== Creating ITR-V Processing Table ===\n');

    // Check if table exists
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'itr_v_processing'
    `);
    
    const tableExists = tables.length > 0;

    if (!tableExists) {
      console.log('Creating itr_v_processing table...');
      await sequelize.query(`
        CREATE TABLE itr_v_processing (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          filing_id UUID NOT NULL REFERENCES itr_filings(id) ON DELETE CASCADE,
          ack_number VARCHAR(255) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'processing', 'delivered', 'verified', 'expired', 'failed')),
          generated_at TIMESTAMP,
          delivered_at TIMESTAMP,
          verified_at TIMESTAMP,
          expiry_date TIMESTAMP,
          delivery_method VARCHAR(50) CHECK (delivery_method IN ('email', 'post', 'download')),
          document_url TEXT,
          verification_method VARCHAR(50) CHECK (verification_method IN ('AADHAAR_OTP', 'NETBANKING', 'DSC', 'EVC', 'MANUAL')),
          timeline JSONB DEFAULT '[]',
          metadata JSONB DEFAULT '{}',
          last_checked_at TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          CONSTRAINT unique_itrv_per_filing UNIQUE (filing_id)
        )
      `);
      console.log('✅ itr_v_processing table created');

      // Create indexes
      await sequelize.query(`
        CREATE INDEX idx_itrv_ack_number ON itr_v_processing(ack_number)
      `);
      console.log('✅ Index on ack_number created');

      await sequelize.query(`
        CREATE INDEX idx_itrv_status ON itr_v_processing(status)
      `);
      console.log('✅ Index on status created');

      await sequelize.query(`
        CREATE INDEX idx_itrv_expiry_date ON itr_v_processing(expiry_date)
      `);
      console.log('✅ Index on expiry_date created');

      await sequelize.query(`
        CREATE INDEX idx_itrv_created_at ON itr_v_processing(created_at)
      `);
      console.log('✅ Index on created_at created');
    } else {
      console.log('itr_v_processing table already exists');
    }

    console.log('\n✅ Migration completed successfully!\n');
    enterpriseLogger.info('ITR-V processing table migration completed');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    enterpriseLogger.error('ITR-V processing table migration failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error; // Re-throw instead of exiting
  }
  // Note: Don't close sequelize connection here - let caller handle it
}

// Run migration if called directly
if (require.main === module) {
  createITRVProcessingTable()
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

module.exports = createITRVProcessingTable;

