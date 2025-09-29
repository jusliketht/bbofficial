const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function createSuperAdmin() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking for existing super admin account...');
    
    // Check if admin@burnblack.com already exists
    const existingAdminResult = await client.query(`
      SELECT user_id, email, name, role, email_verified, is_active, created_at
      FROM users 
      WHERE email = $1
    `, ['admin@burnblack.com']);
    
    if (existingAdminResult.rows.length > 0) {
      const existingAdmin = existingAdminResult.rows[0];
      console.log('✅ Super admin account already exists:');
      console.log(`   - Email: ${existingAdmin.email}`);
      console.log(`   - Name: ${existingAdmin.name}`);
      console.log(`   - Role: ${existingAdmin.role}`);
      console.log(`   - Email Verified: ${existingAdmin.email_verified}`);
      console.log(`   - Is Active: ${existingAdmin.is_active}`);
      console.log(`   - Created: ${existingAdmin.created_at}`);
      
      // Check if user_permissions table exists and set up permissions
      try {
        const permissionsResult = await client.query(`
          SELECT permission_name FROM user_permissions WHERE user_id = $1
        `, [existingAdmin.user_id]);
        
        if (permissionsResult.rows.length === 0) {
          console.log('🔧 Setting up admin permissions...');
          await client.query(`
            INSERT INTO user_permissions (user_id, permission_name, granted_at)
            VALUES ($1, 'all_permissions', NOW())
          `, [existingAdmin.user_id]);
          console.log('✅ Admin permissions set up');
        } else {
          console.log('✅ Admin permissions already exist');
        }
      } catch (error) {
        console.log('⚠️  User permissions table not found, skipping permissions setup');
      }
      
      return existingAdmin;
    }
    
    console.log('🔧 Creating new super admin account...');
    
    // Create password hash
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create super admin user
    const adminResult = await client.query(`
      INSERT INTO users (
        user_id, 
        email, 
        password_hash, 
        name, 
        role, 
        email_verified, 
        is_active, 
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
        NOW(), 
        NOW()
      ) RETURNING user_id, email, name, role, created_at
    `, [
      'admin@burnblack.com',
      passwordHash,
      'Super Administrator',
      'super_admin',
      true,
      true
    ]);
    
    const newAdmin = adminResult.rows[0];
    console.log('✅ Super admin account created successfully!');
    console.log(`   - User ID: ${newAdmin.user_id}`);
    console.log(`   - Email: ${newAdmin.email}`);
    console.log(`   - Name: ${newAdmin.name}`);
    console.log(`   - Role: ${newAdmin.role}`);
    console.log(`   - Created: ${newAdmin.created_at}`);
    
    // Set up admin permissions if user_permissions table exists
    try {
      console.log('🔧 Setting up admin permissions...');
      await client.query(`
        INSERT INTO user_permissions (user_id, permission_name, granted_at)
        VALUES ($1, 'all_permissions', NOW())
      `, [newAdmin.user_id]);
      console.log('✅ Admin permissions set up');
    } catch (error) {
      console.log('⚠️  User permissions table not found, skipping permissions setup');
    }
    
    console.log('\n📋 Super Admin Login Credentials:');
    console.log('   Email: admin@burnblack.com');
    console.log('   Password: admin123');
    console.log('   Role: super_admin');
    console.log('   Status: Active');
    
    console.log('\n🔐 Security Notes:');
    console.log('   - Change the default password after first login');
    console.log('   - Enable two-factor authentication if available');
    console.log('   - Use strong, unique passwords');
    console.log('   - Regularly review admin access logs');
    
    return newAdmin;
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run the script
createSuperAdmin()
  .then((admin) => {
    console.log('\n🎉 Super admin account setup completed successfully!');
    console.log('✅ Ready for platform access');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Super admin creation failed:', error);
    process.exit(1);
  });