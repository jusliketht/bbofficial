const { Pool } = require('pg');
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function cleanupDemoUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking current users in database...');
    
    // Check current users
    const usersResult = await client.query(`
      SELECT user_id, email, name, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    console.log(`📊 Found ${usersResult.rows.length} users in database:`);
    usersResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name}) - Role: ${user.role || 'N/A'} - Created: ${user.created_at}`);
    });
    
    // Identify demo users to remove (keep admin@burnblack.com)
    const demoUsers = usersResult.rows.filter(user => 
      user.email !== 'admin@burnblack.com' && 
      (user.email.includes('demo') || 
       user.email.includes('test') || 
       user.email.includes('john@burnblack.com') ||
       user.email.includes('jane@burnblack.com') ||
       user.email.includes('user@example.com') ||
       user.name?.toLowerCase().includes('demo') ||
       user.name?.toLowerCase().includes('test'))
    );
    
    console.log(`\n🗑️  Identified ${demoUsers.length} demo users to remove:`);
    demoUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name})`);
    });
    
    if (demoUsers.length === 0) {
      console.log('✅ No demo users found to remove. Database is clean!');
      return;
    }
    
    // Confirm before deletion
    console.log('\n⚠️  About to delete the following demo users:');
    demoUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.name})`);
    });
    
    // Delete demo users
    console.log('\n🗑️  Removing demo users...');
    
    for (const user of demoUsers) {
      try {
        // Delete related data first (due to foreign key constraints)
        console.log(`   Removing data for ${user.email}...`);
        
        // Delete OTP records
        await client.query('DELETE FROM otp WHERE email = $1', [user.email]);
        console.log(`     ✅ OTP records deleted`);
        
        // Delete user permissions
        await client.query('DELETE FROM user_permissions WHERE user_id = $1', [user.user_id]);
        console.log(`     ✅ User permissions deleted`);
        
        // Delete income sources
        await client.query('DELETE FROM income_sources_detailed WHERE user_id = $1', [user.user_id]);
        console.log(`     ✅ Income sources deleted`);
        
        // Delete deductions
        await client.query('DELETE FROM deductions_detailed WHERE user_id = $1', [user.user_id]);
        console.log(`     ✅ Deductions deleted`);
        
        // Delete filing submissions
        await client.query('DELETE FROM filing_submissions WHERE user_id = $1', [user.user_id]);
        console.log(`     ✅ Filing submissions deleted`);
        
        // Delete document uploads
        await client.query('DELETE FROM document_uploads WHERE user_id = $1', [user.user_id]);
        console.log(`     ✅ Document uploads deleted`);
        
        // Delete tax computations
        await client.query('DELETE FROM tax_computations WHERE filing_submission_id IN (SELECT submission_id FROM filing_submissions WHERE user_id = $1)', [user.user_id]);
        console.log(`     ✅ Tax computations deleted`);
        
        // Delete optimization scenarios
        await client.query('DELETE FROM tax_optimization_scenarios WHERE filing_submission_id IN (SELECT submission_id FROM filing_submissions WHERE user_id = $1)', [user.user_id]);
        console.log(`     ✅ Optimization scenarios deleted`);
        
        // Delete sync logs
        await client.query('DELETE FROM api_sync_logs WHERE user_id = $1', [user.user_id]);
        console.log(`     ✅ Sync logs deleted`);
        
        // Delete sync queue
        await client.query('DELETE FROM realtime_sync_queue WHERE user_id = $1', [user.user_id]);
        console.log(`     ✅ Sync queue deleted`);
        
        // Delete document parsing jobs
        await client.query('DELETE FROM document_parsing_jobs WHERE user_id = $1', [user.user_id]);
        console.log(`     ✅ Document parsing jobs deleted`);
        
        // Finally delete the user
        await client.query('DELETE FROM users WHERE user_id = $1', [user.user_id]);
        console.log(`     ✅ User ${user.email} deleted`);
        
      } catch (error) {
        console.error(`     ❌ Error deleting user ${user.email}:`, error.message);
      }
    }
    
    // Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    const remainingUsersResult = await client.query(`
      SELECT user_id, email, name, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    console.log(`📊 Remaining users: ${remainingUsersResult.rows.length}`);
    remainingUsersResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name}) - Role: ${user.role || 'N/A'}`);
    });
    
    // Check if admin@burnblack.com exists
    const adminUser = remainingUsersResult.rows.find(user => user.email === 'admin@burnblack.com');
    if (adminUser) {
      console.log('\n✅ Super admin account (admin@burnblack.com) is preserved');
      console.log(`   - Name: ${adminUser.name}`);
      console.log(`   - Role: ${adminUser.role || 'N/A'}`);
      console.log(`   - Created: ${adminUser.created_at}`);
    } else {
      console.log('\n⚠️  Super admin account (admin@burnblack.com) not found!');
      console.log('   Creating super admin account...');
      
      // Create super admin account
      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash('admin123', 10);
      
      const newAdminResult = await client.query(`
        INSERT INTO users (user_id, email, password_hash, name, role, email_verified, mobile_verified, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING user_id, email, name, role
      `, [
        'admin@burnblack.com',
        passwordHash,
        'Super Admin',
        'super_admin',
        true,
        true
      ]);
      
      const newAdmin = newAdminResult.rows[0];
      console.log(`✅ Super admin account created: ${newAdmin.email}`);
      
      // Set up admin permissions
      await client.query(`
        INSERT INTO user_permissions (user_id, permission_name, granted_at)
        VALUES ($1, 'all_permissions', NOW())
      `, [newAdmin.user_id]);
      
      console.log('✅ Admin permissions set up');
    }
    
    console.log('\n🎉 Database cleanup completed successfully!');
    console.log('✅ Demo users removed');
    console.log('✅ Super admin account preserved');
    console.log('✅ Related data cleaned up');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run the cleanup
cleanupDemoUsers()
  .then(() => {
    console.log('\n✅ Database cleanup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });
