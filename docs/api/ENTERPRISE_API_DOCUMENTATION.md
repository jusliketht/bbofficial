# ENTERPRISE API DOCUMENTATION

## 🏢 **OVERVIEW**

The Burnblack ITR Platform provides a comprehensive REST API for managing tax filing, user authentication, and enterprise operations. This API follows enterprise-grade standards with consistent responses, proper error handling, and security measures.

**Base URL**: `http://localhost:3002/api`  
**API Version**: `v1`  
**Content Type**: `application/json`

---

## 🔐 **AUTHENTICATION**

### **Authentication Methods**

- **JWT Tokens**: Access tokens for API requests
- **Refresh Tokens**: For token renewal
- **Rate Limiting**: 5 attempts per 15 minutes for auth endpoints

### **Headers Required**

```http
Authorization: Bearer <access_token>
Content-Type: application/json
API-Version: v1
X-Request-ID: <optional_request_id>
```

---

## 📋 **API ENDPOINTS**

### **Authentication Endpoints**

#### **POST /auth/login**

Authenticate user and receive tokens.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "deviceInfo": {
    "platform": "web",
    "deviceId": "device-123",
    "appVersion": "1.0.0"
  }
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "user": {
      "id": 1,
      "user_id": "uuid-string",
      "email": "user@example.com",
      "name": "John Doe",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "status": "active",
      "permissions": [],
      "resources": [],
      "isActive": true,
      "emailVerified": true,
      "phoneVerified": false,
      "lastLogin": "2024-09-20T20:30:00.000Z",
      "createdAt": "2024-09-20T10:00:00.000Z",
      "updatedAt": "2024-09-20T20:30:00.000Z"
    }
  },
  "timestamp": "2024-09-20T20:30:00.000Z"
}
```

**Error Response (401):**

```json
{
  "success": false,
  "error": "Invalid credentials",
  "code": "INVALID_CREDENTIALS",
  "timestamp": "2024-09-20T20:30:00.000Z"
}
```

#### **POST /auth/register**

Register a new user.

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "user",
  "deviceInfo": {
    "platform": "web"
  }
}
```

#### **GET /auth/profile**

Get current user profile.

**Headers Required:**

```http
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "user_id": "uuid-string",
      "email": "user@example.com",
      "name": "John Doe",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "status": "active",
      "permissions": [],
      "resources": [],
      "isActive": true,
      "emailVerified": true,
      "phoneVerified": false,
      "lastLogin": "2024-09-20T20:30:00.000Z",
      "createdAt": "2024-09-20T10:00:00.000Z"
    }
  },
  "timestamp": "2024-09-20T20:30:00.000Z"
}
```

#### **PUT /auth/profile**

Update user profile.

**Request Body:**

```json
{
  "name": "John Smith",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

#### **POST /auth/refresh**

Refresh access token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### **POST /auth/logout**

Logout user and invalidate session.

**Request Body:**

```json
{
  "deviceId": "device-123"
}
```

---

## 📊 **ERROR CODES**

### **Authentication Errors**

- `NO_TOKEN`: Access token required
- `INVALID_TOKEN_FORMAT`: Invalid token format
- `INVALID_TOKEN`: Invalid or expired token
- `TOKEN_EXPIRED`: Token has expired
- `USER_NOT_FOUND`: User not found
- `ACCOUNT_INACTIVE`: Account is inactive
- `INVALID_CREDENTIALS`: Invalid email/password
- `AUTH_REQUIRED`: Authentication required
- `INSUFFICIENT_PERMISSIONS`: Insufficient permissions

### **Validation Errors**

- `VALIDATION_ERROR`: Input validation failed
- `NO_FIELDS_TO_UPDATE`: No fields provided for update

### **Rate Limiting Errors**

- `RATE_LIMIT_EXCEEDED`: Too many requests
- `AUTH_RATE_LIMIT_EXCEEDED`: Too many auth attempts
- `PASSWORD_RESET_RATE_LIMIT_EXCEEDED`: Too many password reset attempts

### **System Errors**

- `REGISTRATION_ERROR`: Registration failed
- `LOGIN_ERROR`: Login failed
- `PROFILE_FETCH_ERROR`: Failed to fetch profile
- `PROFILE_UPDATE_ERROR`: Failed to update profile
- `LOGOUT_ERROR`: Logout failed
- `REFRESH_TOKEN_REQUIRED`: Refresh token required
- `INVALID_REFRESH_TOKEN`: Invalid refresh token
- `AUTH_SERVICE_ERROR`: Authentication service error

---

## 🔒 **SECURITY FEATURES**

### **Rate Limiting**

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Password Reset**: 3 attempts per hour

### **Security Headers**

- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

### **Input Validation**

- Email format validation
- Password strength requirements
- Phone number validation
- Role validation
- Input sanitization

### **CORS Configuration**

- Allowed origins: `http://localhost:3000`, `http://localhost:3001`
- Credentials: enabled
- Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS

---

## 📱 **MOBILE SUPPORT**

### **Device Management**

- Device registration and tracking
- Session management per device
- Platform-specific handling (iOS, Android, Web)

### **Session Storage**

- Automatic session creation on login
- Session refresh on token renewal
- Session invalidation on logout

---

## 🧪 **TESTING**

### **Test Credentials**

```
Super Admin:     admin@burnblack.com / admin123
Platform Admin: platform@burnblack.com / admin123
CA Firm Admin:  ca@burnblack.com / admin123
Chartered CA:   chartered@burnblack.com / admin123
End User:       user@burnblack.com / admin123
```

### **Health Check**

```http
GET /health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-09-20T20:30:00.000Z",
  "uptime": 3600,
  "platform": "web",
  "version": "1.0.0"
}
```

---

## 📈 **PERFORMANCE**

### **Response Times**

- Authentication: < 200ms
- Profile operations: < 100ms
- Token refresh: < 50ms

### **Monitoring**

- Request/response logging
- Error tracking
- Performance metrics
- Security event logging

---

## 🔄 **VERSIONING**

### **API Versioning**

- Current version: `v1`
- Version header: `API-Version: v1`
- Backward compatibility maintained

### **Deprecation Policy**

- 6-month notice for breaking changes
- Graceful migration support
- Legacy endpoint maintenance

---

## 📞 **SUPPORT**

### **Error Reporting**

- Include `X-Request-ID` in error reports
- Provide timestamp and error code
- Include request details (without sensitive data)

### **Rate Limit Headers**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1632000000
```

---

## 🚀 **QUICK START**

1. **Register/Login**: Use `/auth/register` or `/auth/login`
2. **Store Tokens**: Save `accessToken` and `refreshToken`
3. **Make Requests**: Include `Authorization: Bearer <token>` header
4. **Handle Errors**: Check `success` field and error codes
5. **Refresh Tokens**: Use `/auth/refresh` when token expires

---

**Last Updated**: September 20, 2024  
**API Version**: v1  
**Status**: Production Ready ✅
