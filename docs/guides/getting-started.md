# Getting Started

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Burnblack
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm start
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Frontend
Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000
```

## Database Setup

1. Create PostgreSQL database
2. Run migrations: `npm run migrate`
3. Seed initial data (optional): `npm run seed`

## Development Workflow

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start`
3. Make changes and test
4. Run tests: `npm test`

## Next Steps

- Read [Development Guide](./development.md) for detailed development setup
- Check [Architecture Documentation](../architecture/) for system design
- Review [API Documentation](../api/) for endpoint details

---

*For production deployment, see [Launch Checklist](./launch-checklist.md)*

