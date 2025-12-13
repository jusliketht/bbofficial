# ITR Form Data Structure & Migration Guide

## Overview

This document details the data structure changes implemented to streamline ITR forms, the migration strategy for backward compatibility, and how to work with the consolidated data structure.

## Table of Contents

1. [Data Structure Changes](#data-structure-changes)
2. [Migration Strategy](#migration-strategy)
3. [Access Patterns](#access-patterns)
4. [Migration Utility API](#migration-utility-api)
5. [Examples](#examples)

## Data Structure Changes

### Before (Inconsistent Structure)

```javascript
// Old structure - inconsistent access patterns
formData = {
  personalInfo: {},
  income: {
    salary: 0,
    houseProperty: {},
    otherSources: {},
    // Some income types here
    businessIncome: 0,  // Simple number for ITR-1/2
    professionalIncome: 0,  // Simple number for ITR-1/2
  },
  // Duplicate top-level properties
  businessIncome: {  // ITR-3: { businesses: [] }
    businesses: [],
  },
  professionalIncome: {  // ITR-3: { professions: [] }
    professions: [],
  },
  deductions: {},
  taxesPaid: {},
}
```

**Problems:**
- `formData.businessIncome` vs `formData.income.businessIncome` (both exist)
- `formData.professionalIncome` vs `formData.income.professionalIncome` (both exist)
- Inconsistent access patterns across components
- Bugs in export services, tax computation, validation

### After (Consolidated Structure)

```javascript
// New structure - all income types under formData.income.*
formData = {
  personalInfo: {},
  income: {
    // All income types consolidated here
    salary: 0 | object,
    businessIncome: 0 | { businesses: [] },  // ITR-3: object, ITR-1/2: number
    professionalIncome: 0 | { professions: [] },  // ITR-3: object, ITR-1/2: number
    presumptiveBusiness: object | undefined,  // ITR-4 only
    presumptiveProfessional: object | undefined,  // ITR-4 only
    capitalGains: 0 | object,
    houseProperty: object,
    otherSources: object,
    foreignIncome: object | undefined,
    directorPartner: object | undefined,
    otherIncome: number,
  },
  // No duplicate top-level properties
  deductions: {},
  taxesPaid: {},
  balanceSheet: object | undefined,  // ITR-3 only
  auditInfo: object | undefined,  // ITR-3 only
}
```

**Benefits:**
- Single source of truth: `formData.income.*` for all income types
- Consistent access patterns across all components
- Easier to maintain and extend
- Reduced bugs from inconsistent access

## Migration Strategy

### Migration Utility

Location: `frontend/src/utils/itrDataMigration.js`

The migration utility provides:
1. Automatic migration from old to new structure
2. Helper functions for safe access with fallback
3. Setter functions that write to new structure

### Migration Function

```javascript
import { migrateFormDataStructure } from '../utils/itrDataMigration';

// Automatically migrates old structure to new
const migratedData = migrateFormDataStructure(oldFormData);

// Result:
// - formData.businessIncome → formData.income.businessIncome
// - formData.professionalIncome → formData.income.professionalIncome
// - Preserves top-level for backward compatibility during transition
```

### Access Helper Functions

```javascript
import {
  getBusinessIncome,
  getProfessionalIncome,
  setBusinessIncome,
  setProfessionalIncome,
} from '../utils/itrDataMigration';

// Safe access with fallback
const businessIncome = getBusinessIncome(formData);
// Returns: formData.income?.businessIncome ?? formData.businessIncome

const professionalIncome = getProfessionalIncome(formData);
// Returns: formData.income?.professionalIncome ?? formData.professionalIncome

// Update with new structure
const updated = setBusinessIncome(formData, newBusinessIncome);
// Writes to: formData.income.businessIncome
// Also updates top-level for backward compatibility
```

## Access Patterns

### Recommended Pattern (New Code)

```javascript
// Always use formData.income.* for new code
const businessIncome = formData.income?.businessIncome;
const professionalIncome = formData.income?.professionalIncome;

// Update pattern
setFormData(prev => ({
  ...prev,
  income: {
    ...prev.income,
    businessIncome: newBusinessIncome,
  },
}));
```

### Backward Compatible Pattern (Existing Code)

```javascript
// Use fallback pattern for existing code
const businessIncome = formData.income?.businessIncome || formData.businessIncome;
const professionalIncome = formData.income?.professionalIncome || formData.professionalIncome;

// This pattern is used throughout the codebase during transition
```

### Service Layer Pattern

```javascript
// All services use this pattern
const businessIncome = formData.income?.businessIncome || formData.businessIncome;
const professionalIncome = formData.income?.professionalIncome || formData.professionalIncome;

// Check structure
if (businessIncome?.businesses && Array.isArray(businessIncome.businesses)) {
  // ITR-3: Process businesses array
} else {
  // ITR-1/2: Simple number
  const total = parseFloat(businessIncome || 0);
}
```

## Migration Utility API

### `migrateFormDataStructure(formData)`

Migrates formData from old structure to new consolidated structure.

**Parameters:**
- `formData` (object): Form data in old or new structure

**Returns:**
- `object`: Form data in new consolidated structure

**Example:**
```javascript
const oldData = {
  income: { salary: 100000 },
  businessIncome: { businesses: [] },
  professionalIncome: { professions: [] },
};

const migrated = migrateFormDataStructure(oldData);
// Result:
// {
//   income: {
//     salary: 100000,
//     businessIncome: { businesses: [] },
//     professionalIncome: { professions: [] },
//   },
//   businessIncome: { businesses: [] },  // Preserved for backward compatibility
//   professionalIncome: { professions: [] },  // Preserved for backward compatibility
// }
```

### `getBusinessIncome(formData)`

Safely retrieves business income with fallback.

**Parameters:**
- `formData` (object): Form data

**Returns:**
- `any`: Business income data (from new or old structure)

### `getProfessionalIncome(formData)`

Safely retrieves professional income with fallback.

**Parameters:**
- `formData` (object): Form data

**Returns:**
- `any`: Professional income data (from new or old structure)

### `setBusinessIncome(formData, businessIncome)`

Updates business income in new structure.

**Parameters:**
- `formData` (object): Form data
- `businessIncome` (any): Business income data

**Returns:**
- `object`: Updated form data

**Note:** Also updates top-level for backward compatibility during transition.

### `setProfessionalIncome(formData, professionalIncome)`

Updates professional income in new structure.

**Parameters:**
- `formData` (object): Form data
- `professionalIncome` (any): Professional income data

**Returns:**
- `object`: Updated form data

**Note:** Also updates top-level for backward compatibility during transition.

## Examples

### Example 1: Loading Draft Data

```javascript
// In ITRComputation component
useEffect(() => {
  const loadDraft = async () => {
    const draft = await itrService.getDraft(draftId);
    let formData = draft.formData || {};
    
    // Migrate to new structure
    formData = migrateFormDataStructure(formData);
    
    setFormData(formData);
  };
  
  loadDraft();
}, [draftId]);
```

### Example 2: Updating Business Income

```javascript
// In BusinessIncomeForm component
const handleUpdate = (updates) => {
  // Update using consolidated structure
  onUpdate({
    income: {
      businessIncome: {
        ...currentBusinessIncome,
        ...updates,
      },
    },
  });
};

// Or using helper function
import { setBusinessIncome } from '../../utils/itrDataMigration';

const updated = setBusinessIncome(formData, newBusinessIncome);
onUpdate({ income: updated.income });
```

### Example 3: Accessing in Tax Computation

```javascript
// In TaxComputationBar component
const calculateGrossIncome = useMemo(() => {
  const income = formData.income || {};
  
  // Use fallback pattern
  const businessIncome = income.businessIncome || formData.businessIncome;
  const professionalIncome = income.professionalIncome || formData.professionalIncome;
  
  // Calculate totals
  let businessTotal = 0;
  if (businessIncome?.businesses) {
    businessTotal = businessIncome.businesses.reduce((sum, biz) => {
      // Calculate from P&L
      return sum + (biz.pnl?.netProfit || 0);
    }, 0);
  } else {
    businessTotal = parseFloat(businessIncome || 0);
  }
  
  // Similar for professional income...
  
  return salary + businessTotal + professionalTotal + /* ... */;
}, [formData.income, formData.businessIncome, formData.professionalIncome]);
```

### Example 4: Export Service

```javascript
// In itrJsonExportService.js
transformFormDataToExportFormat(formData, itrType) {
  // Use consolidated structure with fallback
  const businessIncome = formData.income?.businessIncome || formData.businessIncome;
  const professionalIncome = formData.income?.professionalIncome || formData.professionalIncome;
  
  if (businessIncome?.businesses && Array.isArray(businessIncome.businesses)) {
    // ITR-3: Calculate total from businesses array
    const total = businessIncome.businesses.reduce(/* ... */);
    transformed.income.businessIncome = total;
    transformed.businessIncomeDetails = businessIncome;
  } else {
    transformed.income.businessIncome = parseFloat(businessIncome || 0);
  }
  
  // Similar for professional income...
}
```

### Example 5: Backend Controller

```javascript
// In ITRController.js
transformFormDataToExportFormat(formData, itrType) {
  // Use consolidated structure with fallback
  const businessIncome = formData.income?.businessIncome || formData.businessIncome;
  const professionalIncome = formData.income?.professionalIncome || formData.professionalIncome;
  
  // Process with same logic as frontend
  // ...
}
```

## Data Structure by ITR Type

### ITR-1 (Sahaj)

```javascript
formData = {
  income: {
    salary: number,
    houseProperty: { properties: [] },  // Max 1 property
    otherSources: {
      interestIncomes: [],
      otherIncomes: [],
    },
    // businessIncome and professionalIncome are numbers (0) or undefined
    businessIncome: 0,
    professionalIncome: 0,
  },
}
```

### ITR-2

```javascript
formData = {
  income: {
    salary: number,
    houseProperty: { properties: [] },  // Multiple properties allowed
    capitalGains: {
      hasCapitalGains: boolean,
      stcgDetails: [],
      ltcgDetails: [],
    },
    foreignIncome: {
      hasForeignIncome: boolean,
      foreignIncomeDetails: [],
    },
    directorPartner: {
      isDirector: boolean,
      directorIncome: number,
      isPartner: boolean,
      partnerIncome: number,
    },
    otherSources: object,
    // businessIncome and professionalIncome are numbers (0)
    businessIncome: 0,
    professionalIncome: 0,
  },
}
```

### ITR-3

```javascript
formData = {
  income: {
    salary: number,
    businessIncome: {  // Object with businesses array
      businesses: [
        {
          businessName: string,
          businessNature: string,
          pnl: {
            grossReceipts: number,
            expenses: object,
            netProfit: number,
          },
        },
      ],
    },
    professionalIncome: {  // Object with professions array
      professions: [
        {
          professionName: string,
          professionType: string,
          pnl: {
            professionalFees: number,
            expenses: object,
            netIncome: number,
          },
        },
      ],
    },
    capitalGains: object,
    houseProperty: object,
    foreignIncome: object,
    directorPartner: object,
    otherSources: object,
  },
  balanceSheet: object,  // Optional
  auditInfo: object,  // Optional
}
```

### ITR-4 (Sugam)

```javascript
formData = {
  income: {
    salary: number,
    presumptiveBusiness: {  // Section 44AD
      hasPresumptiveBusiness: boolean,
      grossReceipts: number,
      presumptiveRate: number,  // 8% or 6%
      presumptiveIncome: number,
      optedOut: boolean,
    },
    presumptiveProfessional: {  // Section 44ADA
      hasPresumptiveProfessional: boolean,
      grossReceipts: number,
      presumptiveRate: number,  // 50%
      presumptiveIncome: number,
      optedOut: boolean,
    },
    houseProperty: object,
    otherSources: object,
    // businessIncome and professionalIncome are numbers (0) or undefined
    businessIncome: 0,
    professionalIncome: 0,
  },
}
```

## Migration Checklist

When updating code to use the new structure:

- [ ] Import migration utility if needed
- [ ] Use `formData.income.*` for all income access
- [ ] Add fallback for backward compatibility: `formData.income?.businessIncome || formData.businessIncome`
- [ ] Update setter functions to write to `formData.income.*`
- [ ] Test with both old and new data structures
- [ ] Update component props to use consolidated structure
- [ ] Update service layer transformations
- [ ] Update validation logic
- [ ] Update tax computation logic
- [ ] Update export services

## Future Cleanup

Once all components are updated and all existing drafts are migrated:

1. Remove top-level `businessIncome` and `professionalIncome` properties
2. Remove fallback logic from services
3. Update migration utility to only handle legacy data
4. Update documentation to reflect final structure

