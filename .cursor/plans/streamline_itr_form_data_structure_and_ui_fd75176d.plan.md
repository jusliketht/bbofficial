---
name: Streamline ITR Form Data Structure and UI
overview: Consolidate ITR form data structure under formData.income.*, remove redundancies, and reorganize UI to show all income sources in one unified section with expandable details. This will improve maintainability, reduce bugs, and enhance user experience.
todos:
  - id: perf-1-1
    content: Implement React.lazy() for all route components in App.js with Suspense boundaries
    status: completed
  - id: perf-1-2
    content: Split ITRComputation.js into smaller feature modules (Container, Header, Sidebar, Content, Footer)
    status: completed
  - id: perf-1-3
    content: Add useMemo/useCallback to expensive calculations and event handlers in ITRComputation.js
    status: completed
  - id: perf-1-4
    content: Implement React.memo for heavy components (ComputationSection, TaxComputationBar)
    status: completed
  - id: perf-1-5
    content: Analyze bundle size with webpack-bundle-analyzer and optimize imports
    status: completed
  - id: perf-2-1
    content: Add database query logging and identify N+1 query issues
    status: completed
  - id: perf-2-2
    content: Implement eager loading with proper include statements in ITRController
    status: completed
  - id: perf-2-3
    content: Add Redis caching for user profile data and tax computation results
    status: pending
  - id: perf-2-4
    content: Implement response compression and pagination for list endpoints
    status: completed
  - id: perf-3-1
    content: Standardize error handling patterns across all controllers
    status: completed
  - id: perf-3-2
    content: Extract common validation utilities and API response formatters
    status: completed
  - id: perf-4-1
    content: Analyze slow queries and add missing database indexes
    status: completed
  - id: perf-5-1
    content: Implement skeleton screens for all major components
    status: completed
  - id: perf-6-1
    content: Implement Web Vitals tracking and performance monitoring
    status: completed
---

# Streamline ITR Form Data Structure and UI

## Overview

This plan consolidates ITR form data structure, removes redundancies (especially professional income appearing in separate tabs and income sources), and reorganizes the UI to provide a unified, intuitive income entry experience across all ITR types.

## Current Issues Identified

1. **Data Structure Inconsistency:**

   - `formData.professionalIncome` vs `formData.income.professionalIncome` (both exist)
   - `formData.businessIncome` vs `formData.income.businessIncome` (inconsistent access)
   - Causes bugs in export services, tax computation, and validation

2. **UI Redundancy:**

   - Professional income has separate tab in ITR-3 sidebar but also conceptually part of "income sources"
   - Business income separate tab but should be in income section
   - Users navigate between tabs to enter related income data

3. **Code Duplication:**

   - Multiple transformation functions handling same data differently
   - Inconsistent access patterns across components

## Solution Approach

### Phase 1: Data Structure Consolidation

- Consolidate all income types under `formData.income.*`
- Update all components to use consistent access patterns
- Create migration utilities for backward compatibility

### Phase 2: UI Reorganization

- Integrate professional/business income into main "Income Sources" section
- Create reusable income source summary cards
- Remove redundant sidebar sections
- Implement expandable detail views

### Phase 3: Service Layer Updates

- Update export services, tax computation, validation
- Standardize data transformation functions
- Update backend API handlers

### Phase 4: Testing & Validation

- Test all ITR types (1-4)
- Verify data persistence and auto-save
- Validate tax computation accuracy

## Implementation Details

### Files to Modify

**Frontend:**

- `frontend/src/pages/ITR/ITRComputation.js` - Main form data structure
- `frontend/src/components/ITR/ComputationSection.js` - Section rendering logic
- `frontend/src/components/ITR/ITR3IncomeForm.js` - ITR-3 income form (if exists)
- `frontend/src/features/income/professional/components/ProfessionalIncomeForm.js` - Professional income form
- `frontend/src/features/income/business/components/BusinessIncomeForm.js` - Business income form
- `frontend/src/services/itrJsonExportService.js` - Export service
- `frontend/src/components/ITR/core/ITRValidationEngine.js` - Validation engine
- `frontend/src/components/ITR/TaxComputationBar.js` - Tax computation display
- `frontend/src/components/ITR/TaxCalculator.js` - Tax calculation logic

**Backend:**

- `backend/src/controllers/ITRController.js` - API handlers
- `backend/src/services/core/TaxComputationEngine.js` - Tax computation
- `backend/src/services/business/TaxRegimeCalculator.js` - Regime calculator

### New Components to Create

1. **IncomeSourceCard** - Reusable card showing income source summary with expand button
2. **IncomeSourceModal** - Modal for detailed income entry (professional/business)
3. **UnifiedIncomeSection** - Main income section component that renders all income sources

## Key Changes

1. **Data Structure:**
   ```javascript
   // Before (inconsistent)
   formData.professionalIncome
   formData.income.professionalIncome
   
   // After (consistent)
   formData.income.professionalIncome
   formData.income.businessIncome
   ```

2. **UI Structure:**

   - Remove `businessIncome` and `professionalIncome` from ITR-3 sidebar sections
   - Add them as expandable subsections within main "Income" section
   - Show summary cards with net income and "View Details" button
   - Clicking opens detailed form in modal or expandable panel

3. **Access Patterns:**

   - All income access via `formData.income.*`
   - Helper functions for safe access with defaults
   - Consistent transformation across all services