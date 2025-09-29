# ENTERPRISE AUTHENTICATION SPECIFICATION

## 🎯 **EXECUTIVE SUMMARY**

This document defines the enterprise-grade authentication system for BurnBlack Platform, implementing JWT + refresh token architecture with role-based access control (RBAC), audit logging, and session management.

---

## 🏗️ **AUTHENTICATION ARCHITECTURE**

### **Token Strategy**

- **Access Token (JWT)**: Short-lived (10-15 minutes), stored in memory
- **Refresh Token**: Long-lived (7 days), stored in HttpOnly Secure cookie
- **Token Rotation**: New refresh token issued on each refresh
- **Revocation**: Server-side refresh token store for immediate invalidation

### **Security Headers**

```http
Cache-Control: no-store
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict
```

---

## 🔐 **RBAC STRUCTURE**

### **Role Hierarchy**

```
SUPER_ADMIN
├── Platform oversight, CA firm approvals, system configuration
├── Dashboard: /admin/super

PLATFORM_ADMIN
├── Platform operations, user oversight, compliance monitoring
├── Dashboard: /admin/platform

CA_FIRM_ADMIN
├── Firm management, staff assignment, client portfolio
├── Dashboard: /firm/dashboard

CA (Chartered Accountant)
├── Client ITR filing, document review, tax computation
├── Dashboard: /ca/clients

END_USER
├── Self-filing, family management, document upload
├── Dashboard: /dashboard
```

### **Permission Mapping**

```javascript
const PERMISSIONS = {
  SUPER_ADMIN: ['*'], // All permissions
  PLATFORM_ADMIN: ['manage_users', 'view_analytics', 'handle_compliance'],
  CA_FIRM_ADMIN: ['manage_firm_staff', 'assign_clients', 'view_firm_metrics'],
  CA: ['file_itr', 'review_documents', 'compute_tax', 'e_sign'],
  END_USER: ['file_self_itr', 'manage_family', 'upload_documents'],
};
```

---

## 🔄 **AUTHENTICATION FLOW**

### **Login Process**

1. **User Action**: Click role button or manual login
2. **Credential Validation**: Server validates email/password
3. **Token Generation**: Issue access JWT + refresh cookie
4. **Audit Logging**: Record login event with IP, user-agent
5. **Role Routing**: Redirect to role-specific dashboard
6. **Session Storage**: Store refresh token in `user_sessions` table

### **Token Refresh Flow**

```javascript
// Axios interceptor handles 401 responses
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await authService.refresh(); // Uses HttpOnly cookie
        return axios.request(error.config); // Retry original request
      } catch (refreshError) {
        authService.logout(); // Force re-login
        throw refreshError;
      }
    }
    throw error;
  }
);
```

---

## 🛡️ **SECURITY MEASURES**

### **Password Security**

- **Hashing**: bcrypt with 12 rounds
- **Validation**: Minimum 8 characters, complexity rules
- **Rate Limiting**: 5 attempts per 15 minutes per IP

### **Session Management**

- **Idle Timeout**: 30 minutes (configurable)
- **Absolute Expiry**: 7 days maximum
- **Concurrent Sessions**: Limit 3 per user (configurable)
- **Session Revocation**: Support "logout everywhere" functionality

### **Audit Requirements**

```javascript
// Audit log structure
{
  user_id: string,
  timestamp: ISO8601,
  action: 'login_success' | 'login_fail' | 'logout' | 'token_refresh',
  ip_address: string,
  user_agent: string,
  session_id: string,
  metadata: object
}
```

---

## 📱 **FRONTEND IMPLEMENTATION**

### **Consolidated Login Component**

```javascript
// Single Login.jsx component with variants
<Login
  variant="role-based" // or "manual"
  defaultRole="END_USER"
  showOAuth={true}
  onSuccess={(user, role) => navigate(`/dashboard/${role.toLowerCase()}`)}
/>
```

### **AuthContext Structure**

```javascript
const AuthContext = {
  // State
  user: User | null,
  isAuthenticated: boolean,
  loading: boolean,

  // Actions
  login: (email: string, password: string) => Promise<AuthResponse>,
  logout: () => Promise<void>,
  refresh: () => Promise<void>,

  // Session Management
  extendSession: () => Promise<void>,
  revokeAllSessions: () => Promise<void>
};
```

---

## 🔧 **BACKEND ENDPOINTS**

### **Authentication Routes**

```javascript
POST / auth / login;
POST / auth / refresh;
POST / auth / logout;
POST / auth / revoke - all;
GET / auth / sessions;
POST / auth / extend - session;
```

### **Middleware Implementation**

```javascript
// Role-based authorization middleware
const authorize = (permissions) => (req, res, next) => {
  const userPermissions = PERMISSIONS[req.user.role];
  const hasPermission = permissions.some(
    (p) => userPermissions.includes('*') || userPermissions.includes(p)
  );

  if (!hasPermission) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  next();
};
```

---

## 📊 **DATABASE SCHEMA**

### **User Sessions Table**

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  refresh_token_hash VARCHAR(255),
  device_info JSONB,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_revoked BOOLEAN DEFAULT FALSE
);
```

### **Audit Logs Table**

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50),
  timestamp TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  session_id UUID,
  metadata JSONB,
  success BOOLEAN
);
```

---

## ✅ **IMPLEMENTATION CHECKLIST**

### **Phase 1: Core Authentication**

- [ ] Consolidate login components into single `Login.jsx`
- [ ] Implement JWT + refresh token architecture
- [ ] Add HttpOnly cookie handling for refresh tokens
- [ ] Create unified AuthContext with proper error handling
- [ ] Add axios interceptor for automatic token refresh

### **Phase 2: Security & Session Management**

- [ ] Implement session timeout and extension
- [ ] Add concurrent session limiting
- [ ] Create "logout everywhere" functionality
- [ ] Add rate limiting for auth endpoints
- [ ] Implement cache-control headers

### **Phase 3: Audit & Compliance**

- [ ] Create audit logging system
- [ ] Add admin audit trail viewer
- [ ] Implement session monitoring dashboard
- [ ] Add security event notifications
- [ ] Create compliance reporting tools

### **Phase 4: Enterprise Features**

- [ ] Add MFA support (OTP via email/SMS)
- [ ] Implement SSO integration points
- [ ] Add device fingerprinting
- [ ] Create security policy enforcement
- [ ] Add breach detection and response

---

## 🚀 **DEPLOYMENT CONSIDERATIONS**

### **Environment Variables**

```bash
JWT_SECRET=<strong-secret-key>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
SESSION_TIMEOUT=30m
MAX_CONCURRENT_SESSIONS=3
AUDIT_RETENTION_DAYS=365
```

### **Redis Configuration** (Optional)

```javascript
// For session storage and rate limiting
const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  db: 0, // Auth sessions
};
```

---

## 📈 **MONITORING & METRICS**

### **Key Metrics**

- Login success/failure rates
- Token refresh frequency
- Session duration analytics
- Concurrent user counts
- Security event frequency

### **Alerts**

- Multiple failed login attempts
- Unusual session patterns
- Token refresh failures
- Concurrent session violations

---

## 🔄 **MIGRATION STRATEGY**

### **From Current State**

1. **Backup**: Export current user sessions and tokens
2. **Deploy**: New auth system with backward compatibility
3. **Migrate**: Gradually move users to new token system
4. **Cleanup**: Remove old authentication code
5. **Verify**: Audit trail and security testing

### **Rollback Plan**

- Keep old auth endpoints active during migration
- Feature flag for new vs old auth system
- Database rollback scripts for session tables
- User communication plan for any disruptions
