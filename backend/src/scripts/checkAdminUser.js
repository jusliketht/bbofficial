#!/usr/bin/env node
// =====================================================
// CHECK ADMIN USER SCRIPT
// Verifies admin user exists and can be found by Sequelize
// =====================================================

const { User } = require('../models');
const { sequelize } = require('../config/database');

const ADMIN_EMAIL = 'admin@burnblack.com';

async function checkAdminUser() {
  console.log('🔍 Checking admin user...');
  console.log('📧 Email:', ADMIN_EMAIL);
  console.log('');

  try {
    // Method 1: Raw SQL query
    console.log('1️⃣ Using raw SQL query...');
    const [rawUsers] = await sequelize.query(
      `SELECT id, email, password_hash, role, status, auth_provider FROM users WHERE email = :email LIMIT 1`,
      {
        replacements: { email: ADMIN_EMAIL.toLowerCase() },
      }
    );
    console.log('   Raw SQL result:', rawUsers.length > 0 ? '✅ Found' : '❌ Not found');
    if (rawUsers.length > 0) {
      console.log('   Email in DB:', rawUsers[0].email);
      console.log('   Email match:', rawUsers[0].email === ADMIN_EMAIL.toLowerCase());
    }
    console.log('');

    // Method 2: Sequelize findOne with lowercase
    console.log('2️⃣ Using Sequelize findOne (email.toLowerCase())...');
    const sequelizeUser1 = await User.findOne({
      where: {
        email: ADMIN_EMAIL.toLowerCase(),
      },
    });
    console.log('   Sequelize result:', sequelizeUser1 ? '✅ Found' : '❌ Not found');
    if (sequelizeUser1) {
      console.log('   Email:', sequelizeUser1.email);
    }
    console.log('');

    // Method 3: Sequelize findOne with original case
    console.log('3️⃣ Using Sequelize findOne (original case)...');
    const sequelizeUser2 = await User.findOne({
      where: {
        email: ADMIN_EMAIL,
      },
    });
    console.log('   Sequelize result:', sequelizeUser2 ? '✅ Found' : '❌ Not found');
    if (sequelizeUser2) {
      console.log('   Email:', sequelizeUser2.email);
    }
    console.log('');

    // Method 4: Sequelize findOne with Op.iLike (case insensitive)
    console.log('4️⃣ Using Sequelize findOne (Op.iLike - case insensitive)...');
    const { Op } = require('sequelize');
    const sequelizeUser3 = await User.findOne({
      where: {
        email: {
          [Op.iLike]: ADMIN_EMAIL,
        },
      },
    });
    console.log('   Sequelize result:', sequelizeUser3 ? '✅ Found' : '❌ Not found');
    if (sequelizeUser3) {
      console.log('   Email:', sequelizeUser3.email);
    }
    console.log('');

    // Method 5: Find all users with similar email
    console.log('5️⃣ Searching for all users with "admin" in email...');
    const allAdmins = await User.findAll({
      where: {
        email: {
          [Op.iLike]: '%admin%',
        },
      },
      attributes: ['id', 'email', 'role', 'status'],
    });
    console.log('   Found', allAdmins.length, 'users:');
    allAdmins.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.email} (${u.role})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  checkAdminUser()
    .then(() => {
      console.log('');
      console.log('✅ Check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('');
      console.error('❌ Check failed:', error.message);
      process.exit(1);
    });
}

module.exports = { checkAdminUser };

