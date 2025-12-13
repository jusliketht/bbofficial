// =====================================================
// MIGRATION: Create assessment_notices table
// =====================================================
// Run this script to create the assessment_notices table
// Usage: node src/scripts/migrations/create-assessment-notices-table.js

const { sequelize } = require('../../config/database');
const enterpriseLogger = require('../../utils/logger');

async function createAssessmentNoticesTable() {
  try {
    enterpriseLogger.info('Creating assessment_notices table...');
    console.log('\n=== Creating Assessment Notices Table ===\n');

    // Check if table exists
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'assessment_notices'
    `);
    
    const tableExists = tables.length > 0;

    if (!tableExists) {
      console.log('Creating assessment_notices table...');
      await sequelize.query(`
        CREATE TABLE assessment_notices (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          filing_id UUID REFERENCES itr_filings(id) ON DELETE SET NULL,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          notice_number VARCHAR(255) NOT NULL UNIQUE,
          notice_type VARCHAR(50) NOT NULL CHECK (notice_type IN ('143(1)', '142(1)', '148', '153A', '153C', '154', '156', '245', 'OTHER')),
          assessment_year VARCHAR(10) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'responded', 'resolved', 'disputed', 'closed')),
          received_date TIMESTAMP NOT NULL,
          due_date TIMESTAMP,
          responded_at TIMESTAMP,
          resolved_at TIMESTAMP,
          subject TEXT NOT NULL,
          description TEXT,
          amount DECIMAL(15, 2),
          document_url TEXT,
          response_text TEXT,
          response_documents JSONB DEFAULT '[]',
          timeline JSONB DEFAULT '[]',
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
      `);
      console.log('✅ assessment_notices table created');

      // Create indexes
      await sequelize.query(`
        CREATE INDEX idx_assessment_notices_user_id ON assessment_notices(user_id)
      `);
      console.log('✅ Index on user_id created');

      await sequelize.query(`
        CREATE INDEX idx_assessment_notices_filing_id ON assessment_notices(filing_id)
      `);
      console.log('✅ Index on filing_id created');

      await sequelize.query(`
        CREATE INDEX idx_assessment_notices_status ON assessment_notices(status)
      `);
      console.log('✅ Index on status created');

      await sequelize.query(`
        CREATE INDEX idx_assessment_notices_notice_type ON assessment_notices(notice_type)
      `);
      console.log('✅ Index on notice_type created');

      await sequelize.query(`
        CREATE INDEX idx_assessment_notices_due_date ON assessment_notices(due_date)
      `);
      console.log('✅ Index on due_date created');

      await sequelize.query(`
        CREATE INDEX idx_assessment_notices_received_date ON assessment_notices(received_date)
      `);
      console.log('✅ Index on received_date created');

      await sequelize.query(`
        CREATE INDEX idx_assessment_notices_created_at ON assessment_notices(created_at)
      `);
      console.log('✅ Index on created_at created');
    } else {
      console.log('assessment_notices table already exists');
    }

    console.log('\n✅ Migration completed successfully!\n');
    enterpriseLogger.info('Assessment notices table migration completed');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    enterpriseLogger.error('Assessment notices table migration failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error; // Re-throw instead of exiting
  }
  // Note: Don't close sequelize connection here - let caller handle it
}

// Run migration if called directly
if (require.main === module) {
  createAssessmentNoticesTable()
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

module.exports = createAssessmentNoticesTable;

