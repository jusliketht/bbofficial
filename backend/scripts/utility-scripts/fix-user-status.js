const db = require('./src/config/database');

async function fixUserStatus() {
  try {
    console.log('🔧 Fixing user status...');
    
    // Update admin user status to active
    const result = await db.query(`
      UPDATE users 
      SET status = 'active', updated_at = NOW()
      WHERE email = $1
      RETURNING email, status, role
    `, ['admin@itrplatform.com']);
    
    if (result.rows.length > 0) {
      console.log('✅ Admin user status updated:', result.rows[0]);
    } else {
      console.log('❌ Admin user not found');
    }
    
    // Check all users
    const allUsers = await db.query('SELECT email, status, role FROM users');
    console.log('\n📋 All users:');
    allUsers.rows.forEach(user => {
      console.log(`- ${user.email}: ${user.status} (${user.role})`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing user status:', error.message);
  }
}

fixUserStatus();
