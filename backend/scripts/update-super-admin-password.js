const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function updateSuperAdminPassword() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Updating super admin password...');
    
    // Create new password hash
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Update admin account
    const updateResult = await client.query(`
      UPDATE users 
      SET 
        password_hash = $1,
        email_verified = true,
        is_active = true,
        updated_at = NOW()
      WHERE email = $2
      RETURNING user_id, email, name, role, email_verified, is_active
    `, [passwordHash, 'admin@burnblack.com']);
    
    if (updateResult.rows.length === 0) {
      console.log('❌ Super admin account not found!');
      return;
    }
    
    const admin = updateResult.rows[0];
    console.log('✅ Super admin account updated successfully!');
    console.log(`   - User ID: ${admin.user_id}`);
    console.log(`   - Email: ${admin.email}`);
    console.log(`   - Name: ${admin.name}`);
    console.log(`   - Role: ${admin.role}`);
    console.log(`   - Email Verified: ${admin.email_verified}`);
    console.log(`   - Is Active: ${admin.is_active}`);
    
    // Verify password
    const testPassword = 'admin123';
    const passwordMatch = await bcrypt.compare(testPassword, passwordHash);
    
    console.log('\n📋 Super Admin Login Credentials:');
    console.log('   Email: admin@burnblack.com');
    console.log('   Password: admin123');
    console.log('   Role: super_admin');
    console.log(`   Password Status: ${passwordMatch ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`   Account Status: ${admin.is_active ? '✅ Active' : '❌ Inactive'}`);
    console.log(`   Email Verified: ${admin.email_verified ? '✅ Verified' : '❌ Not Verified'}`);
    
    console.log('\n🎉 Super admin account is ready for platform access!');
    console.log('✅ You can now login with the credentials above');
    
  } catch (error) {
    console.error('❌ Error updating super admin:', error.message);
  } finally {
    client.release();
    pool.end();
  }
}

updateSuperAdminPassword();
