// =====================================================
// MIGRATION: Add lifecycle_state enum to itr_filings
// =====================================================
// Creates PostgreSQL ENUM type for ITR domain lifecycle states and adds
// lifecycle_state column to itr_filings table. Migrates existing data from
// status column to lifecycle_state using mapping logic.
//
// Usage:
//   node backend/src/scripts/migrations/add-lifecycle-state-enum.js
//
// Notes:
// - Safe to run multiple times (checks if enum/column exists)
// - Migrates existing data from status to lifecycle_state
// - Keeps status column for backward compatibility

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
require('dotenv').config();

const { sequelize } = require('../../config/database');
const enterpriseLogger = require('../../utils/logger');
const { ITR_DOMAIN_STATES } = require('../../domain/states');

/**
 * Map ITRFiling.status to domain state
 * Matches logic from domainGuard.js:mapStatusToDomainState()
 */
function mapStatusToDomainState(status, filing = null) {
  switch (status) {
    case 'draft':
      // Infer more specific state from filing context
      if (filing) {
        // If ITR type is set, assume ITR_DETERMINED or DATA_COLLECTED
        if (filing.itr_type) {
          // Check if there's substantial data collected
          if (filing.json_payload && typeof filing.json_payload === 'object') {
            const hasData = Object.keys(filing.json_payload).length > 0;
            return hasData ? ITR_DOMAIN_STATES.DATA_COLLECTED : ITR_DOMAIN_STATES.ITR_DETERMINED;
          }
          return ITR_DOMAIN_STATES.ITR_DETERMINED;
        }
      }
      return ITR_DOMAIN_STATES.DRAFT_INIT;
    case 'submitted':
      return ITR_DOMAIN_STATES.FILED;
    case 'acknowledged':
      return ITR_DOMAIN_STATES.ACKNOWLEDGED;
    case 'processed':
      return ITR_DOMAIN_STATES.COMPLETED;
    case 'paused':
      // Paused is orthogonal to domain state - keep current inferred state
      // We'll infer from context like 'draft'
      if (filing) {
        if (filing.itr_type) {
          if (filing.json_payload && typeof filing.json_payload === 'object') {
            const hasData = Object.keys(filing.json_payload).length > 0;
            return hasData ? ITR_DOMAIN_STATES.DATA_COLLECTED : ITR_DOMAIN_STATES.ITR_DETERMINED;
          }
          return ITR_DOMAIN_STATES.ITR_DETERMINED;
        }
      }
      return ITR_DOMAIN_STATES.DRAFT_INIT;
    case 'rejected':
      // Rejected is not a domain state, treat as error state
      return ITR_DOMAIN_STATES.DRAFT_INIT;
    default:
      return ITR_DOMAIN_STATES.DRAFT_INIT;
  }
}

async function addLifecycleStateEnum() {
  const transaction = await sequelize.transaction();
  try {
    enterpriseLogger.info('Adding lifecycle_state enum and column...');
    console.log('\n=== Add Lifecycle State Enum ===\n');

    // Step 1: Create ENUM type if it doesn't exist
    console.log('Creating itr_lifecycle_state ENUM type...');
    try {
      await sequelize.query(`
        CREATE TYPE itr_lifecycle_state AS ENUM (
          'DRAFT_INIT',
          'ITR_DETERMINED',
          'DATA_COLLECTED',
          'DATA_CONFIRMED',
          'COMPUTED',
          'LOCKED',
          'FILED',
          'ACKNOWLEDGED',
          'COMPLETED'
        );
      `, { transaction });
      console.log('✅ ENUM type created');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ ENUM type already exists');
      } else {
        throw error;
      }
    }

    // Step 2: Add lifecycle_state column if it doesn't exist
    console.log('Adding lifecycle_state column to itr_filings...');
    try {
      await sequelize.query(`
        ALTER TABLE itr_filings 
        ADD COLUMN lifecycle_state itr_lifecycle_state;
      `, { transaction });
      console.log('✅ lifecycle_state column added');
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
        console.log('✅ lifecycle_state column already exists');
      } else {
        throw error;
      }
    }

    // Step 3: Migrate existing data
    console.log('Migrating existing data from status to lifecycle_state...');
    const [filings] = await sequelize.query(`
      SELECT id, status, itr_type, json_payload
      FROM itr_filings
      WHERE lifecycle_state IS NULL
    `, { transaction });

    console.log(`Found ${filings.length} filings to migrate`);

    let migrated = 0;
    for (const filing of filings) {
      const domainState = mapStatusToDomainState(filing.status, filing);
      
      await sequelize.query(`
        UPDATE itr_filings
        SET lifecycle_state = $1::itr_lifecycle_state
        WHERE id = $2
      `, {
        bind: [domainState, filing.id],
        transaction,
      });
      
      migrated++;
      if (migrated % 100 === 0) {
        console.log(`  Migrated ${migrated}/${filings.length} filings...`);
      }
    }

    console.log(`✅ Migrated ${migrated} filings`);

    // Step 4: Set default for new rows
    console.log('Setting default value for lifecycle_state...');
    try {
      await sequelize.query(`
        ALTER TABLE itr_filings 
        ALTER COLUMN lifecycle_state SET DEFAULT 'DRAFT_INIT'::itr_lifecycle_state;
      `, { transaction });
      console.log('✅ Default value set');
    } catch (error) {
      console.log('⚠️  Could not set default (may already exist)');
    }

    // Step 5: Make NOT NULL after migration
    console.log('Making lifecycle_state NOT NULL...');
    try {
      await sequelize.query(`
        ALTER TABLE itr_filings 
        ALTER COLUMN lifecycle_state SET NOT NULL;
      `, { transaction });
      console.log('✅ lifecycle_state is now NOT NULL');
    } catch (error) {
      if (error.message.includes('contains null values')) {
        console.log('⚠️  Cannot set NOT NULL - some rows still have NULL values');
        console.log('   Run migration again after fixing NULL values');
      } else {
        throw error;
      }
    }

    // Step 6: Add comment to status column (deprecated)
    console.log('Adding deprecation comment to status column...');
    try {
      await sequelize.query(`
        COMMENT ON COLUMN itr_filings.status IS 
        'Deprecated: Use lifecycle_state instead. Will be removed in future migration.';
      `, { transaction });
      console.log('✅ Deprecation comment added to status column');
    } catch (error) {
      console.log('⚠️  Could not add comment (non-critical)');
    }

    // Step 7: Add index on lifecycle_state for performance
    console.log('Adding index on lifecycle_state...');
    try {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_itr_filings_lifecycle_state 
        ON itr_filings (lifecycle_state);
      `, { transaction });
      console.log('✅ Index created');
    } catch (error) {
      console.log('⚠️  Could not create index (may already exist)');
    }

    await transaction.commit();
    console.log('\n✅ Migration completed successfully');
    enterpriseLogger.info('Lifecycle state enum migration completed', {
      migrated,
      total: filings.length,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('\n❌ Migration failed:', error.message);
    enterpriseLogger.error('Lifecycle state enum migration failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  addLifecycleStateEnum()
    .then(() => {
      console.log('\nMigration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = addLifecycleStateEnum;

