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

// Test users that match the login panel
const TEST_USERS = [
  {
    name: 'Super Admin',
    email: 'admin@burnblack.com',
    password: 'admin123',
    role: 'super_admin',
    pan: 'ADMIN1234A',
    mobile: '9876543210'
  },
  {
    name: 'CA Firm Admin',
    email: 'caadmin@burnblack.com',
    password: 'ca123',
    role: 'ca_firm_admin',
    pan: 'CAADM1234A',
    mobile: '9876543211'
  },
  {
    name: 'CA Professional',
    email: 'ca@burnblack.com',
    password: 'ca123',
    role: 'CA',
    pan: 'CAPRO1234A',
    mobile: '9876543212'
  },
  {
    name: 'Regular User',
    email: 'user@test.com',
    password: 'user123',
    role: 'user',
    pan: 'USERT1234A',
    mobile: '9876543213'
  },
  {
    name: 'System Admin',
    email: 'system@burnblack.com',
    password: 'admin123',
    role: 'admin',
    pan: 'SYSAD1234A',
    mobile: '9876543214'
  }
];

async function createLoginPanelUsers() {
  const client = await pool.connect();

  try {
    console.log('🚀 Creating Login Panel Test Users...\n');

    for (const userData of TEST_USERS) {
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
            user_id, name, first_name, last_name, email, mobile, pan,
            password_hash, role, status, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
          passwordHash,
          userData.role,
          'active',
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

    console.log('🎉 Login Panel Users Created Successfully!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('====================');
    TEST_USERS.forEach(user => {
      console.log(`${user.role.toUpperCase()}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error creating login panel users:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createLoginPanelUsers();
