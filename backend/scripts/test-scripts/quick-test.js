// Quick test to verify our implementation
console.log('🚀 Testing Layer 1 Implementation...');

try {
  const db = require('./src/config/database');
  const User = require('./src/models/User_DDL');
  
  console.log('✅ Modules loaded successfully');
  
  // Test database connection
  db.query('SELECT NOW() as current_time')
    .then(result => {
      console.log('✅ Database connection successful');
      console.log(`   Current time: ${result.rows[0].current_time}`);
      
      // Test user creation with unique data
      const timestamp = Date.now();
      const testUserData = {
        pan: `TEST${timestamp.toString().slice(-6)}A`,
        mobile: `987654${timestamp.toString().slice(-4)}`,
        email: `test${timestamp}@example.com`,
        consent_timestamp: new Date(),
        consent_ip: '127.0.0.1',
        locale: 'en'
      };
      
      console.log(`   Testing with PAN: ${testUserData.pan}`);
      
      return User.create(testUserData);
    })
    .then(user => {
      console.log('✅ User creation successful');
      console.log(`   User ID: ${user.user_id}`);
      
      // Clean up
      return User.delete(user.user_id);
    })
    .then(() => {
      console.log('✅ User deletion successful');
      console.log('🎉 LAYER 1 TEST PASSED!');
      process.exit(0);
    })
    .catch(error => {
      console.log(`❌ Test failed: ${error.message}`);
      process.exit(1);
    });
    
} catch (error) {
  console.log(`❌ Module loading failed: ${error.message}`);
  process.exit(1);
}
