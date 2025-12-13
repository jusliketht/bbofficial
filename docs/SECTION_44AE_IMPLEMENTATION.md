# Section 44AE (Goods Carriage) Implementation Documentation

## Overview

Section 44AE provides presumptive taxation for income from plying, hiring, or leasing goods carriages. This document provides comprehensive technical documentation for the Section 44AE implementation, including data structures, UI components, tax calculation, and JSON export integration.

## Table of Contents

1. [Regulatory Requirements](#regulatory-requirements)
2. [Data Structure](#data-structure)
3. [Presumptive Income Calculation](#presumptive-income-calculation)
4. [Frontend Implementation](#frontend-implementation)
5. [Backend Implementation](#backend-implementation)
6. [JSON Export Integration](#json-export-integration)
7. [Validation Rules](#validation-rules)
8. [Testing Scenarios](#testing-scenarios)

## Regulatory Requirements

### Income Tax Act - Section 44AE

1. **Applicability:**
   - Applicable to ITR-4 (Sugam)
   - For income from plying, hiring, or leasing goods carriages
   - Maximum 10 goods carriages allowed
   - Can be used for owned or leased vehicles

2. **Presumptive Income Rates:**
   - **Heavy Goods Vehicle (above 12 MT):** ₹1,000 per ton per month
   - **Other Goods Vehicle (up to 12 MT):** ₹7,500 per vehicle per month

3. **Conditions:**
   - Must own not more than 10 goods carriages at any time during the year
   - Can opt for regular accounting if desired
   - Cannot use Section 44AE if gross receipts exceed ₹2 crores (must use ITR-3)

## Data Structure

### Form Data Structure

```javascript
goodsCarriage = {
  hasGoodsCarriage: boolean,
  vehicles: [
    {
      id: number,
      type: 'heavy_goods' | 'light_goods',
      registrationNo: string,
      gvw: number, // Gross Vehicle Weight (in tons, for heavy vehicles)
      monthsOwned: number, // Months owned/leased during the year (1-12)
      ownedOrLeased: 'owned' | 'leased',
    },
  ],
  totalPresumptiveIncome: number, // Calculated total
  totalVehicles: number, // Total number of vehicles
}
```

### Vehicle Types

```javascript
const VEHICLE_TYPES = [
  {
    id: 'heavy_goods',
    label: 'Heavy Goods Vehicle (above 12MT)',
    incomePerMonth: 1000, // per ton per month
    minTons: 12,
    description: 'Trucks with gross vehicle weight above 12 MT',
  },
  {
    id: 'light_goods',
    label: 'Other Goods Vehicle (up to 12MT)',
    incomePerMonth: 7500, // flat per vehicle per month
    maxTons: 12,
    description: 'Trucks/Tempos with gross vehicle weight up to 12 MT',
  },
];
```

## Presumptive Income Calculation

### Formula

**Heavy Goods Vehicle:**
```
Presumptive Income = ₹1,000 × Gross Vehicle Weight (tons) × Months Owned
```

**Light Goods Vehicle:**
```
Presumptive Income = ₹7,500 × Months Owned
```

### Example Calculation

**Scenario 1: Heavy Goods Vehicle**
- Gross Vehicle Weight: 20 tons
- Months Owned: 12
- Presumptive Income = ₹1,000 × 20 × 12 = ₹2,40,000

**Scenario 2: Light Goods Vehicle**
- Months Owned: 10
- Presumptive Income = ₹7,500 × 10 = ₹75,000

**Scenario 3: Mixed Fleet**
- 2 Heavy vehicles (20 tons each, 12 months) = ₹4,80,000
- 3 Light vehicles (12 months each) = ₹2,70,000
- Total Presumptive Income = ₹7,50,000

## Frontend Implementation

### Component

**File:** `frontend/src/features/income/presumptive/components/Section44AEForm.js`

**Key Features:**
- Toggle to enable/disable goods carriage income
- Add/remove vehicles
- Vehicle type selection (heavy/light)
- Gross vehicle weight input (for heavy vehicles)
- Months owned input
- Owned/leased selection
- Real-time presumptive income calculation
- Vehicle limit warning (max 10 vehicles)

### Integration

**File:** `frontend/src/pages/ITR/ITRComputation.js`

```javascript
// ITR-4 specific sections
const itr4Sections = (selectedITR === 'ITR-4' || selectedITR === 'ITR4') ? [
  {
    id: 'presumptiveIncome',
    title: 'Presumptive Income (44AD/44ADA)',
    icon: Calculator,
    description: 'Business income u/s 44AD, Professional income u/s 44ADA',
  },
  {
    id: 'goodsCarriage',
    title: 'Goods Carriage (44AE)',
    icon: FileText,
    description: 'Presumptive income from plying, hiring or leasing goods carriages',
  },
] : [];
```

**File:** `frontend/src/components/ITR/ComputationSection.js`

```javascript
case 'goodsCarriage':
  if (['ITR-4', 'ITR4'].includes(selectedITR)) {
    return (
      <Section44AEForm
        data={formData?.goodsCarriage || {}}
        onUpdate={(data) => onUpdate({ goodsCarriage: data })}
        filingId={filingId}
      />
    );
  }
  return null;
```

## Backend Implementation

### Tax Calculation

**File:** `backend/src/services/core/TaxComputationEngine.js`

```javascript
// Goods Carriage Income (ITR-4, Section 44AE)
if (filingData.goodsCarriage || filingData.income?.goodsCarriage) {
  const goodsCarriage = filingData.goodsCarriage || filingData.income.goodsCarriage;
  if (goodsCarriage.totalPresumptiveIncome) {
    // Use pre-calculated total if available
    totalIncome += parseFloat(goodsCarriage.totalPresumptiveIncome) || 0;
  } else if (goodsCarriage.vehicles && Array.isArray(goodsCarriage.vehicles)) {
    // Calculate from vehicles array
    const goodsCarriageIncome = goodsCarriage.vehicles.reduce((sum, vehicle) => {
      const monthsOwned = parseFloat(vehicle.monthsOwned) || 12;
      if (vehicle.type === 'heavy_goods') {
        // Heavy goods vehicle: ₹1,000 per ton per month
        const tons = parseFloat(vehicle.gvw) || 12;
        return sum + (1000 * tons * monthsOwned);
      } else {
        // Light goods vehicle: ₹7,500 per vehicle per month
        return sum + (7500 * monthsOwned);
      }
    }, 0);
    totalIncome += goodsCarriageIncome;
  }
}
```

**File:** `backend/src/services/business/TaxRegimeCalculator.js`

```javascript
// ITR-4: Handle goods carriage income (Section 44AE)
if (income.goodsCarriage) {
  const goodsCarriage = income.goodsCarriage;
  if (goodsCarriage.totalPresumptiveIncome) {
    total += parseFloat(goodsCarriage.totalPresumptiveIncome) || 0;
  } else if (goodsCarriage.vehicles && Array.isArray(goodsCarriage.vehicles)) {
    const goodsCarriageIncome = goodsCarriage.vehicles.reduce((sum, vehicle) => {
      const monthsOwned = parseFloat(vehicle.monthsOwned) || 12;
      if (vehicle.type === 'heavy_goods') {
        const tons = parseFloat(vehicle.gvw) || 12;
        return sum + (1000 * tons * monthsOwned);
      } else {
        return sum + (7500 * monthsOwned);
      }
    }, 0);
    total += goodsCarriageIncome;
  }
}
```

## JSON Export Integration

### Formatting Method

**File:** `frontend/src/services/itrJsonExportService.js`

```javascript
formatSection44AEForExport(goodsCarriage) {
  if (!goodsCarriage || !goodsCarriage.hasGoodsCarriage) {
    return {
      HasGoodsCarriage: false,
      Vehicles: [],
      TotalPresumptiveIncome: this.formatAmount(0),
      TotalVehicles: 0,
    };
  }

  const vehicles = (goodsCarriage.vehicles || []).map((vehicle) => {
    const monthsOwned = vehicle.monthsOwned || 12;
    let presumptiveIncome = 0;

    if (vehicle.type === 'heavy_goods') {
      const tons = vehicle.gvw || 12;
      presumptiveIncome = 1000 * tons * monthsOwned;
    } else {
      presumptiveIncome = 7500 * monthsOwned;
    }

    return {
      VehicleType: vehicle.type === 'heavy_goods' ? 'Heavy Goods Vehicle' : 'Other Goods Vehicle',
      RegistrationNumber: vehicle.registrationNo || vehicle.registrationNumber || '',
      GrossVehicleWeight: this.formatAmount(vehicle.gvw || 0),
      MonthsOwned: monthsOwned,
      OwnedOrLeased: vehicle.ownedOrLeased || 'owned',
      PresumptiveIncome: this.formatAmount(presumptiveIncome),
    };
  });

  return {
    HasGoodsCarriage: true,
    Vehicles: vehicles,
    TotalPresumptiveIncome: this.formatAmount(goodsCarriage.totalPresumptiveIncome || 0),
    TotalVehicles: goodsCarriage.totalVehicles || vehicles.length || 0,
  };
}
```

### ITR-4 JSON Export

```javascript
generateITR4Json(itrData, assessmentYear, user) {
  return {
    Form_ITR4: {
      // ... other sections ...
      ScheduleBP: {
        NatOfBus44AD: presumptiveBusiness.hasPresumptiveBusiness ? 'YES' : 'NO',
        PresumpIncDtls: {
          TotPresumpBusInc: this.formatAmount(presumptiveBusiness.presumptiveIncome || 0),
          GrossTurnoverReceipts: this.formatAmount(presumptiveBusiness.grossTurnover || 0),
        },
        PresumpProfDtls: presumptiveProfessional.hasPresumptiveProfessional ? {
          PresumpProfInc: this.formatAmount(presumptiveProfessional.presumptiveIncome || 0),
          GrossReceipts: this.formatAmount(presumptiveProfessional.grossReceipts || 0),
        } : {},
        Section44AE: this.formatSection44AEForExport(itrData.goodsCarriage || itrData.income?.goodsCarriage),
      },
      // ... rest of form ...
    },
  };
}
```

## Validation Rules

**File:** `frontend/src/components/ITR/core/ITRValidationEngine.js`

### Vehicle Limit Validation

```javascript
// ITR-4 specific rules
if (itrType === 'ITR-4' || itrType === 'ITR4') {
  // Section 44AE validation: Vehicle limit (max 10 vehicles)
  const goodsCarriage = formData.goodsCarriage || formData.income?.goodsCarriage;
  if (goodsCarriage?.hasGoodsCarriage) {
    const vehicleCount = goodsCarriage.vehicles?.length || 0;
    if (vehicleCount > 10) {
      errors.push(
        `Section 44AE is applicable only if you own not more than 10 goods carriages. ` +
        `You have declared ${vehicleCount} vehicles. Please reduce the number of vehicles or use regular business income accounting.`,
      );
    }
  }
}
```

### Frontend Component Validation

**File:** `frontend/src/features/income/presumptive/components/Section44AEForm.js`

```javascript
// Check if exceeds vehicle limit
const exceedsVehicleLimit = vehicles.length >= MAX_VEHICLES; // MAX_VEHICLES = 10

// Show warning when limit is reached
{exceedsVehicleLimit && (
  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
    <p className="text-sm text-red-800">
      Maximum 10 vehicles allowed for Section 44AE. You have reached the limit.
    </p>
  </div>
)}
```

## Testing Scenarios

### Test Case 1: Add Heavy Goods Vehicle

**Steps:**
1. Select ITR-4
2. Navigate to "Goods Carriage (44AE)" section
3. Enable "I have income from goods carriage business"
4. Click "Add Vehicle"
5. Select "Heavy Goods Vehicle"
6. Enter GVW: 20 tons
7. Enter Months Owned: 12
8. Save

**Expected:**
- Presumptive Income = ₹1,000 × 20 × 12 = ₹2,40,000
- Vehicle appears in list
- Total presumptive income updates

### Test Case 2: Add Light Goods Vehicle

**Steps:**
1. Add vehicle
2. Select "Other Goods Vehicle"
3. Enter Months Owned: 10
4. Save

**Expected:**
- Presumptive Income = ₹7,500 × 10 = ₹75,000
- Total includes both vehicles

### Test Case 3: Vehicle Limit Validation

**Steps:**
1. Add 10 vehicles
2. Try to add 11th vehicle

**Expected:**
- Warning message appears
- Add button is disabled
- Validation error on filing: "Section 44AE is applicable only if you own not more than 10 goods carriages"

### Test Case 4: JSON Export

**Steps:**
1. Add multiple vehicles (heavy and light)
2. Click "Download JSON"
3. Open downloaded JSON file

**Expected:**
- JSON contains `Section44AE` in `ScheduleBP`
- All vehicles are properly formatted
- Total presumptive income is calculated correctly
- Vehicle types are correctly identified

### Test Case 5: Tax Calculation

**Steps:**
1. Add goods carriage income
2. Add other income sources
3. View tax computation

**Expected:**
- Goods carriage income included in gross total income
- Tax calculated on total income including goods carriage
- Tax computation bar shows updated values

## Related Documentation

- [Technical Architecture](./TECHNICAL_ARCHITECTURE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Component Architecture](./COMPONENT_ARCHITECTURE.md)
- [ITR Platform Review Response](./ITR_PLATFORM_REVIEW_RESPONSE.md)

