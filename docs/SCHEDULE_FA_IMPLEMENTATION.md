# Schedule FA (Foreign Assets) Implementation Documentation

## Overview

Schedule FA is required for ITR-2 and ITR-3 when taxpayers have foreign assets. This document provides comprehensive technical documentation for the Schedule FA implementation, including data structures, API endpoints, UI components, and JSON export integration.

## Table of Contents

1. [Regulatory Requirements](#regulatory-requirements)
2. [Data Structure](#data-structure)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [JSON Export Integration](#json-export-integration)
6. [Validation Rules](#validation-rules)
7. [API Endpoints](#api-endpoints)
8. [Testing Scenarios](#testing-scenarios)

## Regulatory Requirements

### Income Tax Department Rules

1. **Applicability:**
   - Schedule FA is mandatory for ITR-2 and ITR-3
   - Required when taxpayer has foreign assets (bank accounts, equity holdings, immovable property, other assets)
   - Must be declared even if assets are exempt from tax

2. **Asset Types:**
   - Foreign bank accounts
   - Foreign equity holdings
   - Foreign immovable properties
   - Other foreign assets

3. **Valuation Requirements:**
   - Assets must be valued in foreign currency
   - Must provide INR equivalent value
   - Valuation date must be specified

## Data Structure

### Database Schema

**Table:** `foreign_assets`

```sql
CREATE TABLE foreign_assets (
  id UUID PRIMARY KEY,
  filing_id UUID NOT NULL REFERENCES itr_filings(id),
  user_id UUID NOT NULL REFERENCES users(id),
  asset_type ENUM('bank_account', 'equity_holding', 'immovable_property', 'other') NOT NULL,
  country VARCHAR(255) NOT NULL,
  asset_details JSONB NOT NULL,
  declaration_date DATE NOT NULL,
  valuation_date DATE NOT NULL,
  valuation_amount_inr DECIMAL(15, 2) NOT NULL,
  valuation_amount_foreign DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Form Data Structure

```javascript
scheduleFA = {
  assets: [
    {
      id: string,
      assetType: 'bank_account' | 'equity_holding' | 'immovable_property' | 'other',
      country: string,
      assetDetails: {
        // Bank Account
        bankName?: string,
        accountNumber?: string,
        accountType?: string,
        currency: string,
        
        // Equity Holding
        companyName?: string,
        numberOfShares?: number,
        
        // Immovable Property
        address?: string,
        propertyType?: string,
        
        // Other Assets
        description?: string,
      },
      declarationDate: string, // ISO date
      valuationDate: string, // ISO date
      valuationAmountInr: number,
      valuationAmountForeign: number,
    },
  ],
  totalValue: number,
  totals: {
    totalValue: number,
    byType: object,
    byCountry: object,
    dtaaAssets: number,
  },
}
```

## Backend Implementation

### Model

**File:** `backend/src/models/ForeignAsset.js`

```javascript
const ForeignAsset = sequelize.define('ForeignAsset', {
  id: { type: DataTypes.UUID, primaryKey: true },
  filingId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
  assetType: { type: DataTypes.ENUM(...), allowNull: false },
  country: { type: DataTypes.STRING, allowNull: false },
  assetDetails: { type: DataTypes.JSONB, allowNull: false },
  declarationDate: { type: DataTypes.DATE, allowNull: false },
  valuationDate: { type: DataTypes.DATE, allowNull: false },
  valuationAmountInr: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  valuationAmountForeign: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  currency: { type: DataTypes.STRING, allowNull: false },
});
```

### Service

**File:** `backend/src/services/business/ForeignAssetsService.js`

**Key Methods:**
- `getForeignAssets(filingId)` - Get all foreign assets for a filing
- `addForeignAsset(filingId, assetData)` - Add a new foreign asset
- `updateForeignAsset(assetId, assetData)` - Update an existing asset
- `deleteForeignAsset(assetId)` - Delete an asset
- `calculateTotalForeignAssets(filingId)` - Calculate totals
- `generateScheduleFA(filingId)` - Generate Schedule FA for export

### Controller

**File:** `backend/src/controllers/ITRController.js`

**Endpoints:**
- `GET /api/itr/filings/:filingId/foreign-assets` - Get all assets
- `POST /api/itr/filings/:filingId/foreign-assets` - Add asset
- `PUT /api/itr/filings/:filingId/foreign-assets/:assetId` - Update asset
- `DELETE /api/itr/filings/:filingId/foreign-assets/:assetId` - Delete asset

## Frontend Implementation

### Component Structure

**Main Component:** `frontend/src/features/foreign-assets/components/schedule-fa.jsx`

**Sub-components:**
- `ForeignBankAccountForm` - Form for bank account assets
- `ForeignEquityForm` - Form for equity holding assets
- `ForeignPropertyForm` - Form for immovable property assets
- `ForeignAssetsSummary` - Summary view of all assets

### Integration

**File:** `frontend/src/pages/ITR/ITRComputation.js`

```javascript
// Schedule FA section for ITR-2 and ITR-3
const scheduleFASection = (selectedITR === 'ITR-2' || selectedITR === 'ITR2' || 
                           selectedITR === 'ITR-3' || selectedITR === 'ITR3') ? [
  {
    id: 'scheduleFA',
    title: 'Schedule FA - Foreign Assets',
    icon: Globe,
    description: 'Foreign bank accounts, equity holdings, immovable property',
  },
] : [];
```

**File:** `frontend/src/components/ITR/ComputationSection.js`

```javascript
case 'scheduleFA':
  if (['ITR-2', 'ITR2', 'ITR-3', 'ITR3'].includes(selectedITR)) {
    return (
      <ScheduleFA
        filingId={filingId}
        onUpdate={() => onUpdate?.({})}
      />
    );
  }
  return null;
```

## JSON Export Integration

### Export Method

**File:** `frontend/src/services/itrJsonExportService.js`

**Fetch Schedule FA:**
```javascript
// Fetch Schedule FA for ITR-2 and ITR-3
if (itrType === 'ITR-2' || itrType === 'ITR2' || itrType === 'ITR-3' || itrType === 'ITR3') {
  const filingId = itrData.filingId || itrData.id;
  if (filingId) {
    const scheduleFAResponse = await fetch(`/api/itr/filings/${filingId}/foreign-assets`);
    if (scheduleFAResponse.ok) {
      const scheduleFAData = await scheduleFAResponse.json();
      if (scheduleFAData.success && scheduleFAData.assets) {
        itrData.scheduleFA = {
          assets: scheduleFAData.assets,
          totalValue: scheduleFAData.totalValue || 0,
          totals: scheduleFAData.totals || {},
        };
      }
    }
  }
}
```

### Formatting Method

```javascript
formatScheduleFAForExport(scheduleFA) {
  if (!scheduleFA || !scheduleFA.assets || scheduleFA.assets.length === 0) {
    return {
      BankAccounts: [],
      EquityHoldings: [],
      ImmovableProperties: [],
      OtherAssets: [],
      TotalValue: this.formatAmount(0),
    };
  }

  // Group assets by type and format for ITD schema
  const bankAccounts = [];
  const equityHoldings = [];
  const immovableProperties = [];
  const otherAssets = [];

  scheduleFA.assets.forEach((asset) => {
    const assetData = {
      Country: asset.country || '',
      ValuationDate: this.formatDateForITD(asset.valuationDate),
      ValuationAmountINR: this.formatAmount(asset.valuationAmountInr),
      ValuationAmountForeign: this.formatAmount(asset.valuationAmountForeign),
      Currency: asset.assetDetails?.currency || '',
    };

    switch (asset.assetType) {
      case 'bank_account':
        bankAccounts.push({
          ...assetData,
          BankName: asset.assetDetails?.bankName || '',
          AccountNumber: asset.assetDetails?.accountNumber || '',
          AccountType: asset.assetDetails?.accountType || '',
        });
        break;
      case 'equity_holding':
        equityHoldings.push({
          ...assetData,
          CompanyName: asset.assetDetails?.companyName || '',
          NumberOfShares: asset.assetDetails?.numberOfShares || 0,
        });
        break;
      case 'immovable_property':
        immovableProperties.push({
          ...assetData,
          PropertyAddress: asset.assetDetails?.address || '',
          PropertyType: asset.assetDetails?.propertyType || '',
        });
        break;
      case 'other':
        otherAssets.push({
          ...assetData,
          AssetDescription: asset.assetDetails?.description || '',
        });
        break;
    }
  });

  return {
    BankAccounts: bankAccounts,
    EquityHoldings: equityHoldings,
    ImmovableProperties: immovableProperties,
    OtherAssets: otherAssets,
    TotalValue: this.formatAmount(scheduleFA.totalValue || 0),
  };
}
```

### ITR-2 JSON Export

```javascript
generateITR2Json(itrData, assessmentYear, user) {
  return {
    Form_ITR2: {
      // ... other schedules ...
      ScheduleFA: this.formatScheduleFAForExport(itrData.scheduleFA),
      // ... rest of form ...
    },
  };
}
```

### ITR-3 JSON Export

```javascript
generateITR3Json(itrData, assessmentYear, user) {
  return {
    Form_ITR3: {
      // ... other schedules ...
      ScheduleFA: this.formatScheduleFAForExport(itrData.scheduleFA),
      // ... rest of form ...
    },
  };
}
```

## Validation Rules

**File:** `frontend/src/components/ITR/core/ITRValidationEngine.js`

### ITR-2 Validation

```javascript
// Schedule FA validation: Check if user has foreign income but no Schedule FA
const hasForeignIncome = (formData.income?.foreignIncome?.totalIncome || 
                          formData.income?.foreignIncomeDetails?.totalIncome || 0) > 0;
const hasScheduleFA = formData.scheduleFA?.assets?.length > 0;

if (hasForeignIncome && !hasScheduleFA) {
  warnings.push('You have declared foreign income. Consider declaring foreign assets in Schedule FA if applicable.');
}
```

### ITR-3 Validation

```javascript
// Schedule FA validation: Check if user has foreign income but no Schedule FA
const hasForeignIncome = (formData.income?.foreignIncome?.totalIncome || 
                          formData.income?.foreignIncomeDetails?.totalIncome || 0) > 0;
const hasScheduleFA = formData.scheduleFA?.assets?.length > 0;

if (hasForeignIncome && !hasScheduleFA) {
  warnings.push('You have declared foreign income. Consider declaring foreign assets in Schedule FA if applicable.');
}
```

## API Endpoints

### Get Foreign Assets

**Endpoint:** `GET /api/itr/filings/:filingId/foreign-assets`

**Response:**
```json
{
  "success": true,
  "assets": [
    {
      "id": "uuid",
      "assetType": "bank_account",
      "country": "USA",
      "assetDetails": {
        "bankName": "Bank of America",
        "accountNumber": "123456789",
        "accountType": "Savings",
        "currency": "USD"
      },
      "valuationDate": "2024-03-31",
      "valuationAmountInr": 1000000,
      "valuationAmountForeign": 12000,
      "currency": "USD"
    }
  ],
  "totalValue": 1000000,
  "totals": {
    "totalValue": 1000000,
    "byType": {
      "bank_account": 1000000
    },
    "byCountry": {
      "USA": 1000000
    }
  }
}
```

### Add Foreign Asset

**Endpoint:** `POST /api/itr/filings/:filingId/foreign-assets`

**Request:**
```json
{
  "assetType": "bank_account",
  "country": "USA",
  "assetDetails": {
    "bankName": "Bank of America",
    "accountNumber": "123456789",
    "accountType": "Savings",
    "currency": "USD"
  },
  "declarationDate": "2024-03-31",
  "valuationDate": "2024-03-31",
  "valuationAmountInr": 1000000,
  "valuationAmountForeign": 12000,
  "currency": "USD"
}
```

## Testing Scenarios

### Test Case 1: Add Foreign Bank Account

**Steps:**
1. Select ITR-2 or ITR-3
2. Navigate to Schedule FA section
3. Click "Add Foreign Asset"
4. Select "Bank Account"
5. Fill in details (country, bank name, account number, valuation)
6. Save

**Expected:**
- Asset appears in Schedule FA summary
- Asset is saved to database
- Asset appears in JSON export

### Test Case 2: JSON Export with Schedule FA

**Steps:**
1. Add foreign assets to ITR-2 or ITR-3
2. Click "Download JSON"
3. Open downloaded JSON file

**Expected:**
- JSON contains `ScheduleFA` section
- All asset types are properly formatted
- Total value is calculated correctly

### Test Case 3: Validation Warning

**Steps:**
1. Select ITR-2
2. Add foreign income
3. Do not add Schedule FA
4. Attempt to file

**Expected:**
- Warning message appears: "You have declared foreign income. Consider declaring foreign assets in Schedule FA if applicable."

## Related Documentation

- [Technical Architecture](./TECHNICAL_ARCHITECTURE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Component Architecture](./COMPONENT_ARCHITECTURE.md)
- [ITR Platform Review Response](./ITR_PLATFORM_REVIEW_RESPONSE.md)

