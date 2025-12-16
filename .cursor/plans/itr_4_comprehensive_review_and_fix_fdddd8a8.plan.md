---
name: ITR 4 Comprehensive Review and Fix
overview: Comprehensive review and fix of ITR 4 filing process covering all entry/exit points, JSON download, draft saving, form filtering, and ITR 4 specific validations and computations including presumptive taxation (Section 44AD, 44ADA, 44AE) with proper limits and calculations.
todos:
  - id: itr4-entry-points
    content: Review and fix all entry points for ITR-4, ensuring correct state initialization and localStorage recovery
    status: pending
  - id: itr4-exit-points
    content: Review and fix all exit points for ITR-4, ensuring proper data preservation and validation
    status: pending
  - id: itr4-json-export
    content: Fix ITR-4 JSON export to include all required fields (presumptive business/professional income, goods carriage Section 44AE)
    status: pending
  - id: itr4-draft-save-load
    content: Fix draft saving and loading for ITR-4 to preserve presumptive business, presumptive professional, and goods carriage structures
    status: pending
  - id: itr4-form-filtering
    content: Verify and fix form filtering for ITR-4 to show only applicable sections (presumptive income, goods carriage) and hide capital gains, foreign income, balance sheet, audit info
    status: pending
  - id: itr4-validations
    content: Add and verify ITR-4 specific validations (presumptive income limits ₹2 crores/₹50 lakhs, no capital gains, no foreign income, no balance sheet/audit info)
    status: pending
  - id: itr4-computations
    content: Fix computation logic for ITR-4 to correctly calculate presumptive income (8%/6% for business, 50% for profession) and goods carriage income
    status: pending
  - id: itr4-data-structure
    content: Ensure ITR-4 data structure consistency across form state, draft saving, JSON export, and validation
    status: pending
  - id: itr4-type-change
    content: Add ITR type change handling for ITR-4 with proper data sanitization and validation
    status: pending
---

# ITR 4 Comprehensive Review and Fix Plan

## Overview

This plan provides a thorough review and fix of the ITR 4 filing process, ensuring all entry/exit points work correctly, JSON download functions properly, drafts save/load correctly, and only ITR 4 specific forms are displayed with proper conditions and computations.

## Current State Analysis

### Entry Points

Same as ITR-1, ITR-2, and ITR-3:

1. **From DataSourceSelector** (`/itr/data-source`)
2. **From ITRFormSelection** (`/itr/form-selection`)
3. **From ITRDirectSelection** (`/itr/direct-selection`)
4. **From IncomeSourceSelector** (`/itr/income-sources`)
5. **From DocumentUploadHub** (`/itr/document-upload`)
6. **Direct Access via Draft/Filing ID**
7. **From Dashboard/Filing History**

### Exit Points

Same as other ITR types:

1. **Save Draft** → Stays on page, updates URL with draftId
2. **Submit ITR** → Navigates to `/itr/acknowledgment?filingId=xxx`
3. **Download JSON** → Downloads file, stays on page
4. **Back Navigation** → Returns to previous page based on entry point

### ITR-4 Specific Requirements

**Allowed Income Sources:**

- Salary income
- Presumptive business income (Section 44AD) - up to ₹2 crores gross receipts
- Presumptive professional income (Section 44ADA) - up to ₹50 lakhs gross receipts
- Goods carriage income (Section 44AE) - for plying, hiring, or leasing goods carriages
- House property (multiple properties allowed)
- Other sources (interest, dividends, etc.)

**Required Sections:**

- Personal Information
- Income Details (with presumptive income sub-sections)
- Presumptive Income (Section 44AD/44ADA/44AE)
- Goods Carriage (Section 44AE, if applicable)
- Exempt & Agricultural Income
- Deductions
- Taxes Paid
- Tax Computation
- Bank Details

**Not Allowed:**

- Business income (detailed P&L - must use presumptive)
- Professional income (detailed P&L - must use presumptive)
- Capital gains (must be 0 or undefined)
- Foreign income (must be undefined)
- Director/Partner income (must be undefined)
- Balance sheet (must be undefined)
- Audit information (must be undefined)
- Schedule FA (must be undefined)

**Key ITR-4 Specific Features:**

1. **Presumptive Business Income (Section 44AD)**:

- Maximum gross receipts: ₹2 crores
- Presumptive rate: 8% of gross receipts (6% for digital receipts)
- Can opt out to declare actual profit

2. **Presumptive Professional Income (Section 44ADA)**:

- Maximum gross receipts: ₹50 lakhs
- Presumptive rate: 50% of gross receipts
- Can opt out to declare actual income

3. **Goods Carriage Income (Section 44AE)**:

- For plying, hiring, or leasing goods carriages
- Maximum 10 goods carriages
- Heavy vehicle (above 12 MT): ₹1,000 per ton per month
- Other goods vehicle (up to 12 MT): ₹7,500 per vehicle per month

4. **Presumptive Income Limits**:

- Business: Gross receipts cannot exceed ₹2 crores (must use ITR-3 if exceeded)
- Professional: Gross receipts cannot exceed ₹50 lakhs (must use ITR-3 if exceeded)

### Current Issues Identified

1. **Entry Point Recovery**: Entry point stored in localStorage but may not be properly restored for ITR-4
2. **ITR Type Validation**: ITR type can be changed after entry, but validation may not catch incompatible data for ITR-4
3. **Form Filtering**: `shouldShowSection` function exists but may not cover all edge cases for ITR-4
4. **JSON Export**: ITR 4 specific fields may not be fully populated (presumptive income details, goods carriage)
5. **Draft Saving**: Draft saving may not preserve all ITR 4 specific data structures (presumptive business, presumptive professional, goods carriage)
6. **Computation Logic**: ITR 4 specific computations may not be isolated from other ITR types
7. **Presumptive Income Validation**: May not properly validate gross receipts limits (₹2 crores for business, ₹50 lakhs for profession)
8. **Capital Gains/Foreign Income Validation**: May not properly prevent capital gains and foreign income for ITR-4

## Implementation Tasks

### Task 1: Entry Points Review and Fix

**Files to Review:**

- `frontend/src/pages/ITR/ITRComputation.js` (lines 125-190, 191-213)
- `frontend/src/components/ITR/DataSourceSelector.js`
- `frontend/src/pages/ITR/ITRFormSelection.js`
- `frontend/src/pages/ITR/ITRDirectSelection.js`
- `frontend/src/pages/ITR/IncomeSourceSelector.js`
- `frontend/src/pages/ITR/DocumentUploadHub.js`

**Actions:**

1. Verify all entry points pass correct state for ITR-4
2. Ensure `selectedITR` is set to 'ITR-4' when appropriate
3. Fix entry point recovery from localStorage on page refresh for ITR-4
4. Add route guard to prevent invalid ITR type changes for ITR-4
5. Ensure `selectedPerson` is always available for ITR-4

**Validation:**

- Test each entry point with ITR-4 selection
- Verify state is correctly passed and restored
- Test page refresh recovery

### Task 2: Exit Points Review and Fix

**Files to Review:**

- `frontend/src/pages/ITR/ITRComputation.js` (lines 2690-2900, 2732-2804)

**Actions:**

1. Verify draft saving preserves all ITR-4 data (presumptive business, presumptive professional, goods carriage)
2. Ensure JSON download includes all ITR-4 specific fields
3. Fix submission flow to properly validate ITR-4 before exit (presumptive income limits)
4. Ensure acknowledgment navigation includes all required data
5. Add proper cleanup on exit (clear temporary data, etc.)

**Validation:**

- Test draft save and reload for ITR-4
- Test JSON download for ITR-4
- Test submission and verify acknowledgment page receives correct data

### Task 3: JSON Download Functionality Fix

**Files to Review:**

- `frontend/src/services/itrJsonExportService.js` (lines 716-797, 276-283)
- `frontend/src/pages/ITR/ITRComputation.js` (lines 2586-2630)

**Actions:**

1. Verify ITR-4 specific fields are correctly populated in JSON export:

- `Form_ITR4.ScheduleBP.NatOfBus44AD`
- `Form_ITR4.ScheduleBP.PresumpIncDtls` (presumptive business income)
- `Form_ITR4.ScheduleBP.PresumpProfDtls` (presumptive professional income)
- `Form_ITR4.ScheduleBP.Section44AE` (goods carriage income)

2. Ensure presumptive business income details are properly mapped
3. Ensure presumptive professional income details are properly mapped
4. Ensure goods carriage income (Section 44AE) is properly formatted
5. Add validation to ensure JSON is ITR-4 compliant before download
6. Fix any missing field mappings for ITR-4

**Validation:**

- Generate JSON for ITR-4 with all sections filled
- Verify JSON structure matches ITD requirements
- Test JSON validation before download

### Task 4: Draft Saving and Loading Fix

**Files to Review:**

- `frontend/src/pages/ITR/ITRComputation.js` (lines 2690-2900, 2422-2478, 1899-1995)
- `frontend/src/services/api/itrService.js` (lines 21-49)

**Actions:**

1. Ensure draft saving includes:

- `selectedITR` (must be 'ITR-4' or 'ITR4')
- Complete `formData` structure
- `assessmentYear`
- `taxRegime`
- `selectedPerson`
- Presumptive business income structure (with `hasPresumptiveBusiness`, `grossReceipts`, `presumptiveRate`, `presumptiveIncome`, `optedOut`)
- Presumptive professional income structure (with `hasPresumptiveProfessional`, `grossReceipts`, `presumptiveRate`, `presumptiveIncome`, `optedOut`)
- Goods carriage data (if applicable)

2. Fix draft loading to restore ITR-4 specific data structures
3. Ensure draft updates preserve ITR-4 constraints
4. Add validation to prevent saving invalid ITR-4 data
5. Fix auto-save functionality for ITR-4

**Validation:**

- Save draft with ITR-4 data
- Reload page and verify draft loads correctly
- Verify all ITR-4 specific fields are preserved
- Test auto-save functionality

### Task 5: ITR-4 Specific Form Filtering

**Files to Review:**

- `frontend/src/pages/ITR/ITRComputation.js` (lines 3586-3601, 2706-2746)
- `frontend/src/components/ITR/ComputationSection.js` (lines 209-220)

**Actions:**

1. Verify `shouldShowSection` correctly hides:

- `businessIncome` section (detailed P&L)
- `professionalIncome` section (detailed P&L)
- `balanceSheet` section
- `auditInfo` section
- `scheduleFA` section
- Capital gains (in income section)

2. Verify `shouldShowSection` correctly shows:

- `presumptiveIncome` section
- `goodsCarriage` section (if applicable)

3. Ensure income section shows:

- Salary income
- House property (multiple properties allowed)
- Presumptive business income (via presumptive income section)
- Presumptive professional income (via presumptive income section)
- Goods carriage income (via goods carriage section)
- Other sources (interest, dividends, etc.)
- NO capital gains sub-section
- NO foreign income sub-section
- NO director/partner income sub-section
- NO business income sub-section (detailed)
- NO professional income sub-section (detailed)

4. Add runtime validation to prevent showing hidden sections
5. Ensure section titles are ITR-4 specific

**Validation:**

- Verify only ITR-4 sections are visible
- Test section filtering when ITR type is changed
- Verify section titles are correct for ITR-4
- Verify presumptive income and goods carriage sections appear when applicable

### Task 6: ITR-4 Specific Validations and Computations

**Files to Review:**

- `frontend/src/components/ITR/core/ITRValidationEngine.js` (lines 641-667)
- `frontend/src/pages/ITR/ITRComputation.js` (lines 3285-3295, 2732-2804)

**Actions:**

1. Verify ITR-4 validation rules:

- Presumptive business income limit: Gross receipts cannot exceed ₹2 crores
- Presumptive professional income limit: Gross receipts cannot exceed ₹50 lakhs
- No capital gains (must be 0)
- No foreign income (must be undefined)
- No director/partner income (must be undefined)
- No balance sheet (must be undefined)
- No audit info (must be undefined)
- No Schedule FA (must be undefined)
- No detailed business income structure (must use presumptive)
- No detailed professional income structure (must use presumptive)

2. Ensure validation runs on:

- Form data changes
- Before draft save
- Before JSON export
- Before submission

3. Fix computation logic to:

- Only calculate ITR-4 applicable income
- Include presumptive business income (8% or 6% of gross receipts)
- Include presumptive professional income (50% of gross receipts)
- Include goods carriage income (Section 44AE calculation)
- Include house property income
- Include salary income
- Include other sources income
- Exclude capital gains from calculations
- Exclude foreign income from calculations
- Exclude director/partner income from calculations
- Exclude detailed business/professional income from calculations

4. Add real-time validation feedback for ITR-4 violations

**Validation:**

- Test validation with invalid ITR-4 data (e.g., gross receipts exceeding limits, capital gains > 0)
- Verify error messages are clear and actionable
- Test computation with ITR-4 specific scenarios
- Test presumptive income limit validation

### Task 7: Data Structure Consistency

**Files to Review:**

- `frontend/src/pages/ITR/ITRComputation.js` (lines 264-277)
- `frontend/src/services/itrJsonExportService.js`

**Actions:**

1. Ensure formData structure for ITR-4:

- `income.presumptiveBusiness` should be an object with `hasPresumptiveBusiness`, `grossReceipts`, `presumptiveRate`, `presumptiveIncome`, `optedOut`
- `income.presumptiveProfessional` should be an object with `hasPresumptiveProfessional`, `grossReceipts`, `presumptiveRate`, `presumptiveIncome`, `optedOut`
- `goodsCarriage` should be an object with `hasGoodsCarriage`, vehicle details, etc. (if applicable)
- `income.capitalGains` should be `0` (not an object)
- `income.foreignIncome` should be `undefined`
- `income.directorPartner` should be `undefined`
- `income.businessIncome` should be `0` (not an object with businesses array)
- `income.professionalIncome` should be `0` (not an object with professions array)
- `income.houseProperty.properties` should be an array (multiple properties allowed)
- No `balanceSheet` object
- No `auditInfo` object
- No `scheduleFA` object

2. Fix initialization to set correct defaults for ITR-4
3. Ensure data structure is consistent across:

- Form state
- Draft saving
- JSON export
- Validation

**Validation:**

- Verify formData structure matches ITR-4 requirements
- Test data consistency across save/load/export

### Task 8: ITR Type Change Handling

**Files to Review:**

- `frontend/src/pages/ITR/ITRComputation.js` (lines 3525-3562)

**Actions:**

1. Add validation when changing to ITR-4
2. Automatically sanitize form data when switching to ITR-4:

- Ensure business income is 0 (not an object)
- Ensure professional income is 0 (not an object)
- Ensure capital gains is 0 (not an object)
- Remove foreign income if it exists
- Remove director/partner income if it exists
- Remove balance sheet if it exists
- Remove audit info if it exists
- Remove Schedule FA if it exists
- Initialize presumptive business and professional income if they don't exist

3. Add validation to prevent switching from ITR-4 if data is incompatible

**Validation:**

- Test switching to ITR-4 from other ITR types
- Test switching from ITR-4 to other ITR types
- Verify data is properly sanitized

## Testing Checklist

### Entry Points

- [ ] DataSourceSelector → ITR-4 computation
- [ ] ITRFormSelection → ITR-4 computation
- [ ] ITRDirectSelection → ITR-4 computation
- [ ] IncomeSourceSelector → ITR-4 computation
- [ ] DocumentUploadHub → ITR-4 computation
- [ ] Direct draft/filing ID access
- [ ] Dashboard/Filing History → ITR-4 computation
- [ ] Page refresh recovery

### Exit Points

- [ ] Save draft and reload
- [ ] Submit ITR and verify acknowledgment
- [ ] Download JSON and verify structure
- [ ] Back navigation from various entry points

### JSON Download

- [ ] JSON contains all ITR-4 specific fields
- [ ] JSON structure is ITD compliant
- [ ] JSON validation works correctly
- [ ] File download triggers correctly
- [ ] Presumptive business income details properly formatted
- [ ] Presumptive professional income details properly formatted
- [ ] Goods carriage income (Section 44AE) included if applicable

### Draft Saving

- [ ] Draft saves all ITR-4 data
- [ ] Draft loads correctly on page refresh
- [ ] Draft updates preserve ITR-4 constraints
- [ ] Auto-save works for ITR-4
- [ ] Presumptive business income structure preserved
- [ ] Presumptive professional income structure preserved
- [ ] Goods carriage data preserved

### Form Filtering

- [ ] Only ITR-4 sections are visible
- [ ] Hidden sections are not accessible
- [ ] Section titles are ITR-4 specific
- [ ] Income section shows only ITR-4 fields
- [ ] Presumptive income section appears
- [ ] Goods carriage section appears when applicable
- [ ] Capital gains section is hidden
- [ ] Foreign income section is hidden
- [ ] Business income (detailed) section is hidden
- [ ] Professional income (detailed) section is hidden

### Validations

- [ ] Presumptive business income limit validation (₹2 crores)
- [ ] Presumptive professional income limit validation (₹50 lakhs)
- [ ] Capital gains validation (must be 0)
- [ ] Foreign income validation (must be undefined)
- [ ] Director/Partner income validation (must be undefined)
- [ ] Balance sheet validation (must be undefined)
- [ ] Audit info validation (must be undefined)
- [ ] Schedule FA validation (must be undefined)
- [ ] Real-time validation feedback

### Computations

- [ ] Total income calculation (ITR-4 only)
- [ ] Tax computation (ITR-4 specific)
- [ ] Presumptive business income included in calculations (8% or 6% of gross receipts)
- [ ] Presumptive professional income included in calculations (50% of gross receipts)
- [ ] Goods carriage income included in calculations (Section 44AE)
- [ ] House property included in calculations
- [ ] Salary income included in calculations
- [ ] Other sources included in calculations
- [ ] Capital gains excluded from calculations
- [ ] Foreign income excluded from calculations
- [ ] Director/Partner income excluded from calculations
- [ ] Deductions calculation
- [ ] Final tax payable

## Deliverables

1. **Fixed Entry Points**: All entry points correctly initialize ITR-4
2. **Fixed Exit Points**: All exit points work correctly with proper data preservation
3. **Working JSON Download**: ITR-4 JSON export is complete and compliant
4. **Working Draft Save/Load**: Drafts save and load correctly for ITR-4
5. **Proper Form Filtering**: Only ITR-4 sections are displayed
6. **Complete Validations**: All ITR-4 validation rules are enforced
7. **Correct Computations**: All calculations are ITR-4 specific
8. **Presumptive Income Validation**: Presumptive income limits are properly validated
9. **Capital Gains/Foreign Income Prevention**: Capital gains and foreign income are properly prevented

## Files to Modify

1. `frontend/src/pages/ITR/ITRComputation.js` - Main computation page
2. `frontend/src/services/itrJsonExportService.js` - JSON export service
3. `frontend/src/components/ITR/core/ITRValidationEngine.js` - Validation engine
4. `frontend/src/components/ITR/ComputationSection.js` - Section rendering
5. `frontend/src/services/api/itrService.js` - Draft service (if needed)

## Success Criteria

1. All entry points correctly initialize ITR-4 with proper state
2. JSON download generates complete, ITD-compliant ITR-4 JSON
3. Drafts save and load correctly with all ITR-4 data preserved
4. Only ITR-4 specific forms/sections are displayed
5. All ITR-4 validation rules are enforced with clear error messages
6. All computations are ITR-4 specific and accurate
7. Exit points (save, submit, download) work correctly
8. Presumptive income limits are properly validated (₹2 crores for business, ₹50 lakhs for profession)
9. Capital gains and foreign income are properly prevented
10. Presumptive business and professional income structures are correctly maintained