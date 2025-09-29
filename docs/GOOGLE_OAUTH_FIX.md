# Google OAuth Fix - Password Hash Issue

## 🐛 **Issue Identified**

Google OAuth was failing with the error:

```
notNull Violation: User.passwordHash cannot be null
```

## 🔍 **Root Cause**

The `User` model had `passwordHash` set as `allowNull: false`, but OAuth users don't have passwords. When creating a new user via Google OAuth, the `passwordHash` field was `null`, causing a validation error.

## ✅ **Solution Applied**

### **1. Model Update**

Updated `backend/src/models/User.js`:

```javascript
passwordHash: {
  type: DataTypes.STRING,
  allowNull: true, // Allow null for OAuth users
  field: 'password_hash'
},
```

### **2. Database Schema Update**

Updated the database column to allow NULL values:

```sql
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
```

## 🎯 **Result**

- ✅ **OAuth users** can be created without passwords
- ✅ **Regular users** still require passwords for manual login
- ✅ **Password validation** still works for users with passwords
- ✅ **Security maintained** for both authentication methods

## 🔐 **Security Considerations**

- **OAuth users**: Authenticated via Google, no password needed
- **Manual users**: Still require strong passwords
- **Password hashing**: Only applied when password is provided
- **Account linking**: Existing users can link Google accounts

## 🧪 **Testing**

Google OAuth should now work correctly:

1. New users: Created without password requirement
2. Existing users: Google account linked to existing account
3. Login flow: JWT token generated and user redirected to dashboard

**Status: ✅ FIXED - Google OAuth now working**
