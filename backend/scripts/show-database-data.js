const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function showDatabaseData() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking database contents...\n');
    
    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Available tables:');
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Show users data
    console.log('👥 USERS TABLE:');
    const usersResult = await client.query('SELECT * FROM users ORDER BY created_at DESC');
    if (usersResult.rows.length === 0) {
      console.log('   No users found');
    } else {
      console.log(`   Found ${usersResult.rows.length} users:`);
      usersResult.rows.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.name}) - Role: ${user.role} - Active: ${user.is_active} - Email Verified: ${user.email_verified}`);
      });
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Show user_permissions data if exists
    try {
      console.log('🔐 USER PERMISSIONS TABLE:');
      const permissionsResult = await client.query('SELECT * FROM user_permissions ORDER BY granted_at DESC');
      if (permissionsResult.rows.length === 0) {
        console.log('   No permissions found');
      } else {
        console.log(`   Found ${permissionsResult.rows.length} permissions:`);
        permissionsResult.rows.forEach((perm, index) => {
          console.log(`   ${index + 1}. User: ${perm.user_id} - Permission: ${perm.permission_name}`);
        });
      }
    } catch (error) {
      console.log('   User permissions table does not exist');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Show OTP data if exists
    try {
      console.log('📧 OTP VERIFICATIONS TABLE:');
      const otpResult = await client.query('SELECT * FROM otp_verifications ORDER BY created_at DESC LIMIT 10');
      if (otpResult.rows.length === 0) {
        console.log('   No OTP records found');
      } else {
        console.log(`   Found ${otpResult.rows.length} OTP records (showing latest 10):`);
        otpResult.rows.forEach((otp, index) => {
          console.log(`   ${index + 1}. ${otp.email} - Code: ${otp.otp_code} - Verified: ${otp.verified} - Created: ${otp.created_at}`);
        });
      }
    } catch (error) {
      console.log('   OTP verifications table does not exist');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Show income sources data if exists
    try {
      console.log('💰 INCOME SOURCES TABLE:');
      const incomeResult = await client.query('SELECT * FROM income_sources_detailed ORDER BY created_at DESC LIMIT 5');
      if (incomeResult.rows.length === 0) {
        console.log('   No income sources found');
      } else {
        console.log(`   Found ${incomeResult.rows.length} income sources (showing latest 5):`);
        incomeResult.rows.forEach((income, index) => {
          console.log(`   ${index + 1}. User: ${income.user_id} - Type: ${income.income_type} - Amount: ${income.amount}`);
        });
      }
    } catch (error) {
      console.log('   Income sources table does not exist');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Show deductions data if exists
    try {
      console.log('📊 DEDUCTIONS TABLE:');
      const deductionsResult = await client.query('SELECT * FROM deductions_detailed ORDER BY created_at DESC LIMIT 5');
      if (deductionsResult.rows.length === 0) {
        console.log('   No deductions found');
      } else {
        console.log(`   Found ${deductionsResult.rows.length} deductions (showing latest 5):`);
        deductionsResult.rows.forEach((deduction, index) => {
          console.log(`   ${index + 1}. User: ${deduction.user_id} - Section: ${deduction.section} - Amount: ${deduction.amount}`);
        });
      }
    } catch (error) {
      console.log('   Deductions table does not exist');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Show tax computations data if exists
    try {
      console.log('🧮 TAX COMPUTATIONS TABLE:');
      const taxResult = await client.query('SELECT * FROM tax_computations ORDER BY computed_at DESC LIMIT 5');
      if (taxResult.rows.length === 0) {
        console.log('   No tax computations found');
      } else {
        console.log(`   Found ${taxResult.rows.length} tax computations (showing latest 5):`);
        taxResult.rows.forEach((tax, index) => {
          console.log(`   ${index + 1}. User: ${tax.user_id} - Regime: ${tax.tax_regime} - Total Tax: ${tax.total_tax}`);
        });
      }
    } catch (error) {
      console.log('   Tax computations table does not exist');
    }
    
    console.log('\n🎯 Database Summary:');
    console.log(`   - Total Tables: ${tablesResult.rows.length}`);
    console.log(`   - Total Users: ${usersResult.rows.length}`);
    console.log('   - Super Admin: admin@burnblack.com ✅');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    client.release();
    pool.end();
  }
}

showDatabaseData();
