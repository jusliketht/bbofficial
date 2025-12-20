// =====================================================
// MIGRATION: Support ITR type freezing
// =====================================================
// Makes itr_type nullable initially and adds documentation/index
// for ITR type freezing support. Domain Core enforces immutability.
//
// Usage:
//   node backend/src/scripts/migrations/support-itr-type-freezing.js
//
// Notes:
// - Safe to run multiple times
// - Makes itr_type nullable (was NOT NULL)
// - Adds partial index for locked filings

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
require('dotenv').config();

const { sequelize } = require('../../config/database');
const enterpriseLogger = require('../../utils/logger');

async function supportItrTypeFreezing() {
  const transaction = await sequelize.transaction();
  try {
    enterpriseLogger.info('Supporting ITR type freezing...');
    console.log('\n=== Support ITR Type Freezing ===\n');

    // Step 1: Make itr_type nullable
    console.log('Making itr_type nullable...');
    try {
      await sequelize.query(`
        ALTER TABLE itr_filings 
        ALTER COLUMN itr_type DROP NOT NULL;
      `, { transaction });
      console.log('✅ itr_type is now nullable');
    } catch (error) {
      if (error.message.includes('does not exist') || error.message.includes('column')) {
        console.log('⚠️  itr_type column may not exist or already nullable');
      } else {
        throw error;
      }
    }

    // Step 2: Add comment to column
    console.log('Adding comment to itr_type column...');
    try {
      await sequelize.query(`
        COMMENT ON COLUMN itr_filings.itr_type IS 
        'ITR type (ITR-1, ITR-2, ITR-3, ITR-4). Nullable initially, must be set once determined, must not change after LOCKED state. Domain Core enforces immutability.';
      `, { transaction });
      console.log('✅ Comment added to itr_type');
    } catch (error) {
      console.log('⚠️  Could not add comment (non-critical)');
    }

    // Step 3: Add partial index for locked filings (optional, for audits)
    console.log('Adding partial index for locked ITR types...');
    try {
      // Check if lifecycle_state column exists
      const [columns] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'itr_filings' 
          AND column_name = 'lifecycle_state'
      `, { transaction });

      if (columns.length > 0) {
        // lifecycle_state exists, create partial index
        await sequelize.query(`
          CREATE INDEX IF NOT EXISTS idx_itr_locked_type 
          ON itr_filings (itr_type) 
          WHERE lifecycle_state IN ('LOCKED', 'FILED', 'ACKNOWLEDGED', 'COMPLETED');
        `, { transaction });
        console.log('✅ Partial index created');
      } else {
        // lifecycle_state doesn't exist yet, create simple index
        console.log('⚠️  lifecycle_state column not found, creating simple index instead');
        await sequelize.query(`
          CREATE INDEX IF NOT EXISTS idx_itr_locked_type 
          ON itr_filings (itr_type) 
          WHERE status IN ('submitted', 'acknowledged', 'processed');
        `, { transaction });
        console.log('✅ Partial index created (using status column)');
      }
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Index already exists');
      } else {
        console.log('⚠️  Could not create index (non-critical):', error.message);
      }
    }

    await transaction.commit();
    console.log('\n✅ Migration completed successfully');
    enterpriseLogger.info('ITR type freezing support migration completed');
  } catch (error) {
    await transaction.rollback();
    console.error('\n❌ Migration failed:', error.message);
    enterpriseLogger.error('ITR type freezing support migration failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  supportItrTypeFreezing()
    .then(() => {
      console.log('\nMigration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = supportItrTypeFreezing;

