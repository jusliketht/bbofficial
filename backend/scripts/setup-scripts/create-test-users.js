// Create Test Users for Dashboard Testing
// Creates users with different roles for testing dashboard routing

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'burnblack_itr',
  password: process.env.DB_PASSWORD || '123456',
  port: process.env.DB_PORT || 5432,
});

function hashPII(data) {
  if (!data) return null;
  const crypto = require('crypto');
  const salt = process.env.PII_HASH_SALT || 'itr-filing-demo-salt';
  const hash = crypto.createHash('sha256');
  hash.update(data + salt);
  return hash.digest('hex');
}

const testUsers = [
  {
    name: 'CA Firm Admin',
    email: 'caadmin@test.com',
    mobile: '9999999992',
    pan: 'CATES1234A',
    role: 'ca_firm_admin',
    password: 'CaAdmin@2024!'
  },
  {
    name: 'CA Staff User',
    email: 'castaff@test.com',
    mobile: '9999999993',
    pan: 'CASTF1234A',
    role: 'CA',
    password: 'CaStaff@2024!'
  },
  {
    name: 'Regular User',
    email: 'user@test.com',
    mobile: '9999999994',
    pan: 'USERT1234A',
    role: 'user',
    password: 'User@2024!'
  }
];

async function createTestUsers() {
  const client = await pool.connect();

  try {
    console.log('🚀 Creating Test Users for Dashboard Testing...\n');

    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existing = await client.query('SELECT user_id FROM users WHERE email = $1', [userData.email]);
        if (existing.rows.length > 0) {
          console.log(`⚠️  User ${userData.email} already exists - skipping`);
          continue;
        }

        // Create user
        const passwordHash = await bcrypt.hash(userData.password, 12);
        const userId = uuidv4();

        const insertQuery = `
          INSERT INTO users (
            user_id, name, first_name, last_name, email, mobile, pan, aadhaar,
            password_hash, role, status, consent_status, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING user_id, name, email, role, status
        `;

        const now = new Date();
        const values = [
          userId,
          userData.name,
          userData.name.split(' ')[0],
          userData.name.split(' ').slice(1).join(' ') || '',
          userData.email,
          userData.mobile,
          userData.pan,
          '123456789012',
          passwordHash,
          userData.role,
          'active',
          JSON.stringify({ current: true, accepted: true, timestamp: now.toISOString(), ip: '127.0.0.1' }),
          now,
          now
        ];

        const result = await client.query(insertQuery, values);
        const createdUser = result.rows[0];

        console.log(`✅ Created ${userData.role}: ${createdUser.email}`);
        console.log(`   Password: ${userData.password}`);
        console.log('');

      } catch (error) {
        console.error(`❌ Failed to create ${userData.role}:`, error.message);
      }
    }

    console.log('🎉 Test Users Created Successfully!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('====================');
    testUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log('');
    });

    console.log('Super Admin:');
    console.log('  Email: superadmin@itrplatform.com');
    console.log('  Password: SuperAdmin@2024!');

  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createTestUsers();