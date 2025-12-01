# System Overview

## Architecture Overview

BurnBlack is built as a modern, scalable ITR filing platform with a clear separation between frontend and backend.

## Technology Stack

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **State Management**: React Context API, React Query
- **Styling**: Tailwind CSS
- **UI Components**: Custom design system with Lucide icons
- **Build Tool**: Create React App / Vite

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **ORM**: Sequelize
- **Authentication**: JWT, Passport.js, Google OAuth
- **File Storage**: AWS S3 / Local storage

## System Architecture

```
┌─────────────────┐
│   React Frontend │
│   (Port 3000)   │
└────────┬────────┘
         │
         │ HTTP/REST API
         │
┌────────▼────────┐
│  Express Backend │
│   (Port 5000)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│PostgreSQL│ │  S3   │
│(Supabase)│ │Storage│
└─────────┘ └───────┘
```

## Key Components

### Frontend Structure
- `pages/` - Page components
- `components/` - Reusable UI components
- `services/` - API clients and business logic
- `contexts/` - React context providers
- `hooks/` - Custom React hooks

### Backend Structure
- `routes/` - API route definitions
- `controllers/` - Request handlers
- `models/` - Database models (Sequelize)
- `services/` - Business logic services
- `middleware/` - Express middleware

## Data Flow

1. **User Interaction** → Frontend component
2. **API Call** → Service layer
3. **HTTP Request** → Backend route
4. **Controller** → Business logic service
5. **Database** → Model operations
6. **Response** → Frontend update

## Security Architecture

- JWT-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention (Sequelize ORM)
- XSS protection
- CORS configuration
- Rate limiting

## Deployment Architecture

- **Frontend**: Static files served via Nginx
- **Backend**: Node.js process (PM2)
- **Database**: Managed PostgreSQL (Supabase)
- **Storage**: AWS S3 or local storage

---

*This is a high-level overview. For detailed architecture, see [CA-Grade Blueprint](./ca-grade-blueprint.md)*

