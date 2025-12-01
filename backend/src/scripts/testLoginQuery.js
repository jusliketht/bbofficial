#!/usr/bin/env node
// =====================================================
// TEST LOGIN QUERY SCRIPT
// Tests the exact query used in login endpoint
// =====================================================

const { sequelize } = require('../config/database');

const ADMIN_EMAIL = 'admin@burnblack.com';

async function testLoginQuery() {
  console.log('🧪 Testing login query...');
  console.log('📧 Email:', ADMIN_EMAIL);
  console.log('');

  try {
    // Test the exact query from login endpoint
    const [users] = await sequelize.query(
      `SELECT id, email, password_hash, role, status, auth_provider, full_name, 
       email_verified, phone_verified, token_version, last_login_at, onboarding_completed
       FROM users WHERE email = :email LIMIT 1`,
      {
        replacements: { email: ADMIN_EMAIL.toLowerCase() },
      }
    );

    console.log('Query result:');
    console.log('  Type:', typeof users);
    console.log('  Is Array:', Array.isArray(users));
    console.log('  Length:', users ? users.length : 0);
    console.log('');

    if (users && users.length > 0) {
      const user = users[0];
      console.log('✅ User found:');
      console.log('   ID:', user.id);
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   Has Password:', !!user.password_hash);
    } else {
      console.error('❌ User not found!');
      console.error('');
      console.error('Checking all users in database...');
      const [allUsers] = await sequelize.query(
        `SELECT id, email, role FROM users LIMIT 10`
      );
      console.log('Total users found:', allUsers ? allUsers.length : 0);
      if (allUsers && allUsers.length > 0) {
        allUsers.forEach((u, i) => {
          console.log(`  ${i + 1}. ${u.email} (${u.role})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  testLoginQuery()
    .then(() => {
      console.log('');
      console.log('✅ Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('');
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testLoginQuery };

