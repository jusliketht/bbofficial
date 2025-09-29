// Quick status check for the ITR platform
console.log('🔍 ITR Platform Status Check');
console.log('============================');

// Check environment
console.log('\n📋 Environment:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   PORT: ${process.env.PORT || 'not set'}`);

// Check database config
console.log('\n🗄️  Database Configuration:');
console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`   Port: ${process.env.DB_PORT || '5432'}`);
console.log(`   Database: ${process.env.DB_NAME || 'burnblack_itr'}`);
console.log(`   User: ${process.env.DB_USER || 'postgres'}`);

// Check if required files exist
const fs = require('fs');
const path = require('path');

console.log('\n📁 File System Check:');
const files = [
  '.env',
  'src/server.js',
  'src/config/database.js',
  'src/models/User_DDL.js',
  'package.json'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file}`);
  }
});

console.log('\n🚀 Next Steps:');
console.log('   1. Ensure PostgreSQL is running on port 5432');
console.log('   2. Create database "burnblack_itr" if it doesn\'t exist');
console.log('   3. Run DDL migrations: npm run migrate:ddl');
console.log('   4. Test database connection: node test-layer1-simple.js');
console.log('   5. Start development server: npm run dev');
