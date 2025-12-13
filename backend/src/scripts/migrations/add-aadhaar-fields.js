// =====================================================
// MIGRATION: Add Aadhaar Linking Fields to user_profiles
// =====================================================
// Run this script to add Aadhaar linking fields to user_profiles table
// Usage: node src/scripts/migrations/add-aadhaar-fields.js

const { sequelize } = require('../../config/database');
const enterpriseLogger = require('../../utils/logger');

async function addAadhaarFields() {
  try {
    enterpriseLogger.info('Adding Aadhaar linking fields to user_profiles...');
    console.log('\n=== Adding Aadhaar Linking Fields ===\n');

    // Check if columns already exist
    const columnsResult = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user_profiles' 
      AND table_schema = 'public'
      AND column_name IN ('aadhaar_linked', 'aadhaar_verified_at', 'aadhaar_verification_data')
    `, { type: require('sequelize').QueryTypes.SELECT });
    
    const columns = Array.isArray(columnsResult) ? columnsResult : [];
    const existingColumns = columns.map(c => c.column_name || c);

    // Add aadhaar_linked field
    if (!existingColumns.includes('aadhaar_linked')) {
      console.log('Adding aadhaar_linked column...');
      await sequelize.query(`
        ALTER TABLE user_profiles 
        ADD COLUMN aadhaar_linked BOOLEAN DEFAULT FALSE NOT NULL
      `);
      console.log('✅ aadhaar_linked column added');
    } else {
      console.log('aadhaar_linked column already exists');
    }

    // Add aadhaar_verified_at field
    if (!existingColumns.includes('aadhaar_verified_at')) {
      console.log('Adding aadhaar_verified_at column...');
      await sequelize.query(`
        ALTER TABLE user_profiles 
        ADD COLUMN aadhaar_verified_at TIMESTAMP
      `);
      console.log('✅ aadhaar_verified_at column added');
    } else {
      console.log('aadhaar_verified_at column already exists');
    }

    // Add aadhaar_verification_data field
    if (!existingColumns.includes('aadhaar_verification_data')) {
      console.log('Adding aadhaar_verification_data column...');
      await sequelize.query(`
        ALTER TABLE user_profiles 
        ADD COLUMN aadhaar_verification_data JSONB DEFAULT '{}'
      `);
      console.log('✅ aadhaar_verification_data column added');
    } else {
      console.log('aadhaar_verification_data column already exists');
    }

    // Update existing records: if aadhaar_number exists, set aadhaar_linked to true
    console.log('Updating existing records...');
    await sequelize.query(`
      UPDATE user_profiles 
      SET aadhaar_linked = TRUE 
      WHERE aadhaar_number IS NOT NULL 
      AND aadhaar_linked = FALSE
    `);
    console.log('✅ Existing records updated');

    console.log('\n✅ Migration completed successfully!\n');
    enterpriseLogger.info('Aadhaar fields migration completed');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    enterpriseLogger.error('Aadhaar fields migration failed', {
      error: error.message,
      stack: error.stack,
    });
    throw error; // Re-throw instead of exiting
  }
  // Note: Don't close sequelize connection here - let caller handle it
}

// Run migration if called directly
if (require.main === module) {
  addAadhaarFields()
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

module.exports = addAadhaarFields;

