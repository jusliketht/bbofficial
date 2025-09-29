// Justification: Admin Account Creation Script - Pre-deployment Setup
// Creates a super admin account for platform testing and management
// Provides secure access to all platform features and dashboards
// Essential for initial platform setup and testing

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

async function createAdminAccount() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating Super Admin Account...');
    
    // Check if admin already exists
    const existingAdmin = await client.query(
      'SELECT user_id FROM users WHERE email = $1',
      ['admin@itrplatform.com']
    );
    
    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin account already exists');
      return;
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('Admin@123', saltRounds);
    
    // Create admin user
    const adminUser = await client.query(`
      INSERT INTO users (
        user_id,
        name,
        email,
        mobile,
        pan,
        role,
        password_hash,
        status,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        NOW(),
        NOW()
      ) RETURNING user_id, email, name, role
    `, [
      'Super Admin',
      'admin@itrplatform.com',
      '9876543210',
      'ABCDE1234F',
             'super_admin',
      hashedPassword,
      'active'
    ]);
    
    console.log('✅ Super Admin Account Created Successfully!');
    console.log('📧 Email: admin@itrplatform.com');
    console.log('🔑 Password: Admin@123');
    console.log('👤 Name:', adminUser.rows[0].name);
    console.log('🎭 Role:', adminUser.rows[0].role);
    console.log('🆔 User ID:', adminUser.rows[0].user_id);
    
    // Create CA Firm Admin account
    const caAdminPassword = await bcrypt.hash('CAAdmin@123', saltRounds);
    const caAdminUser = await client.query(`
      INSERT INTO users (
        user_id,
        name,
        email,
        mobile,
        pan,
        role,
        password_hash,
        status,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        NOW(),
        NOW()
      ) RETURNING user_id, email, name, role
    `, [
      'CA Firm Admin',
      'caadmin@itrplatform.com',
      '9876543211',
      'ABCDE1235F',
             'ca_firm_admin',
      caAdminPassword,
      'active'
    ]);
    
    console.log('\n✅ CA Firm Admin Account Created Successfully!');
    console.log('📧 Email: caadmin@itrplatform.com');
    console.log('🔑 Password: CAAdmin@123');
    console.log('👤 Name:', caAdminUser.rows[0].name);
    console.log('🎭 Role:', caAdminUser.rows[0].role);
    
    // Create End User account
    const endUserPassword = await bcrypt.hash('User@123', saltRounds);
    const endUser = await client.query(`
      INSERT INTO users (
        user_id,
        name,
        email,
        mobile,
        pan,
        role,
        password_hash,
        status,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        NOW(),
        NOW()
      ) RETURNING user_id, email, name, role
    `, [
      'Test User',
      'user@itrplatform.com',
      '9876543212',
      'ABCDE1236F',
      'user',
      endUserPassword,
      'active'
    ]);
    
    console.log('\n✅ End User Account Created Successfully!');
    console.log('📧 Email: user@itrplatform.com');
    console.log('🔑 Password: User@123');
    console.log('👤 Name:', endUser.rows[0].name);
    console.log('🎭 Role:', endUser.rows[0].role);
    
    console.log('\n🎉 All test accounts created successfully!');
    console.log('🚀 Ready for platform testing.');
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  createAdminAccount()
    .then(() => {
      console.log('✅ Admin account creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Admin account creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createAdminAccount };
