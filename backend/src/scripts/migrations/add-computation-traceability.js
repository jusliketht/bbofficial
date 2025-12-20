// =====================================================
// MIGRATION: Add computation traceability columns
// =====================================================
// Adds computation_version, computed_at, computed_by, regime_selected
// columns to itr_filings for computation tracking and audit.
//
// Usage:
//   node backend/src/scripts/migrations/add-computation-traceability.js
//
// Notes:
// - Safe to run multiple times (checks if columns exist)
// - Migrates existing regime values to regime_selected
// - Sets computation_version for existing computed filings

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
require('dotenv').config();

const { sequelize } = require('../../config/database');
const enterpriseLogger = require('../../utils/logger');

async function addComputationTraceability() {
  const transaction = await sequelize.transaction();
  try {
    enterpriseLogger.info('Adding computation traceability columns...');
    console.log('\n=== Add Computation Traceability ===\n');

    // Check if users table exists (for foreign key)
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `, { transaction });

    const usersTableExists = tables.length > 0;

    // Add computation_version column
    console.log('Adding computation_version column...');
    try {
      await sequelize.query(`
        ALTER TABLE itr_filings
        ADD COLUMN computation_version INTEGER DEFAULT 1;
      `, { transaction });
      console.log('✅ computation_version column added');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
        console.log('✅ computation_version column already exists');
      } else {
        throw error;
      }
    }

    // Add computed_at column
    console.log('Adding computed_at column...');
    try {
      await sequelize.query(`
        ALTER TABLE itr_filings
        ADD COLUMN computed_at TIMESTAMP NULL;
      `, { transaction });
      console.log('✅ computed_at column added');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
        console.log('✅ computed_at column already exists');
      } else {
        throw error;
      }
    }

    // Add computed_by column
    console.log('Adding computed_by column...');
    try {
      const fkConstraint = usersTableExists 
        ? 'REFERENCES users(id) ON DELETE SET NULL'
        : '';
      await sequelize.query(`
        ALTER TABLE itr_filings
        ADD COLUMN computed_by UUID NULL ${fkConstraint};
      `, { transaction });
      console.log('✅ computed_by column added');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
        console.log('✅ computed_by column already exists');
      } else {
        throw error;
      }
    }

    // Add regime_selected column
    console.log('Adding regime_selected column...');
    try {
      await sequelize.query(`
        ALTER TABLE itr_filings
        ADD COLUMN regime_selected VARCHAR(10) CHECK (regime_selected IN ('old', 'new'));
      `, { transaction });
      console.log('✅ regime_selected column added');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
        console.log('✅ regime_selected column already exists');
      } else {
        throw error;
      }
    }

    // Migrate existing data
    console.log('Migrating existing data...');

    // Copy regime to regime_selected
    try {
      const [result] = await sequelize.query(`
        UPDATE itr_filings
        SET regime_selected = regime
        WHERE regime_selected IS NULL 
          AND regime IS NOT NULL;
      `, { transaction });
      console.log(`✅ Copied regime to regime_selected for ${result.rowCount || 0} records`);
    } catch (error) {
      console.log('⚠️  Could not migrate regime (regime column may not exist)');
    }

    // Set computation_version and computed_at for existing computed filings
    try {
      const [result] = await sequelize.query(`
        UPDATE itr_filings
        SET computation_version = 1,
            computed_at = updated_at
        WHERE computed_at IS NULL 
          AND tax_computation IS NOT NULL;
      `, { transaction });
      console.log(`✅ Set computation_version and computed_at for ${result.rowCount || 0} records`);
    } catch (error) {
      console.log('⚠️  Could not set computation metadata (non-critical)');
    }

    // Add comments
    console.log('Adding column comments...');
    try {
      await sequelize.query(`
        COMMENT ON COLUMN itr_filings.computation_version IS 
        'Version number of tax computation. Incremented each time tax is recomputed.';
        COMMENT ON COLUMN itr_filings.computed_at IS 
        'Timestamp when tax computation was last performed.';
        COMMENT ON COLUMN itr_filings.computed_by IS 
        'User ID who performed the computation. NULL for system computations.';
        COMMENT ON COLUMN itr_filings.regime_selected IS 
        'Tax regime selected for this filing (old or new). Should match regime in return_versions.';
      `, { transaction });
      console.log('✅ Comments added');
    } catch (error) {
      console.log('⚠️  Could not add comments (non-critical)');
    }

    // Add comment to regime column (deprecated)
    try {
      await sequelize.query(`
        COMMENT ON COLUMN itr_filings.regime IS 
        'Deprecated: Use regime_selected instead. Will be removed in future migration.';
      `, { transaction });
      console.log('✅ Deprecation comment added to regime column');
    } catch (error) {
      console.log('⚠️  Could not add deprecation comment (non-critical)');
    }

    await transaction.commit();
    console.log('\n✅ Migration completed successfully');
    enterpriseLogger.info('Computation traceability migration completed');
  } catch (error) {
    await transaction.rollback();
    console.error('\n❌ Migration failed:', error.message);
    enterpriseLogger.error('Computation traceability migration failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  addComputationTraceability()
    .then(() => {
      console.log('\nMigration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = addComputationTraceability;

