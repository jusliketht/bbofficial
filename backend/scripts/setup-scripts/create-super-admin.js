// Justification: Super Admin Creation Script - CRM Architecture Implementation
// Creates super admin account through backend for platform administration
// Essential for initial platform setup and administrative access
// Follows secure account creation patterns with proper validation

const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'burnblack_itr',
  password: process.env.DB_PASSWORD || '123456',
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

function hashPII(data) {
  if (!data) return null;
  const crypto = require('crypto');
  const salt = process.env.PII_HASH_SALT || 'itr-filing-default-salt';
  const hash = crypto.createHash('sha256');
  hash.update(data + salt);
  return hash.digest('hex');
}

async function createSuperAdmin() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating Super Admin Account...');
    
    // Super Admin credentials
    const superAdminData = {
      user_id: uuidv4(),
      name: 'Super Administrator',
      first_name: 'Super',
      last_name: 'Administrator',
      email: 'superadmin@itrplatform.com',
      mobile: '9999999999',
      pan: 'SUPER1234A',
      aadhaar: '123456789012',
      role: 'super_admin',
      password: 'SuperAdmin@2024!',
      status: 'active'
    };

    // Hash password
    const passwordHash = await bcrypt.hash(superAdminData.password, 12);
    
    // Hash PII data
    const mobileHash = hashPII(superAdminData.mobile);
    const emailHash = hashPII(superAdminData.email);

    // Check if super admin already exists
    const existingUser = await client.query(
      'SELECT user_id, email, role FROM users WHERE email = $1 OR role = $2',
      [superAdminData.email, 'super_admin']
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Super admin already exists:');
      existingUser.rows.forEach(user => {
        console.log(`   - User ID: ${user.user_id}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Role: ${user.role}`);
      });
      return;
    }

    // Insert super admin - updated for current schema
    const insertQuery = `
      INSERT INTO users (
        user_id, name, first_name, last_name, email, mobile, pan, aadhaar,
        password_hash, role, status, consent_status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING user_id, name, email, role, status, created_at
    `;

    const now = new Date();
    const values = [
      superAdminData.user_id,
      superAdminData.name,
      superAdminData.first_name,
      superAdminData.last_name,
      superAdminData.email,
      superAdminData.mobile,
      superAdminData.pan,
      superAdminData.aadhaar,
      passwordHash,
      superAdminData.role,
      superAdminData.status,
      JSON.stringify({ current: true, accepted: true, timestamp: now.toISOString(), ip: '127.0.0.1' }),
      now,
      now
    ];

    const result = await client.query(insertQuery, values);
    const createdUser = result.rows[0];

    console.log('✅ Super Admin Account Created Successfully!');
    console.log('📋 Account Details:');
    console.log(`   - User ID: ${createdUser.user_id}`);
    console.log(`   - Name: ${createdUser.name}`);
    console.log(`   - Email: ${createdUser.email}`);
    console.log(`   - Role: ${createdUser.role}`);
    console.log(`   - Status: ${createdUser.status}`);
    console.log(`   - Created: ${createdUser.created_at}`);
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log(`   - Email: ${superAdminData.email}`);
    console.log(`   - Password: ${superAdminData.password}`);
    console.log('');
    console.log('🚀 You can now login to the admin dashboard!');

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    if (error.code === '23505') {
      console.error('   - Duplicate key violation. Super admin may already exist.');
    }
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await createSuperAdmin();
  } catch (error) {
    console.error('❌ Failed to create super admin:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { createSuperAdmin };
