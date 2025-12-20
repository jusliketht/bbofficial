// =====================================================
// MIGRATION: Add immutability metadata columns
// =====================================================
// Adds locked_at, locked_by, filed_at, filed_by columns to itr_filings
// for audit and immutability tracking. Domain Core will populate these.
//
// Usage:
//   node backend/src/scripts/migrations/add-immutability-metadata.js
//
// Notes:
// - Safe to run multiple times (checks if columns exist)
// - No triggers - Domain Core enforces immutability

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
require('dotenv').config();

const { sequelize } = require('../../config/database');
const enterpriseLogger = require('../../utils/logger');

async function addImmutabilityMetadata() {
  const transaction = await sequelize.transaction();
  try {
    enterpriseLogger.info('Adding immutability metadata columns...');
    console.log('\n=== Add Immutability Metadata ===\n');

    // Check if users table exists (for foreign key)
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `, { transaction });

    const usersTableExists = tables.length > 0;

    // Add locked_at column
    console.log('Adding locked_at column...');
    try {
      await sequelize.query(`
        ALTER TABLE itr_filings
        ADD COLUMN locked_at TIMESTAMP NULL;
      `, { transaction });
      console.log('✅ locked_at column added');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
        console.log('✅ locked_at column already exists');
      } else {
        throw error;
      }
    }

    // Add locked_by column
    console.log('Adding locked_by column...');
    try {
      const fkConstraint = usersTableExists 
        ? 'REFERENCES users(id) ON DELETE SET NULL'
        : '';
      await sequelize.query(`
        ALTER TABLE itr_filings
        ADD COLUMN locked_by UUID NULL ${fkConstraint};
      `, { transaction });
      console.log('✅ locked_by column added');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
        console.log('✅ locked_by column already exists');
      } else {
        throw error;
      }
    }

    // Add filed_at column
    console.log('Adding filed_at column...');
    try {
      await sequelize.query(`
        ALTER TABLE itr_filings
        ADD COLUMN filed_at TIMESTAMP NULL;
      `, { transaction });
      console.log('✅ filed_at column added');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
        console.log('✅ filed_at column already exists');
      } else {
        throw error;
      }
    }

    // Add filed_by column
    console.log('Adding filed_by column...');
    try {
      const fkConstraint = usersTableExists 
        ? 'REFERENCES users(id) ON DELETE SET NULL'
        : '';
      await sequelize.query(`
        ALTER TABLE itr_filings
        ADD COLUMN filed_by UUID NULL ${fkConstraint};
      `, { transaction });
      console.log('✅ filed_by column added');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
        console.log('✅ filed_by column already exists');
      } else {
        throw error;
      }
    }

    // Populate filed_at from submitted_at for existing records
    console.log('Populating filed_at from submitted_at for existing records...');
    try {
      const [result] = await sequelize.query(`
        UPDATE itr_filings
        SET filed_at = submitted_at
        WHERE filed_at IS NULL 
          AND submitted_at IS NOT NULL
          AND status IN ('submitted', 'acknowledged', 'processed');
      `, { transaction });
      console.log(`✅ Populated filed_at for ${result.rowCount || 0} existing records`);
    } catch (error) {
      console.log('⚠️  Could not populate filed_at (non-critical)');
    }

    // Add comments
    console.log('Adding column comments...');
    try {
      await sequelize.query(`
        COMMENT ON COLUMN itr_filings.locked_at IS 
        'Timestamp when filing was locked. Domain Core uses this as a guard (not SQL constraint).';
        COMMENT ON COLUMN itr_filings.locked_by IS 
        'User ID who locked the filing. Domain Core uses this for audit trails.';
        COMMENT ON COLUMN itr_filings.filed_at IS 
        'Timestamp when filing was submitted/filed. Domain Core uses this as a guard (not SQL constraint).';
        COMMENT ON COLUMN itr_filings.filed_by IS 
        'User ID who filed the ITR. Domain Core uses this for audit trails.';
      `, { transaction });
      console.log('✅ Comments added');
    } catch (error) {
      console.log('⚠️  Could not add comments (non-critical)');
    }

    await transaction.commit();
    console.log('\n✅ Migration completed successfully');
    enterpriseLogger.info('Immutability metadata migration completed');
  } catch (error) {
    await transaction.rollback();
    console.error('\n❌ Migration failed:', error.message);
    enterpriseLogger.error('Immutability metadata migration failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  addImmutabilityMetadata()
    .then(() => {
      console.log('\nMigration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = addImmutabilityMetadata;

