/**
 * Add onboarding_completed column to users table
 * Migration script for onboarding functionality
 */

const { sequelize } = require('../config/database');

async function addOnboardingColumn() {
  console.log('============================================================');
  console.log('🔧 ADDING ONBOARDING_COMPLETED COLUMN');
  console.log('============================================================');
  console.log('');

  try {
    // Ensure database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Add the column
    console.log('📝 Adding onboarding_completed column...');
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;
    `);
    console.log('✅ Column added successfully');

    // Update existing admin users
    console.log('👑 Updating existing admin users...');
    await sequelize.query(`
      UPDATE users 
      SET onboarding_completed = TRUE 
      WHERE role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN') OR email = 'admin@burnblack.com';
    `);
    console.log('✅ Admin users updated');

    // Verify the column exists
    console.log('🔍 Verifying column exists...');
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'onboarding_completed';
    `);

    if (results.length > 0) {
      console.log('✅ Column verification successful');
      console.log('📋 Column details:', results[0]);
    } else {
      console.log('❌ Column not found after creation');
    }

    console.log('');
    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    console.log('🔌 Closing database connection...');
    await sequelize.close();
    console.log('✅ Database connection closed');
  }
}

// Run the migration
if (require.main === module) {
  addOnboardingColumn().then(() => {
    console.log('✅ Script completed successfully');
  }).catch((err) => {
    console.error('❌ Script failed:', err);
    process.exit(1);
  });
}

module.exports = addOnboardingColumn;
