/**
 * Create Test Users Script
 * Creates all the test users needed for the login page
 */

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'burnblack_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'burnblack',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

// Test users data
const testUsers = [
    {
        email: 'admin@burnblack.com',
        password: 'password123',
        name: 'Super Administrator',
        role: 'super_admin',
        tenant_id: null
    },
    {
        email: 'platform@burnblack.com',
        password: 'password123',
        name: 'Platform Administrator',
        role: 'platform_admin',
        tenant_id: null
    },
    {
        email: 'caadmin@burnblack.com',
        password: 'password123',
        name: 'CA Firm Administrator',
        role: 'ca_firm_admin',
        tenant_id: '2856b5d5-b8e9-4190-9422-b6988885c54c'
    },
    {
        email: 'ca@burnblack.com',
        password: 'password123',
        name: 'Chartered Accountant',
        role: 'CA',
        tenant_id: '2856b5d5-b8e9-4190-9422-b6988885c54c'
    },
    {
        email: 'seniorca@burnblack.com',
        password: 'password123',
        name: 'Senior Chartered Accountant',
        role: 'senior_ca',
        tenant_id: '2856b5d5-b8e9-4190-9422-b6988885c54c'
    },
    {
        email: 'user@test.com',
        password: 'user123',
        name: 'End User',
        role: 'user',
        tenant_id: null
    },
    {
        email: 'guest@burnblack.com',
        password: 'guest123',
        name: 'Guest User',
        role: 'guest',
        tenant_id: null
    }
];

// Hash function for PII
function hashPII(data) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
}

async function createTestUsers() {
    try {
        console.log('🚀 Starting test users creation...');
        
        for (const userData of testUsers) {
            try {
                // Check if user already exists
                const emailHash = hashPII(userData.email);
                const existingUser = await pool.query(
                    'SELECT user_id FROM users WHERE email_hash = $1',
                    [emailHash]
                );
                
                if (existingUser.rows.length > 0) {
                    console.log(`✅ User ${userData.email} already exists, skipping...`);
                    continue;
                }
                
                // Create new user
                const userId = uuidv4();
                const passwordHash = await bcrypt.hash(userData.password, 12);
                const emailHashValue = hashPII(userData.email);
                
                const insertQuery = `
                    INSERT INTO users (
                        user_id, email, email_hash, name, password_hash, role, status, 
                        is_active, email_verified, created_at, last_login, tenant_id, registration_type
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    RETURNING user_id, email, name, role
                `;
                
                const values = [
                    userId,
                    userData.email,
                    emailHashValue,
                    userData.name,
                    passwordHash,
                    userData.role,
                    'active',
                    true,
                    true,
                    new Date(),
                    null,
                    userData.tenant_id,
                    'test'
                ];
                
                const result = await pool.query(insertQuery, values);
                const newUser = result.rows[0];
                
                console.log(`✅ Created user: ${newUser.email} (${newUser.role})`);
                
            } catch (error) {
                console.error(`❌ Failed to create user ${userData.email}:`, error.message);
            }
        }
        
        console.log('🎉 Test users creation completed!');
        
    } catch (error) {
        console.error('❌ Error creating test users:', error);
    } finally {
        await pool.end();
    }
}

// Run the script
if (require.main === module) {
    createTestUsers();
}

module.exports = { createTestUsers };
