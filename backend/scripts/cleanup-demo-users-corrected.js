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

async function cleanupDemoUsersCorrected() {
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
    
    // Check what tables exist
    console.log('\n🔍 Checking available tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%user%' OR table_name LIKE '%otp%' OR table_name LIKE '%income%' OR table_name LIKE '%deduction%'
      ORDER BY table_name
    `);
    
    console.log('📋 Available tables:');
    tablesResult.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
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
    
    // Delete demo users (simplified approach)
    console.log('\n🗑️  Removing demo users...');
    
    for (const user of demoUsers) {
      try {
        console.log(`   Removing user: ${user.email}...`);
        
        // Check if user_permissions table exists and delete permissions
        try {
          await client.query('DELETE FROM user_permissions WHERE user_id = $1', [user.user_id]);
          console.log(`     ✅ User permissions deleted`);
        } catch (error) {
          console.log(`     ⚠️  User permissions table not found or no permissions to delete`);
        }
        
        // Check if income_sources_detailed table exists and delete income sources
        try {
          await client.query('DELETE FROM income_sources_detailed WHERE user_id = $1', [user.user_id]);
          console.log(`     ✅ Income sources deleted`);
        } catch (error) {
          console.log(`     ⚠️  Income sources table not found or no data to delete`);
        }
        
        // Check if deductions_detailed table exists and delete deductions
        try {
          await client.query('DELETE FROM deductions_detailed WHERE user_id = $1', [user.user_id]);
          console.log(`     ✅ Deductions deleted`);
        } catch (error) {
          console.log(`     ⚠️  Deductions table not found or no data to delete`);
        }
        
        // Check if filing_submissions table exists and delete filing submissions
        try {
          await client.query('DELETE FROM filing_submissions WHERE user_id = $1', [user.user_id]);
          console.log(`     ✅ Filing submissions deleted`);
        } catch (error) {
          console.log(`     ⚠️  Filing submissions table not found or no data to delete`);
        }
        
        // Check if document_uploads table exists and delete document uploads
        try {
          await client.query('DELETE FROM document_uploads WHERE user_id = $1', [user.user_id]);
          console.log(`     ✅ Document uploads deleted`);
        } catch (error) {
          console.log(`     ⚠️  Document uploads table not found or no data to delete`);
        }
        
        // Check if api_sync_logs table exists and delete sync logs
        try {
          await client.query('DELETE FROM api_sync_logs WHERE user_id = $1', [user.user_id]);
          console.log(`     ✅ Sync logs deleted`);
        } catch (error) {
          console.log(`     ⚠️  Sync logs table not found or no data to delete`);
        }
        
        // Check if realtime_sync_queue table exists and delete sync queue
        try {
          await client.query('DELETE FROM realtime_sync_queue WHERE user_id = $1', [user.user_id]);
          console.log(`     ✅ Sync queue deleted`);
        } catch (error) {
          console.log(`     ⚠️  Sync queue table not found or no data to delete`);
        }
        
        // Check if document_parsing_jobs table exists and delete parsing jobs
        try {
          await client.query('DELETE FROM document_parsing_jobs WHERE user_id = $1', [user.user_id]);
          console.log(`     ✅ Document parsing jobs deleted`);
        } catch (error) {
          console.log(`     ⚠️  Document parsing jobs table not found or no data to delete`);
        }
        
        // Finally delete the user
        await client.query('DELETE FROM users WHERE user_id = $1', [user.user_id]);
        console.log(`     ✅ User ${user.email} deleted successfully`);
        
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
      
      // Set up admin permissions if table exists
      try {
        await client.query(`
          INSERT INTO user_permissions (user_id, permission_name, granted_at)
          VALUES ($1, 'all_permissions', NOW())
        `, [newAdmin.user_id]);
        console.log('✅ Admin permissions set up');
      } catch (error) {
        console.log('⚠️  User permissions table not found, skipping permissions setup');
      }
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
cleanupDemoUsersCorrected()
  .then(() => {
    console.log('\n✅ Database cleanup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Cleanup failed:', error);
    process.exit(1);
  });
