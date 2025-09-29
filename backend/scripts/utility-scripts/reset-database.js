const db = require('./src/config/database');

async function resetDatabase() {
  try {
    console.log('🗑️  Resetting database...');
    
    // Delete all users
    const deleteUsers = await db.query('DELETE FROM users');
    console.log(`✅ Deleted ${deleteUsers.rowCount} users`);
    
    // Reset sequences if they exist
    try {
      await db.query('ALTER SEQUENCE users_user_id_seq RESTART WITH 1');
      console.log('✅ Reset user_id sequence');
    } catch (error) {
      console.log('ℹ️  Sequence reset not needed');
    }
    
    console.log('✅ Database reset completed successfully!');
    console.log('📋 Ready for fresh user registration');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
  }
}

resetDatabase();
