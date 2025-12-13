# ITR Component Architecture Documentation

## Overview

This document provides detailed documentation of the React component architecture for ITR forms, including component hierarchy, props, state management, and interaction patterns.

## Table of Contents

1. [Component Hierarchy](#component-hierarchy)
2. [Core Components](#core-components)
3. [Form Components](#form-components)
4. [Service Components](#service-components)
5. [State Management](#state-management)
6. [Data Flow](#data-flow)
7. [Props Interface](#props-interface)
8. [Hooks Usage](#hooks-usage)

## Component Hierarchy

### Complete Component Tree

```
ITRComputation (Root Container)
│
├── ITRComputationHeader
│   ├── ITRTypeSelector / ITRToggle
│   ├── YearSelector
│   ├── TaxRegimeToggle / RegimeToggle
│   ├── PauseResumeButton
│   ├── InvoiceBadge
│   └── Action Buttons (Save, Export, etc.)
│
├── ITRComputationContent
│   ├── TaxComputationBar
│   │   ├── CompactFlowItem (Income)
│   │   ├── CompactFlowItem (Deductions)
│   │   ├── CompactFlowItem (Tax)
│   │   ├── ResultBadge
│   │   └── RegimeBadge
│   │
│   ├── ComputationSection (Section Router)
│   │   ├── Case: 'personalInfo'
│   │   │   └── PersonalInfoForm
│   │   │
│   │   ├── Case: 'income'
│   │   │   ├── ITR-1: Salary + House Property + Other Sources
│   │   │   ├── ITR-2: ITR2IncomeForm
│   │   │   │   ├── SalaryForm
│   │   │   │   ├── HousePropertyForm
│   │   │   │   ├── CapitalGainsForm
│   │   │   │   ├── ForeignIncomeForm
│   │   │   │   ├── DirectorPartnerIncomeForm
│   │   │   │   └── OtherSourcesForm
│   │   │   │
│   │   │   ├── ITR-3: ITR3IncomeForm (Unified Income Section)
│   │   │   │   ├── SubSection: Salary Income
│   │   │   │   │   └── SalaryForm
│   │   │   │   ├── SubSection: Business Income
│   │   │   │   │   └── BusinessIncomeForm
│   │   │   │   │       ├── AISBusinessPopup
│   │   │   │   │       └── Business Income Breakdown
│   │   │   │   ├── SubSection: Professional Income
│   │   │   │   │   └── ProfessionalIncomeForm
│   │   │   │   │       ├── AISProfessionalPopup
│   │   │   │   │       └── Professional Income Breakdown
│   │   │   │   ├── SubSection: House Property
│   │   │   │   │   └── HousePropertyForm
│   │   │   │   ├── SubSection: Capital Gains
│   │   │   │   │   └── CapitalGainsForm
│   │   │   │   ├── SubSection: Foreign Income
│   │   │   │   │   └── ForeignIncomeForm
│   │   │   │   ├── SubSection: Director/Partner Income
│   │   │   │   │   └── DirectorPartnerIncomeForm
│   │   │   │   └── SubSection: Other Sources
│   │   │   │       └── OtherSourcesForm
│   │   │   │
│   │   │   └── ITR-4: ITR4IncomeForm
│   │   │       ├── SalaryForm
│   │   │       ├── PresumptiveIncomeForm
│   │   │       ├── Section44AEForm
│   │   │       ├── HousePropertyForm
│   │   │       └── OtherSourcesForm
│   │   │
│   │   ├── Case: 'deductions'
│   │   │   └── DeductionsManager
│   │   │
│   │   ├── Case: 'taxesPaid'
│   │   │   └── TaxesPaidForm
│   │   │
│   │   ├── Case: 'taxComputation'
│   │   │   └── TaxCalculator
│   │   │
│   │   ├── Case: 'balanceSheet' (ITR-3 only)
│   │   │   └── BalanceSheetForm
│   │   │
│   │   ├── Case: 'auditInfo' (ITR-3 only)
│   │   │   └── AuditInformationForm
│   │   │
│   │   └── Case: 'scheduleFA' (ITR-2, ITR-3)
│   │       └── ScheduleFA
│   │
│   └── ComputationSheet
│
└── ComputationSidebar
    └── Section Navigation (Dynamic based on ITR type)
```

## Core Components

### ITRComputation

**Location:** `frontend/src/pages/ITR/ITRComputation.js`

**Purpose:** Main container component for ITR filing.

**Key Responsibilities:**
- Form data state management
- Auto-save orchestration
- Tax computation triggering
- Draft loading/saving
- Section navigation state
- Real-time validation

**State:**
```javascript
const [formData, setFormData] = useState({
  personalInfo: {},
  income: {
    // Consolidated structure
    businessIncome: {},
    professionalIncome: {},
    // ... other income types
  },
  deductions: {},
  taxesPaid: {},
});

const [selectedITR, setSelectedITR] = useState('ITR-1');
const [taxComputation, setTaxComputation] = useState(null);
const [activeSectionId, setActiveSectionId] = useState('personalInfo');
```

**Key Hooks:**
- `useAutoSave`: Debounced auto-save
- `useRealTimeValidation`: Real-time form validation
- `useEffect`: Tax computation triggers

**Props:** None (uses React Router params)

### ITRComputationHeader

**Location:** `frontend/src/components/ITR/ITRComputationHeader.js`

**Purpose:** Header section with ITR type selector, regime toggle, and actions.

**Props:**
```typescript
{
  selectedITR: string;
  onITRChange: (itrType: string) => void;
  selectedRegime: 'old' | 'new';
  onRegimeChange: (regime: 'old' | 'new') => void;
  assessmentYear: string;
  onYearChange: (year: string) => void;
  onSave: () => void;
  onExport: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}
```

### ITRComputationContent

**Location:** `frontend/src/components/ITR/ITRComputationContent.js`

**Purpose:** Main content area with tax computation bar and section router.

**Props:**
```typescript
{
  formData: object;
  onUpdate: (updates: object) => void;
  selectedITR: string;
  taxComputation: object | null;
  isComputingTax: boolean;
  activeSectionId: string;
  onSectionChange: (sectionId: string) => void;
}
```

### ComputationSection

**Location:** `frontend/src/components/ITR/ComputationSection.js`

**Purpose:** Section router that renders appropriate form component based on section ID.

**Props:**
```typescript
{
  id: string;  // Section ID: 'income', 'deductions', etc.
  title: string;
  icon: React.ComponentType;
  description: string;
  isExpanded: boolean;
  onToggle: () => void;
  formData: object;
  onUpdate: (updates: object) => void;
  selectedITR: string;
  fullFormData: object;
  onDataUploaded: (data: object) => void;
}
```

**Section Routing Logic:**
```javascript
switch (id) {
  case 'income':
    if (selectedITR === 'ITR-2') return <ITR2IncomeForm />;
    if (selectedITR === 'ITR-3') return <ITR3IncomeForm />;
    if (selectedITR === 'ITR-4') return <ITR4IncomeForm />;
    return <ITR1IncomeForm />;  // Default for ITR-1
    
  case 'businessIncome':
    // Removed - now part of income section
    
  case 'professionalIncome':
    // Removed - now part of income section
    
  // ... other cases
}
```

### TaxComputationBar

**Location:** `frontend/src/components/ITR/TaxComputationBar.js`

**Purpose:** Real-time tax computation display at top of page.

**Props:**
```typescript
{
  formData: object;
  taxComputation: object | null;
  selectedRegime: 'old' | 'new';
  isComputingTax: boolean;
}
```

**Features:**
- Shows gross income, deductions, net tax
- Displays both old and new regime results
- Loading indicator during computation
- Client-side fallback calculation

## Form Components

### ITR3IncomeForm

**Location:** `frontend/src/components/ITR/ComputationSection.js` (inline component)

**Purpose:** Unified income section for ITR-3 containing all income sources.

**Structure:**
```javascript
<ITR3IncomeForm>
  <SubSection title="Salary Income">
    <SalaryForm />
  </SubSection>
  
  <SubSection title="Business Income">
    <BusinessIncomeForm
      data={data.income?.businessIncome || data.businessIncome || {}}
      onUpdate={handleBusinessIncomeUpdate}
    />
  </SubSection>
  
  <SubSection title="Professional Income">
    <ProfessionalIncomeForm
      data={data.income?.professionalIncome || data.professionalIncome || {}}
      onUpdate={handleProfessionalIncomeUpdate}
    />
  </SubSection>
  
  {/* Other income sources... */}
</ITR3IncomeForm>
```

**Update Handlers:**
```javascript
const handleBusinessIncomeUpdate = (updates) => {
  const currentIncome = data.income || {};
  onUpdate({
    income: {
      ...currentIncome,
      businessIncome: {
        ...(currentIncome.businessIncome || data.businessIncome || {}),
        ...updates,
      },
    },
  });
};
```

### BusinessIncomeForm

**Location:** `frontend/src/features/income/business/components/BusinessIncomeForm.js`

**Purpose:** Form for entering business income with P&L details (ITR-3).

**Props:**
```typescript
{
  filingId: string;
  data: {
    businesses: Array<{
      businessName: string;
      businessNature: string;
      pnl: {
        grossReceipts: number;
        expenses: object;
        netProfit: number;
      };
    }>;
  };
  onUpdate: (updates: object) => void;
  selectedITR: string;
  onDataUploaded: (data: object) => void;
}
```

**Features:**
- Multiple businesses support
- Detailed P&L statement entry
- AIS data integration
- Expense categorization
- Depreciation calculation

### ProfessionalIncomeForm

**Location:** `frontend/src/features/income/professional/components/ProfessionalIncomeForm.js`

**Purpose:** Form for entering professional income with expenses (ITR-3).

**Props:**
```typescript
{
  filingId: string;
  data: {
    professions: Array<{
      professionName: string;
      professionType: string;
      pnl: {
        professionalFees: number;
        expenses: object;
        depreciation: object;
        netIncome: number;
      };
    }>;
  };
  onUpdate: (updates: object) => void;
  selectedITR: string;
  onDataUploaded: (data: object) => void;
}
```

**Features:**
- Multiple professions support
- Professional fees and expenses
- Depreciation calculation
- AIS data integration
- Net income calculation

## Service Components

### FormDataService

**Location:** `frontend/src/services/FormDataService.js`

**Purpose:** Centralized service for all form data operations.

**Methods:**
```javascript
class FormDataService {
  // Save form data for a section or all data
  async saveFormData(section, data, draftId)
  
  // Load all form data for a draft
  async loadFormData(draftId, useCache = true)
  
  // Load data for a specific section
  async loadSectionData(draftId, section)
  
  // Clear cache
  clearCache(draftId)
}
```

**Usage:**
```javascript
import formDataService from '../services/FormDataService';

// Save entire form data
await formDataService.saveFormData('all', formData, draftId);

// Save specific section
await formDataService.saveFormData('income', incomeData, draftId);

// Load form data
const formData = await formDataService.loadFormData(draftId);
```

### useAutoSave Hook

**Location:** `frontend/src/hooks/useAutoSave.js`

**Purpose:** Debounced auto-save with visual indicators and offline support.

**API:**
```javascript
const {
  saveStatus,        // 'idle' | 'saving' | 'saved' | 'error' | 'offline'
  lastSavedAt,       // Date | null
  pendingChanges,    // boolean
  isOnline,          // boolean
  forceSave,         // () => Promise<void>
  clearBackup,       // () => void
} = useAutoSave({
  saveFn: async (data) => {
    return await formDataService.saveFormData('all', data, draftId);
  },
  data: formData,
  debounceMs: 3000,
  localStorageKey: `itr-draft-${draftId}`,
  enabled: true,
  onSaveSuccess: (savedData) => {},
  onSaveError: (error) => {},
});
```

**Features:**
- 3-second debounce
- localStorage backup
- Offline support with sync on reconnect
- Visual status indicators
- Retry mechanism

## State Management

### Form Data State

**Location:** `ITRComputation` component

**Structure:**
```javascript
const [formData, setFormData] = useState({
  personalInfo: {
    pan: string,
    name: string,
    dateOfBirth: string,
    address: object,
  },
  income: {
    // Consolidated structure
    salary: number | object,
    businessIncome: object | number,
    professionalIncome: object | number,
    // ... other income types
  },
  deductions: object,
  taxesPaid: object,
  balanceSheet: object,  // ITR-3 only
  auditInfo: object,  // ITR-3 only
});
```

### Update Pattern

```javascript
// Pattern 1: Update entire section
const handleUpdate = useCallback((updates) => {
  setFormData(prev => ({
    ...prev,
    ...updates,
  }));
}, []);

// Pattern 2: Update nested income property
const handleIncomeUpdate = useCallback((incomeUpdates) => {
  setFormData(prev => ({
    ...prev,
    income: {
      ...prev.income,
      ...incomeUpdates,
    },
  }));
}, []);

// Pattern 3: Update specific income type
const handleBusinessIncomeUpdate = useCallback((businessUpdates) => {
  setFormData(prev => ({
    ...prev,
    income: {
      ...prev.income,
      businessIncome: {
        ...(prev.income?.businessIncome || {}),
        ...businessUpdates,
      },
    },
  }));
}, []);
```

## Data Flow

### Update Flow

```
User Input (e.g., BusinessIncomeForm)
    │
    ├─> onUpdate({ businesses: [...] })
    │
    ├─> ITR3IncomeForm.handleBusinessIncomeUpdate()
    │       │
    │       └─> onUpdate({
    │               income: {
    │                 businessIncome: { businesses: [...] }
    │               }
    │             })
    │
    ├─> ITRComputation.handleUpdate()
    │       │
    │       ├─> setFormData(updated)
    │       │
    │       └─> useAutoSave Hook (Debounced)
    │               │
    │               ├─> FormDataService.saveFormData()
    │               │       │
    │               │       └─> API: PUT /api/itr/drafts/:draftId
    │               │
    │               └─> localStorage Backup
    │
    └─> Tax Computation Trigger
            │
            ├─> calculateClientSideTax() (Immediate)
            │       └─> Update TaxComputationBar
            │
            └─> API: POST /api/itr/drafts/:draftId/compute
                    │
                    └─> Update TaxComputationBar (Server result)
```

### Load Flow

```
Component Mount (ITRComputation)
    │
    ├─> useEffect: Load Draft
    │       │
    │       ├─> API: GET /api/itr/drafts/:draftId
    │       │       │
    │       │       └─> Response: { formData }
    │       │
    │       ├─> migrateFormDataStructure(formData)
    │       │       │
    │       │       └─> Migrate old structure to new
    │       │
    │       └─> setFormData(migratedData)
    │
    └─> Render Components
            │
            ├─> ComputationSection
            │       │
            │       └─> ITR3IncomeForm
            │               │
            │               └─> BusinessIncomeForm
            │                       │
            │                       └─> data={formData.income?.businessIncome || {}}
```

## Props Interface

### Common Props Pattern

All form components follow this pattern:

```typescript
interface FormComponentProps {
  // Data
  data: object;  // Section-specific data
  formData?: object;  // Full form data (if needed)
  fullFormData?: object;  // Full form data with metadata
  
  // Callbacks
  onUpdate: (updates: object) => void;  // Update section data
  onDataUploaded?: (data: object) => void;  // AIS/OCR data uploaded
  
  // Context
  selectedITR: string;  // 'ITR-1' | 'ITR-2' | 'ITR-3' | 'ITR-4'
  filingId?: string;  // For AIS integration
  
  // Optional
  autoFilledFields?: object;  // Auto-filled field indicators
  sources?: object;  // Data source information
  fieldVerificationStatuses?: object;  // Field verification status
  fieldSources?: object;  // Field data sources
}
```

## Hooks Usage

### useAutoSave

**Purpose:** Debounced auto-save with visual feedback.

**Usage:**
```javascript
const { saveStatus, lastSavedAt } = useAutoSave({
  saveFn: async (data) => {
    return await formDataService.saveFormData('all', data, draftId);
  },
  data: formData,
  debounceMs: 3000,
  localStorageKey: `itr-draft-${draftId}`,
  enabled: !!draftId,
});
```

### useRealTimeValidation

**Purpose:** Real-time form validation.

**Usage:**
```javascript
const { errors, warnings, isValid } = useRealTimeValidation({
  formData,
  selectedITR,
  validationEngine: ITRValidationEngine,
});
```

### useMemo for Expensive Calculations

**Purpose:** Memoize expensive calculations.

**Usage:**
```javascript
const grossIncome = useMemo(() => {
  const income = formData.income || {};
  // Expensive calculation
  return calculateGrossIncome(income);
}, [formData.income]);
```

### useCallback for Event Handlers

**Purpose:** Memoize event handlers.

**Usage:**
```javascript
const handleUpdate = useCallback((updates) => {
  setFormData(prev => ({
    ...prev,
    ...updates,
  }));
}, []);
```

## Component Communication

### Parent to Child

- Props: Data and callbacks passed down
- Context: Shared state via React Context (if used)

### Child to Parent

- Callbacks: `onUpdate`, `onDataUploaded` callbacks
- State Lifting: Updates bubble up through callbacks

### Sibling Components

- Shared State: Common parent state (ITRComputation)
- Event Bus: Not used (prefer state lifting)

## Performance Optimizations

### Memoization

1. **React.memo**: Heavy components (ComputationSection, TaxComputationBar)
2. **useMemo**: Expensive calculations (gross income, deductions)
3. **useCallback**: Event handlers passed to children

### Code Splitting

1. **React.lazy**: Route components
2. **Dynamic Imports**: Heavy form components

### Rendering Optimization

1. **Conditional Rendering**: Only render active section
2. **Virtual Scrolling**: For long lists (if needed)
3. **Debouncing**: Auto-save and validation

## Error Handling

### Component Level

```javascript
// Error boundary for component crashes
<ErrorBoundary>
  <ComputationSection />
</ErrorBoundary>
```

### Form Level

```javascript
// Try-catch in update handlers
const handleUpdate = async (updates) => {
  try {
    await onUpdate(updates);
  } catch (error) {
    toast.error(getErrorMessage(error));
  }
};
```

### Service Level

```javascript
// Error handling in services
try {
  await formDataService.saveFormData('all', formData, draftId);
} catch (error) {
  // Retry logic
  // Fallback to localStorage
  // Show error to user
}
```

