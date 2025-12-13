# ITR API Documentation

## Overview

This document provides comprehensive API documentation for all ITR-related endpoints, including request/response formats, authentication requirements, and error handling.

## Base URL

```
Production: https://api.yourdomain.com/api/itr
Development: http://localhost:3000/api/itr
```

## Authentication

All endpoints require JWT authentication via Bearer token:

```
Authorization: Bearer <jwt_token>
```

## Table of Contents

1. [Draft Management](#draft-management)
2. [Tax Computation](#tax-computation)
3. [Validation](#validation)
4. [Submission](#submission)
5. [Data Prefetch](#data-prefetch)
6. [Export](#export)
7. [E-Verification](#e-verification)
8. [Error Responses](#error-responses)

## Draft Management

### Create Draft

Create a new ITR draft.

**Endpoint:** `POST /api/itr/drafts`

**Request Body:**
```json
{
  "itrType": "ITR-1" | "ITR-2" | "ITR-3" | "ITR-4",
  "formData": {
    "personalInfo": {},
    "income": {},
    "deductions": {},
    "taxesPaid": {}
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Draft created successfully",
  "data": {
    "draftId": "uuid",
    "filingId": "uuid",
    "itrType": "ITR-1",
    "assessmentYear": "2024-25",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `201`: Created successfully
- `400`: Validation error
- `401`: Unauthorized
- `500`: Server error

### Update Draft

Update an existing draft.

**Endpoint:** `PUT /api/itr/drafts/:draftId`

**Request Body:**
```json
{
  "formData": {
    "personalInfo": {},
    "income": {
      "salary": 1000000,
      "businessIncome": {},  // ITR-3: { businesses: [] }
      "professionalIncome": {},  // ITR-3: { professions: [] }
      // ... other income types
    },
    "deductions": {},
    "taxesPaid": {}
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Draft updated successfully",
  "data": {
    "draftId": "uuid",
    "lastSavedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `200`: Updated successfully
- `404`: Draft not found
- `400`: Validation error
- `401`: Unauthorized
- `500`: Server error

### Get Draft

Retrieve a specific draft.

**Endpoint:** `GET /api/itr/drafts/:draftId`

**Response:**
```json
{
  "draft": {
    "id": "uuid",
    "itrType": "ITR-3",
    "step": "income",
    "formData": {
      "personalInfo": {},
      "income": {
        "businessIncome": { "businesses": [] },
        "professionalIncome": { "professions": [] }
      },
      "deductions": {},
      "taxesPaid": {}
    },
    "status": "draft",
    "assessmentYear": "2024-25",
    "isCompleted": false,
    "lastSavedAt": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Draft not found
- `401`: Unauthorized
- `500`: Server error

### Get User Drafts

Get all drafts for the authenticated user.

**Endpoint:** `GET /api/itr/drafts`

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `status` (string, optional): Filter by status (draft, submitted, etc.)
- `itrType` (string, optional): Filter by ITR type

**Response:**
```json
{
  "status": "success",
  "data": {
    "drafts": [
      {
        "id": "uuid",
        "itrType": "ITR-3",
        "status": "draft",
        "lastSavedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Tax Computation

### Compute Tax for Draft

Compute tax for a specific draft.

**Endpoint:** `POST /api/itr/drafts/:draftId/compute`

**Response:**
```json
{
  "status": "success",
  "message": "Tax computation completed",
  "data": {
    "assessmentYear": "2024-25",
    "itrType": "ITR-3",
    "grossTotalIncome": 1500000,
    "totalDeductions": 200000,
    "taxableIncome": 1300000,
    "taxComputation": {
      "oldRegime": {
        "totalTax": 150000,
        "cess": 6000,
        "finalTax": 156000
      },
      "newRegime": {
        "totalTax": 140000,
        "cess": 5600,
        "finalTax": 145600
      }
    },
    "totalTax": 156000,
    "cess": 6000,
    "finalTax": 156000,
    "taxPaid": 100000,
    "refundAmount": 0,
    "balancePayable": 56000,
    "computedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `200`: Computation successful
- `404`: Draft not found
- `400`: Invalid data
- `401`: Unauthorized
- `500`: Server error

### Compute Tax with Form Data

Compute tax directly with form data (without draft).

**Endpoint:** `POST /api/itr/compute-tax`

**Request Body:**
```json
{
  "formData": {
    "income": {
      "salary": 1000000,
      "businessIncome": {},
      "professionalIncome": {}
    },
    "deductions": {},
    "taxesPaid": {}
  },
  "regime": "old" | "new",
  "assessmentYear": "2024-25"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "grossTotalIncome": 1500000,
    "totalDeductions": 200000,
    "taxableIncome": 1300000,
    "finalTaxLiability": 156000,
    "taxPaid": 100000,
    "balancePayable": 56000,
    "regime": "old"
  }
}
```

### Compare Tax Regimes

Compare old vs new tax regime.

**Endpoint:** `POST /api/itr/compare-regimes`

**Request Body:**
```json
{
  "formData": {
    "income": {},
    "deductions": {}
  },
  "assessmentYear": "2024-25"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "comparison": {
      "oldRegime": {
        "totalTax": 156000,
        "finalTax": 156000
      },
      "newRegime": {
        "totalTax": 145600,
        "finalTax": 145600
      },
      "savings": 10400,
      "recommendedRegime": "new",
      "recommendationReason": "New regime offers ₹10,400 savings"
    }
  }
}
```

## Validation

### Validate Draft

Validate a draft for errors and warnings.

**Endpoint:** `POST /api/itr/drafts/:draftId/validate`

**Response:**
```json
{
  "status": "success",
  "data": {
    "isValid": false,
    "errors": [
      {
        "field": "income.businessIncome.businesses[0].businessName",
        "message": "Business name is required",
        "severity": "error"
      }
    ],
    "warnings": [
      {
        "field": "deductions.section80C",
        "message": "Section 80C deduction exceeds limit",
        "severity": "warning"
      }
    ],
    "summary": {
      "totalErrors": 1,
      "totalWarnings": 1,
      "sectionsWithErrors": ["income"]
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `200`: Validation completed
- `404`: Draft not found
- `401`: Unauthorized
- `500`: Server error

## Submission

### Submit ITR

Submit a draft as final ITR filing.

**Endpoint:** `POST /api/itr/drafts/:draftId/submit`

**Request Body:**
```json
{
  "verificationMethod": "AADHAAR_OTP" | "NETBANKING" | "DSC",
  "verificationDetails": {}
}
```

**Response:**
```json
{
  "status": "success",
  "message": "ITR submitted successfully",
  "data": {
    "filingId": "uuid",
    "acknowledgmentNumber": "ACK123456789",
    "submittedAt": "2024-01-01T00:00:00.000Z",
    "status": "submitted"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `200`: Submitted successfully
- `400`: Validation failed
- `404`: Draft not found
- `401`: Unauthorized
- `500`: Server error

## Data Prefetch

### Prefetch ITR Data

Prefetch data from ERI/AIS/Form26AS.

**Endpoint:** `GET /api/itr/prefetch/:pan/:assessmentYear`

**Response:**
```json
{
  "success": true,
  "data": {
    "income": {
      "salary": 1000000,
      "tds": 150000
    },
    "taxesPaid": {
      "advanceTax": 50000
    }
  },
  "sources": {
    "ais": { "available": true, "lastUpdated": "2024-01-01" },
    "form26as": { "available": true, "lastUpdated": "2024-01-01" },
    "eri": { "available": false }
  }
}
```

## Export

### Export ITR JSON

Export ITR data as government-compliant JSON.

**Endpoint:** `POST /api/itr/export`

**Request Body:**
```json
{
  "draftId": "uuid",
  "itrType": "ITR-3",
  "assessmentYear": "2024-25"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "fileName": "ITR3_2024-25_ACK123456789.json",
    "downloadUrl": "/api/itr/export/download/ITR3_2024-25_ACK123456789.json",
    "fileSize": 15420,
    "generatedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Download Exported JSON

Download the exported JSON file.

**Endpoint:** `GET /api/itr/export/download/:fileName`

**Response:**
- Content-Type: `application/json`
- Content-Disposition: `attachment; filename="ITR3_2024-25_ACK123456789.json"`

**Status Codes:**
- `200`: File downloaded
- `404`: File not found
- `401`: Unauthorized

## E-Verification

### Send Aadhaar OTP

Send OTP for Aadhaar-based e-verification.

**Endpoint:** `POST /api/itr/drafts/:draftId/everify/aadhaar`

**Request Body:**
```json
{
  "aadhaarNumber": "123456789012"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "data": {
    "otpSent": true,
    "maskedAadhaar": "1234****9012"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Verify Aadhaar OTP

Verify Aadhaar OTP for e-verification.

**Endpoint:** `POST /api/itr/drafts/:draftId/everify/aadhaar/verify`

**Request Body:**
```json
{
  "otp": "123456"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Aadhaar verified successfully",
  "data": {
    "verified": true,
    "verificationMethod": "AADHAAR_OTP",
    "verifiedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Responses

### Standard Error Format

```json
{
  "status": "error",
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "message": "Detailed error message",
    "details": {},
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Validation Error Format

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "fieldName": "Error message",
    "income.businessIncome": "Business income is required for ITR-3"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `INTERNAL_ERROR`: Server error
- `DRAFT_NOT_FOUND`: Draft does not exist
- `FILING_NOT_FOUND`: Filing does not exist
- `INVALID_ITR_TYPE`: Invalid ITR type
- `TAX_COMPUTATION_FAILED`: Tax computation error

## Rate Limiting

API endpoints are rate-limited:
- Draft operations: 100 requests/minute
- Tax computation: 20 requests/minute
- Export: 10 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Format:**
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Webhooks (Future)

Webhook endpoints for async operations (planned):
- `POST /api/itr/webhooks/tax-computed`
- `POST /api/itr/webhooks/filing-submitted`
- `POST /api/itr/webhooks/verification-completed`

