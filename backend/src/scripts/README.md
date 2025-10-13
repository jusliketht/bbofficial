# 🔧 Admin Reset Script

## Overview

The `resetAndCreateAdmin.js` script is a utility tool that completely resets the users table and creates a single SUPER_ADMIN user. This is useful for development, testing, or emergency admin account recovery.

## ⚠️ **WARNING**

This script will **DELETE ALL USERS** from the database. Use with extreme caution and only in development or emergency situations.

## Usage

### Method 1: Direct Node Execution
```bash
cd backend
node src/scripts/resetAndCreateAdmin.js
```

### Method 2: NPM Script
```bash
cd backend
npm run admin:reset
```

## Configuration

Before running the script, edit the configuration section at the top of `resetAndCreateAdmin.js`:

```javascript
const ADMIN_CONFIG = {
  email: 'admin@burnblack.com',        // Admin email
  password: 'admin123!@#',             // Admin password (CHANGE THIS!)
  fullName: 'Super Admin'              // Admin display name
};
```

## What the Script Does

1. **Deletes All Users**: Uses `User.destroy()` with `truncate: true, cascade: true`
2. **Hashes Password**: Uses bcrypt with configurable salt rounds
3. **Creates Super Admin**: Creates a new user with SUPER_ADMIN role
4. **Clean Shutdown**: Closes database connection properly

## Default Admin Credentials

After running the script, you can login with:

- **Email**: `admin@burnblack.com`
- **Password**: `admin123!@#`

⚠️ **IMPORTANT**: Change the password immediately after first login!

## Output Example

```
============================================================
🔧 BURNBACK ADMIN RESET UTILITY
============================================================

🚀 Starting admin reset and creation process...
📧 Admin Email: admin@burnblack.com
👤 Admin Name: Super Admin

🗑️  Deleting all users...
✅ All users deleted successfully

🔐 Hashing admin password...
✅ Password hashed successfully

👑 Creating super admin user...
✅ Super admin created successfully!

📋 Admin Details:
   ID: 1
   Email: admin@burnblack.com
   Name: Super Admin
   Role: SUPER_ADMIN
   Status: active
   Created: 2025-10-11T22:36:45.000Z

🎉 Process completed successfully!

🔑 Login Credentials:
   Email: admin@burnblack.com
   Password: admin123!@#

⚠️  IMPORTANT: Change the admin password after first login!

🔌 Closing database connection...
✅ Database connection closed
👋 Script execution completed

✅ Script completed successfully
```

## Security Considerations

1. **Change Default Password**: Always change the default password after first login
2. **Environment Variables**: Consider using environment variables for sensitive data
3. **Access Control**: Ensure only authorized personnel can run this script
4. **Backup**: Take database backups before running in production

## Troubleshooting

### Common Issues

1. **Database Connection Error**: Ensure the database is running and accessible
2. **Permission Error**: Make sure the script has proper database permissions
3. **Module Not Found**: Ensure you're running from the correct directory

### Error Handling

The script includes comprehensive error handling:
- Validates configuration before execution
- Catches and reports errors with stack traces
- Ensures database connection is closed in finally block
- Exits with proper status codes

## Development Notes

- Uses bcrypt for password hashing
- Imports User model and sequelize from ../models
- Includes proper error handling and logging
- Can be imported as a module for use in other scripts
- Follows Node.js best practices for CLI scripts
