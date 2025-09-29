# BurnBlack ITR Filing Platform - Backend

Enterprise-grade ITR filing platform backend with comprehensive support for ITR-1, ITR-2, ITR-3, and ITR-4.

## 🚀 Features

### Core Features

- **Multi-ITR Support**: Complete support for ITR-1, ITR-2, ITR-3, and ITR-4
- **Enterprise Authentication**: JWT-based authentication with role-based access control
- **Real-time Tax Computation**: Server-side tax calculation with FY 2024-25 rules
- **Comprehensive Validation**: Enterprise-grade validation with AI-powered suggestions
- **Document Management**: Secure file upload and management
- **Real-time Notifications**: Multi-channel notification system
- **Family Management**: Support for multiple family members
- **Audit Trail**: Complete audit logging for compliance

### ITR-Specific Features

#### ITR-1 (Salary & House Property)

- Salary income with standard deduction
- House property income (self-occupied/let-out)
- Other income sources
- Section 80C, 80D, 80G deductions
- HRA exemption calculation

#### ITR-2 (Capital Gains & Foreign Income)

- Capital gains (equity, debt, real estate, other)
- Foreign income with tax credit
- Advanced deduction calculations
- LTCG exemption handling

#### ITR-3 (Business & Professional Income)

- Business income with P&L statement
- Balance sheet integration
- Professional income
- Business deductions
- Depreciation calculations

#### ITR-4 (Presumptive Taxation)

- Section 44AD (Business)
- Section 44ADA (Professionals)
- Section 44AE (Goods Carriage)
- Presumptive vs actual income choice

## 🏗️ Architecture

### Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Validation**: Joi
- **Logging**: Winston
- **File Upload**: Multer
- **Email**: Nodemailer
- **SMS**: Twilio
- **Real-time**: WebSockets

### Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── rules/           # Validation rules
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── tests/               # Test files
├── logs/                # Log files
├── uploads/             # File uploads
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm 8+

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/burnblack/itr-filing-platform.git
   cd itr-filing-platform/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**

   ```bash
   # Create database
   createdb burnblack_itr

   # Run migrations
   npm run db:migrate

   # Seed initial data
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### ITR Filing Endpoints

#### ITR-1 Routes

- `POST /itr1/filing` - Create ITR-1 filing
- `GET /itr1/filing/:id` - Get ITR-1 filing
- `PUT /itr1/filing/:id` - Update ITR-1 filing
- `POST /itr1/filing/:id/validate` - Validate ITR-1 filing
- `POST /itr1/filing/:id/compute-tax` - Compute tax
- `POST /itr1/filing/:id/submit` - Submit ITR-1 filing

#### ITR-2 Routes

- `POST /itr2/filing` - Create ITR-2 filing
- `GET /itr2/filing/:id` - Get ITR-2 filing
- `PUT /itr2/filing/:id` - Update ITR-2 filing
- `PUT /itr2/filing/:id/capital-gains` - Update capital gains
- `PUT /itr2/filing/:id/foreign-income` - Update foreign income
- `POST /itr2/filing/:id/validate` - Validate ITR-2 filing
- `POST /itr2/filing/:id/compute-tax` - Compute tax
- `POST /itr2/filing/:id/submit` - Submit ITR-2 filing

#### ITR-3 Routes

- `POST /itr3/filing` - Create ITR-3 filing
- `GET /itr3/filing/:id` - Get ITR-3 filing
- `PUT /itr3/filing/:id` - Update ITR-3 filing
- `PUT /itr3/filing/:id/business-income` - Update business income
- `POST /itr3/filing/:id/validate` - Validate ITR-3 filing
- `POST /itr3/filing/:id/compute-tax` - Compute tax
- `POST /itr3/filing/:id/submit` - Submit ITR-3 filing

#### ITR-4 Routes

- `POST /itr4/filing` - Create ITR-4 filing
- `GET /itr4/filing/:id` - Get ITR-4 filing
- `PUT /itr4/filing/:id` - Update ITR-4 filing
- `PUT /itr4/filing/:id/presumptive-income` - Update presumptive income
- `POST /itr4/filing/:id/validate` - Validate ITR-4 filing
- `POST /itr4/filing/:id/compute-tax` - Compute tax
- `POST /itr4/filing/:id/submit` - Submit ITR-4 filing

### Utility Endpoints

- `GET /health` - Health check
- `GET /itr1/tax-slabs/:year` - Get tax slabs
- `GET /itr2/capital-gains-types` - Get capital gains types
- `GET /itr2/foreign-income-types` - Get foreign income types
- `GET /itr3/business-types` - Get business types
- `GET /itr4/presumptive-limits` - Get presumptive limits

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available configuration options.

### Database Configuration

The application uses PostgreSQL with the following extensions:

- `uuid-ossp` for UUID generation
- `pgcrypto` for password hashing

### Security Features

- Helmet for security headers
- CORS protection
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

## 📝 Logging

The application uses Winston for structured logging with the following levels:

- `error` - Error messages
- `warn` - Warning messages
- `info` - Informational messages
- `debug` - Debug messages

Logs are written to:

- Console (development)
- File: `logs/app.log` (production)

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
# Build image
docker build -t burnblack-itr-backend .

# Run container
docker run -p 5000:5000 burnblack-itr-backend
```

### Environment Variables for Production

- Set `NODE_ENV=production`
- Configure production database
- Set secure JWT secrets
- Configure email and SMS services
- Set up file storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Email: support@burnblack.com
- Documentation: [docs.burnblack.com](https://docs.burnblack.com)
- Issues: [GitHub Issues](https://github.com/burnblack/itr-filing-platform/issues)

## 🔄 Version History

- **v1.0.0** - Initial release with ITR-1, ITR-2, ITR-3, and ITR-4 support
- **v1.1.0** - Added AI-powered validation and suggestions
- **v1.2.0** - Enhanced tax computation engine
- **v1.3.0** - Added real-time notifications and WebSocket support
