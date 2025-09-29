const { Pool } = require('pg');
require('dotenv').config();

console.log('Starting database check...');
console.log('Environment:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER
});

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.query('SELECT COUNT(*) as count FROM users')
  .then(result => {
    console.log('User count:', result.rows[0].count);
    return pool.query('SELECT email, name, role FROM users LIMIT 5');
  })
  .then(result => {
    console.log('Sample users:');
    result.rows.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - ${user.role}`);
    });
    pool.end();
  })
  .catch(err => {
    console.error('Database error:', err.message);
    pool.end();
  });
