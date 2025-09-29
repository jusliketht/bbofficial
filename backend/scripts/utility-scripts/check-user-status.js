const db = require('./src/config/database');

async function checkUserStatus() {
  try {
    console.log('🔍 Checking user status...');

    const result = await db.query(
      'SELECT user_id, email, status FROM users WHERE email LIKE \'test@%\''
    );

    console.log('\n📋 User Status:');
    result.rows.forEach(user => {
      console.log(`${user.email}: status=${user.status}`);
    });

  } catch (error) {
    console.error('❌ Error checking user status:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUserStatus();
