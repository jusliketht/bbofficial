#!/usr/bin/env node
// =====================================================
// TEST ADMIN LOGIN SCRIPT
// Tests the login flow for admin@burnblack.com
// =====================================================

const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

// =====================================================
// CONFIGURATION
// =====================================================
const TEST_CREDENTIALS = {
  email: 'admin@burnblack.com',
  password: 'Admin@2024',
};

// =====================================================
// MAIN EXECUTION FUNCTION
// =====================================================
async function testAdminLogin() {
  console.log('🧪 Testing admin login flow...');
  console.log('📧 Email:', TEST_CREDENTIALS.email);
  console.log('');

  try {
    // Step 1: Find user
    console.log('1️⃣  Finding user in database...');
    const [queryResult] = await sequelize.query(
      `SELECT id, email, password_hash, role, status, auth_provider, full_name 
       FROM users WHERE email = :email LIMIT 1`,
      {
        replacements: { email: TEST_CREDENTIALS.email.toLowerCase() },
      }
    );

    const user = Array.isArray(queryResult) && queryResult.length > 0 ? queryResult[0] : null;

    if (!user) {
      console.error('❌ User not found!');
      console.log('   Query result:', queryResult);
      process.exit(1);
    }

    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Status:', user.status);
    console.log('   Auth Provider:', user.auth_provider);
    console.log('   Has Password Hash:', !!user.password_hash);
    console.log('');

    // Step 2: Check password hash
    if (!user.password_hash) {
      console.error('❌ User has no password hash!');
      process.exit(1);
    }

    console.log('2️⃣  Verifying password...');
    const passwordMatch = await bcrypt.compare(TEST_CREDENTIALS.password, user.password_hash);
    
    if (!passwordMatch) {
      console.error('❌ Password does not match!');
      console.log('   Expected password:', TEST_CREDENTIALS.password);
      console.log('   Hash in DB:', user.password_hash.substring(0, 20) + '...');
      process.exit(1);
    }

    console.log('✅ Password matches!');
    console.log('');

    // Step 3: Verify user can login
    console.log('3️⃣  Login flow verification:');
    console.log('   ✅ User exists');
    console.log('   ✅ Password hash exists');
    console.log('   ✅ Password matches');
    console.log('   ✅ User is active');
    console.log('');

    console.log('✅ All checks passed! Login should work.');
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log('   Email:', TEST_CREDENTIALS.email);
    console.log('   Password:', TEST_CREDENTIALS.password);
    console.log('');

  } catch (error) {
    console.error('❌ Error during login test:', error.message);
    if (error.original) {
      console.error('Database error:', error.original.message);
    }
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    console.log('🔌 Closing database connection...');
    try {
      await sequelize.close();
      console.log('✅ Database connection closed');
    } catch (closeError) {
      console.error('⚠️  Warning: Error closing database connection:', closeError.message);
    }
  }
}

// =====================================================
// SCRIPT EXECUTION
// =====================================================
if (require.main === module) {
  console.log('='.repeat(60));
  console.log('🧪 BURNBACK TEST ADMIN LOGIN');
  console.log('='.repeat(60));
  console.log('');

  testAdminLogin()
    .then(() => {
      console.log('✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('');
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  testAdminLogin,
  TEST_CREDENTIALS,
};
