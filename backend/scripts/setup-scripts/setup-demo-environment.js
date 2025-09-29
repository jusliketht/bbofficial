// Setup Demo Environment - Clean User Table & Create Demo Super Admin
// Comprehensive setup script for testing environment
// Cleans user-related data and creates demo accounts for manual testing

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
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

function hashPII(data) {
  if (!data) return null;
  const crypto = require('crypto');
  const salt = process.env.PII_HASH_SALT || 'itr-filing-demo-salt';
  const hash = crypto.createHash('sha256');
  hash.update(data + salt);
  return hash.digest('hex');
}

async function cleanUserRelatedTables() {
  const client = await pool.connect();

  try {
    console.log('🧹 Cleaning user-related tables...');

    // Clean tables in correct order (respecting foreign keys)
    const tablesToClean = [
      'user_sessions',
      'refresh_tokens',
      'audit_events',
      'consent_logs',
      'documents',
      'filings',
      'services',
      'users'
    ];

    for (const table of tablesToClean) {
      try {
        // Use TRUNCATE instead of DELETE for better performance and to reset sequences
        await client.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE;`);
        console.log(`   ✅ Cleaned table: ${table}`);
      } catch (error) {
        console.log(`   ⚠️  Table ${table} not found or already clean:`, error.message);
      }
    }

    console.log('✅ User-related tables cleaned successfully');
    return true;

  } catch (error) {
    console.error('❌ Error cleaning tables:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function createDemoSuperAdmin() {
  const client = await pool.connect();

  try {
    console.log('🔧 Creating Demo Super Admin Account...');

    // Demo Super Admin credentials
    const superAdminData = {
      user_id: uuidv4(),
      name: 'Demo Super Administrator',
      first_name: 'Demo',
      last_name: 'SuperAdmin',
      email: 'demo.superadmin@itrplatform.com',
      mobile: '',
      pan: 'DEMO12345A',
      aadhaar: '123456789012',
      role: 'super_admin',
      password: 'DemoSuper@2024!',
      status: 'active'
    };

    // Hash password
    const passwordHash = await bcrypt.hash(superAdminData.password, 12);

    // Hash PII data
    const mobileHash = hashPII(superAdminData.mobile);
    const emailHash = hashPII(superAdminData.email);

            // Insert super admin - minimal version to debug
    const insertQuery = `
      INSERT INTO users (
        user_id, name, email, pan, password_hash, role, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING user_id, name, email, role, status, created_at
    `;

    const now = new Date();
    const values = [
      superAdminData.user_id,
      superAdminData.name,
      superAdminData.email,
      superAdminData.pan,
      passwordHash,
      superAdminData.role,
      superAdminData.status,
      now,
      now
    ];

    const result = await client.query(insertQuery, values);
    const createdUser = result.rows[0];

    console.log('✅ Demo Super Admin Account Created Successfully!');
    console.log('📋 Account Details:');
    console.log(`   - User ID: ${createdUser.user_id}`);
    console.log(`   - Name: ${createdUser.name}`);
    console.log(`   - Email: ${createdUser.email}`);
    console.log(`   - Role: ${createdUser.role}`);
    console.log(`   - Status: ${createdUser.status}`);
    console.log(`   - Created: ${createdUser.created_at}`);
    console.log('');
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log(`   - Email: ${superAdminData.email}`);
    console.log(`   - Password: ${superAdminData.password}`);
    console.log('');
    console.log('🌐 ACCESS URLS:');
    console.log('   - Frontend: http://localhost:3000');
    console.log('   - Backend API: http://localhost:5000');
    console.log('   - Admin Dashboard: http://localhost:3000/dashboard/admin');
    console.log('');
    console.log('🚀 Ready for manual testing!');

    return {
      user: createdUser,
      credentials: {
        email: superAdminData.email,
        password: superAdminData.password
      }
    };

  } catch (error) {
    console.error('❌ Error creating demo super admin:', error.message);
    if (error.code === '23505') {
      console.error('   - Duplicate key violation. Super admin may already exist.');
    }
    throw error;
  } finally {
    client.release();
  }
}

async function setupDemoEnvironment() {
  console.log('🚀 Setting up Demo Environment...');
  console.log('=====================================');

  try {
    // Step 1: Clean user-related tables
    await cleanUserRelatedTables();

    // Step 2: Create demo super admin
    const result = await createDemoSuperAdmin();

    console.log('');
    console.log('=====================================');
    console.log('🎉 DEMO ENVIRONMENT SETUP COMPLETE!');
    console.log('=====================================');

    return result;

  } catch (error) {
    console.error('❌ Demo environment setup failed:', error.message);
    throw error;
  }
}

async function main() {
  try {
    const result = await setupDemoEnvironment();

    // Store credentials for easy access
    console.log('');
    console.log('📝 CREDENTIALS SUMMARY:');
    console.log('======================');
    console.log(`Super Admin Email: ${result.credentials.email}`);
    console.log(`Super Admin Password: ${result.credentials.password}`);
    console.log('');
    console.log('💡 Next Steps:');
    console.log('1. Start the servers using: npm run start:platform');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log('3. Login with the credentials above');
    console.log('4. Test CA and User account creation from the admin dashboard');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// CLI usage
if (require.main === module) {
  main();
}

module.exports = {
  setupDemoEnvironment,
  cleanUserRelatedTables,
  createDemoSuperAdmin
};
