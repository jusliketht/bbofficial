# ENTERPRISE FACTS & DECISIONS

## 🎯 **CONFIRMED ENTERPRISE DECISIONS**

### **Authentication Architecture**

- **Token Strategy**: JWT access (10-15 min) + HttpOnly refresh cookie (7 days)
- **Storage**: Access tokens in memory, refresh tokens in secure cookies
- **Rotation**: New refresh token on each refresh call
- **Revocation**: Server-side session store for immediate invalidation

### **RBAC Structure (Final)**

1. **SUPER_ADMIN** - System-wide access, CA firm approvals, global billing
2. **PLATFORM_ADMIN** - Platform operations, user oversight, compliance
3. **CA_FIRM_ADMIN** - Firm management, staff assignment, client portfolio
4. **CA** - Professional filing, document review, tax computation
5. **END_USER** - Self-filing, family management, document upload

### **Login Flow Decision**

- **Single Login Component**: Consolidate `Login.js`, `LoginUltra.js`, `ManualLogin.js`
- **Role Preselection**: Role buttons prefill credentials and show role-specific UI
- **Manual Override**: Email/password with role dropdown for flexibility
- **Dashboard Routing**: Direct to role-specific dashboards post-login

### **State Management**

- **AuthContext**: Specialized for auth state, tokens, login/logout
- **AppContext**: Global UI state, feature flags, theme
- **Domain Contexts**: Separate contexts for filing, documents, etc.
- **No Duplicates**: Remove conflicting auth contexts

### **Session Management**

- **Idle Timeout**: 30 minutes (configurable)
- **Absolute Expiry**: 7 days maximum
- **Concurrent Sessions**: Limit 3 per user
- **Logout Everywhere**: Support session revocation

### **Security Requirements**

- **Password Hashing**: bcrypt with 12 rounds
- **Rate Limiting**: 5 attempts per 15 minutes
- **Audit Logging**: All auth events with IP, user-agent, timestamp
- **Cache Control**: `no-store` on auth endpoints
- **HTTPS Only**: Secure cookies, SameSite strict

---

## 📊 **PLATFORM ARCHITECTURE FACTS**

### **Database**

- **Primary**: PostgreSQL with Sequelize ORM
- **Backup Strategy**: Supabase integration planned (not for MVP core DB)
- **Migrations**: Custom scripts for migrate, seed, reset operations

### **Frontend Stack**

- **Framework**: React 18 with functional components
- **Routing**: React Router v6 with role-based guards
- **State**: Context API + custom hooks
- **Styling**: Tailwind CSS with custom design system
- **Build**: Create React App with custom webpack config

### **Backend Stack**

- **Runtime**: Node.js with Express.js
- **Authentication**: JWT with bcrypt password hashing
- **File Upload**: Multer for local, AWS S3 for production
- **API**: RESTful with standardized error handling
- **Middleware**: CORS, helmet, rate limiting, auth verification

### **External Integrations**

- **ERI API**: PAN verification, filing upload, acknowledgement fetch
- **AWS S3**: Document storage with presigned URLs
- **Email/SMS**: OTP delivery for MFA (planned)
- **Payment Gateway**: Razorpay integration (planned)

---

## 🏢 **BUSINESS LOGIC FACTS**

### **ITR Filing Types**

- **MVP Focus**: ITR-1 (salary income, basic deductions)
- **Future**: ITR-2, ITR-3, ITR-4 with dynamic form generation
- **Auto-Detection**: Hybrid approach with manual override
- **Validation**: Real-time validation with tax computation

### **User Management**

- **Family Members**: Up to 5 dependents per user account
- **CA Client Management**: Unlimited clients per CA
- **Firm Structure**: CA firms can have multiple CA staff
- **Role Migration**: Users can upgrade roles (user → CA)

### **Document Management**

- **File Types**: PDF, JPG, PNG for documents
- **Size Limits**: 10MB per file, 100MB per user
- **Categories**: Form-16, Bank Statement, Investment Proof, Rent Receipts
- **Storage**: Hybrid (local dev, S3 production)
- **Security**: Presigned URLs, audit logging

### **Service Tickets**

- **Auto-Generation**: One ticket per ITR filing
- **SLA Tracking**: Response times by priority
- **Message System**: Internal communication thread
- **Escalation**: Automatic escalation rules

---

## 🔧 **TECHNICAL IMPLEMENTATION FACTS**

### **API Structure**

```
/api/auth/*          - Authentication endpoints
/api/users/*         - User management
/api/members/*       - Family member management
/api/itr/*           - ITR filing operations
/api/documents/*     - Document upload/management
/api/tickets/*       - Service ticket system
/api/admin/*         - Administrative functions
```

### **Database Models**

- **User**: Core user data with role-based permissions
- **FamilyMember**: Dependent management with PAN linking
- **ITRFiling**: Filing records with status tracking
- **ITRDraft**: Auto-save functionality for partial filings
- **Document**: File metadata with category classification
- **ServiceTicket**: Support ticket system with SLA tracking

### **Frontend Components**

- **Design System**: Centralized Button, Card, Modal, Tooltip components
- **Filing Orchestrator**: Single component managing multi-step ITR flow
- **Dashboard Router**: Role-based dashboard rendering
- **Document Upload**: Drag-drop with progress tracking
- **Admin Panel**: User management with role/status updates

### **Security Implementation**

- **JWT Verification**: Middleware on all protected routes
- **Role Guards**: Component-level access control
- **Input Validation**: Server-side validation with sanitization
- **Error Handling**: Centralized error logging and user feedback
- **Audit Trail**: Immutable logging for compliance

---

## 📱 **MOBILE & PWA FACTS**

### **Progressive Web App**

- **Manifest**: App-like installation on mobile devices
- **Service Worker**: Offline capability for basic functions
- **Responsive Design**: Mobile-first approach with breakpoints
- **Touch Optimization**: Gesture-friendly UI components

### **React Native (Future)**

- **Shared Logic**: Business logic shared between web and mobile
- **Native Features**: Camera for document capture, biometric auth
- **Offline Sync**: Local storage with server synchronization
- **Push Notifications**: Filing status updates and reminders

---

## 🚀 **DEPLOYMENT & INFRASTRUCTURE FACTS**

### **Development Environment**

- **Local Database**: PostgreSQL running on localhost:5432
- **Frontend**: React dev server on localhost:3000
- **Backend**: Express server on localhost:3002
- **File Storage**: Local filesystem for development

### **Production Environment (Planned)**

- **Hosting**: AWS EC2 or DigitalOcean droplets
- **Database**: AWS RDS PostgreSQL with automated backups
- **File Storage**: AWS S3 with CloudFront CDN
- **SSL**: Let's Encrypt certificates with auto-renewal
- **Monitoring**: CloudWatch or DataDog for system metrics

### **CI/CD Pipeline**

- **Version Control**: Git with feature branch workflow
- **Testing**: Jest for unit tests, Cypress for E2E
- **Build**: Automated builds on push to main branch
- **Deployment**: Blue-green deployment with rollback capability

---

## 📋 **COMPLIANCE & REGULATORY FACTS**

### **Data Protection**

- **PII Handling**: Encrypted storage of sensitive user data
- **Data Retention**: Configurable retention policies
- **Right to Deletion**: User data removal on request
- **Audit Compliance**: Immutable audit logs for regulatory review

### **Tax Compliance**

- **ERI Integration**: Official government API for filing
- **Digital Signatures**: CA-level e-signature capability
- **Form Validation**: Government-compliant form structures
- **Acknowledgement Tracking**: ITR-V and acknowledgement management

### **Financial Compliance**

- **Payment Processing**: PCI DSS compliant payment handling
- **Invoice Generation**: GST-compliant invoice formats
- **Financial Reporting**: Revenue and tax reporting capabilities
- **Refund Processing**: Integration with banking systems

---

## ✅ **CURRENT IMPLEMENTATION STATUS**

### **Completed Features**

- ✅ User registration and authentication
- ✅ Role-based access control
- ✅ Database migrations and seeding
- ✅ ITR filing orchestrator
- ✅ Document upload system
- ✅ Service ticket automation
- ✅ Admin panel with user management
- ✅ SSE notifications
- ✅ PWA configuration

### **In Progress**

- 🔄 Authentication system consolidation
- 🔄 Frontend component cleanup
- 🔄 API endpoint standardization
- 🔄 Error handling improvements

### **Planned Features**

- 📋 MFA implementation
- 📋 Payment gateway integration
- 📋 Advanced ITR types (ITR-2, ITR-3, ITR-4)
- 📋 Mobile app development
- 📋 Advanced analytics and reporting

---

## 🎯 **SUCCESS METRICS**

### **Technical Metrics**

- **Uptime**: 99.9% availability target
- **Response Time**: <200ms API response average
- **Error Rate**: <1% application error rate
- **Security**: Zero data breaches, regular security audits

### **Business Metrics**

- **User Adoption**: Monthly active users growth
- **Filing Success**: ITR filing completion rate
- **Customer Satisfaction**: Support ticket resolution time
- **Revenue**: Subscription and per-filing revenue tracking
