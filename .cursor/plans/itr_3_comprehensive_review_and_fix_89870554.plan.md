---
name: ITR 3 Comprehensive Review and Fix
overview: Comprehensive review and fix of ITR 3 filing process covering all entry/exit points, JSON download, draft saving, form filtering, and ITR 3 specific validations and computations including business income, professional income, balance sheet, and audit information.
todos:
  - id: itr3-entry-points
    content: Review and fix all entry points for ITR-3, ensuring correct state initialization and localStorage recovery
    status: pending
  - id: itr3-exit-points
    content: Review and fix all exit points for ITR-3, ensuring proper data preservation and validation
    status: pending
  - id: itr3-json-export
    content: Fix ITR-3 JSON export to include all required fields (balance sheet, audit info, business/professional income details)
    status: pending
  - id: itr3-draft-save-load
    content: Fix draft saving and loading for ITR-3 to preserve business income, professional income, balance sheet, and audit info structures
    status: pending
  - id: itr3-form-filtering
    content: Verify and fix form filtering for ITR-3 to show only applicable sections (business income, professional income, balance sheet, audit info)
    status: pending
  - id: itr3-validations
    content: Add and verify ITR-3 specific validations (balance sheet balance, audit info when applicable, business/professional income structure)
    status: pending
  - id: itr3-computations
    content: Fix computation logic for ITR-3 to correctly calculate income from businesses and professions arrays
    status: pending
  - id: itr3-data-structure
    content: Ensure ITR-3 data structure consistency across form state, draft saving, JSON export, and validation
    status: pending
  - id: itr3-type-change
    content: Add ITR type change handling for ITR-3 with proper data sanitization and validation
    status: pending
---

# ITR 3 Comprehensive Review and Fix Plan

## Overview

This plan provides a thorough review and fix of the ITR 3 filing process, ensuring all entry/exit points work correctly, JSON download functions properly, drafts save/load correctly, and only ITR 3 specific forms are displayed with proper conditions and computations.

## Current State Analysis

### Entry Points

Same as ITR-1 and ITR-2:

1. **From DataSourceSelector** (`/itr/data-source`)
2. **From ITRFormSelection** (`/itr/form-selection`)
3. **From ITRDirectSelection** (`/itr/direct-selection`)
4. **From IncomeSourceSelector** (`/itr/income-sources`)
5. **From DocumentUploadHub** (`/itr/document-upload`)
6. **Direct Access via Draft/Filing ID**
7. **From Dashboard/Filing History**

### Exit Points

Same as ITR-1 and ITR-2:

1. **Save Draft** → Stays on page, updates URL with draftId
2. **Submit ITR** → Navigates to `/itr/acknowledgment?filingId=xxx`
3. **Download JSON** → Downloads file, stays on page
4. **Back Navigation** → Returns to previous page based on entry point

### ITR-3 Specific Requirements

**Allowed Income Sources:**

- Salary income
- Business income (structured with businesses array)
- Professional income (structured with professions array)
- House property (multiple properties allowed)
- Capital gains (STCG and LTCG)
- Other sources (interest, dividends, etc.)
- Foreign income
- Director/Partner income

**Required Sections:**

- Personal Information
- Income Details (with business income, professional income, capital gains sub-sections)
- Balance Sheet (if maintained)
- Audit Information (if audit applicable under Section 44AB)
- Exempt & Agricultural Income
- Deductions
- Taxes Paid
- Tax Computation
- Bank Details
- Schedule FA (if foreign income/assets exist)

**Not Allowed:**

- Presumptive income (must be undefined)
- Goods carriage income (must be undefined)

**Key ITR-3 Specific Features:**

1. **Business Income Structure**: Must be an object with `businesses` array, not a number
2. **Professional Income Structure**: Must be an object with `professions` array, not a number
3. **Balance Sheet**: Required if business/professional income exists and balance sheet is maintained
4. **Audit Information**: Required if audit is applicable under Section 44AB (gross receipts > ₹1 crore for business or > ₹50 lakhs for profession)
5. **Balance Sheet Validation**: Assets must equal Liabilities + Capital

### Current Issues Identified

1. **Entry Point Recovery**: Entry point stored in localStorage but may not be properly restored for ITR-3
2. **ITR Type Validation**: ITR type can be changed after entry, but validation may not catch incompatible data for ITR-3
3. **Form Filtering**: `shouldShowSection` function exists but may not cover all edge cases for ITR-3
4. **JSON Export**: ITR 3 specific fields may not be fully populated (balance sheet, audit info, business/professional income details)
5. **Draft Saving**: Draft saving may not preserve all ITR 3 specific data structures (business income, professional income, balance sheet, audit info)
6. **Computation Logic**: ITR 3 specific computations may not be isolated from other ITR types
7. **Balance Sheet Validation**: May not be properly validated before submission
8. **Audit Information Validation**: May not be properly validated when audit is applicable

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

1. Verify all entry points pass correct state for ITR-3
2. Ensure `selectedITR` is set to 'ITR-3' when appropriate
3. Fix entry point recovery from localStorage on page refresh for ITR-3
4. Add route guard to prevent invalid ITR type changes for ITR-3
5. Ensure `selectedPerson` is always available for ITR-3

**Validation:**

- Test each entry point with ITR-3 selection
- Verify state is correctly passed and restored
- Test page refresh recovery

### Task 2: Exit Points Review and Fix

**Files to Review:**

- `frontend/src/pages/ITR/ITRComputation.js` (lines 2565-2657, 2732-2804)

**Actions:**

1. Verify draft saving preserves all ITR-3 data (business income, professional income, balance sheet, audit info)
2. Ensure JSON download includes all ITR-3 specific fields
3. Fix submission flow to properly validate ITR-3 before exit (balance sheet balance, audit info if applicable)
4. Ensure acknowledgment navigation includes all required data
5. Add proper cleanup on exit (clear temporary data, etc.)

**Validation:**

- Test draft save and reload for ITR-3
- Test JSON download for ITR-3
- Test submission and verify acknowledgment page receives correct data

### Task 3: JSON Download Functionality Fix

**Files to Review:**

- `frontend/src/services/itrJsonExportService.js` (lines 636-714, 276-283)
- `frontend/src/pages/ITR/ITRComputation.js` (lines 2586-2630)

**Actions:**

1. Verify ITR-3 specific fields are correctly populated in JSON export:

- `Form_ITR3.PartA_BS` (Balance Sheet)
- `Form_ITR3.PartA_PL` (Profit & Loss)
- `Form_ITR3.ScheduleBP` (Business Income)
- `Form_ITR3.ScheduleCG` (Capital Gains)
- `Form_ITR3.ScheduleFA` (Foreign Assets, if applicable)
- Audit information in appropriate sections

2. Ensure business income details are properly mapped from `businesses` array
3. Ensure professional income details are properly mapped from `professions` array
4. Ensure balance sheet data is properly formatted (assets, liabilities, capital)
5. Ensure audit information is included if applicable
6. Add validation to ensure JSON is ITR-3 compliant before download
7. Fix any missing field mappings for ITR-3

**Validation:**

- Generate JSON for ITR-3 with all sections filled
- Verify JSON structure matches ITD requirements
- Test JSON validation before download

### Task 4: Draft Saving and Loading Fix

**Files to Review:**

- `frontend/src/pages/ITR/ITRComputation.js` (lines 2565-2657, 2422-2478, 1899-1995)
- `frontend/src/services/api/itrService.js` (lines 21-49)

**Actions:**

1. Ensure draft saving includes:

- `selectedITR` (must be 'ITR-3' or 'ITR3')
- Complete `formData` structure
- `assessmentYear`
- `taxRegime`
- `selectedPerson`
- Business income structure (with `businesses` array)
- Professional income structure (with `professions` array)
- Balance sheet data (if maintained)
- Audit information (if applicable)
- Schedule FA data if applicable

2. Fix draft loading to restore ITR-3 specific data structures
3. Ensure draft updates preserve ITR-3 constraints
4. Add validation to prevent saving invalid ITR-3 data
5. Fix auto-save functionality for ITR-3

**Validation:**

- Save draft with ITR-3 data
- Reload page and verify draft loads correctly
- Verify all ITR-3 specific fields are preserved
- Test auto-save functionality

### Task 5: ITR-3 Specific Form Filtering

**Files to Review:**

- `frontend/src/pages/ITR/ITRComputation.js` (lines 3286-3299, 2706-2746)
- `frontend/src/components/ITR/ComputationSection.js` (lines 643-783)

**Actions:**

1. Verify `shouldShowSection` correctly hides:

- `presumptiveIncome` section
- `goodsCarriage` section

2. Verify `shouldShowSection` correctly shows:

- `businessIncome` section (as separate section)
- `professionalIncome` section (as separate section)
- `balanceSheet` section (if applicable)
- `auditInfo` section (if applicable)
- `scheduleFA` section (if foreign income/assets exist)

3. Ensure income section shows:

- Salary income
- House property (multiple properties allowed)
- Capital gains (STCG and LTCG sub-sections)
- Foreign income sub-section
- Director/Partner income sub-section
- Other sources (interest, dividends, etc.)
- Business income (via separate section, not in income section)
- Professional income (via separate section, not in income section)

4. Add runtime validation to prevent showing hidden sections
5. Ensure section titles are ITR-3 specific

**Validation:**

- Verify only ITR-3 sections are visible
- Test section filtering when ITR type is changed
- Verify section titles are correct for ITR-3
- Verify balance sheet and audit info sections appear when applicable

### Task 6: ITR-3 Specific Validations and Computations

**Files to Review:**

- `frontend/src/components/ITR/core/ITRValidationEngine.js` (lines 593-639)
- `frontend/src/pages/ITR/ITRComputation.js` (lines 1195-1210, 2732-2804)

**Actions:**

1. Verify ITR-3 validation rules:

- Business income structure validation (must be object with `businesses` array)
- Professional income structure validation (must be object with `professions` array)
- Balance sheet balance validation (assets = liabilities + capital)
- Audit information validation (required if audit applicable under Section 44AB)
- Business name required for each business
- Profession name required for each profession
- Gross receipts validation (cannot be negative)

2. Ensure validation runs on:

- Form data changes
- Before draft save
- Before JSON export
- Before submission

3. Fix computation logic to:

- Only calculate ITR-3 applicable income
- Include business income from `businesses` array
- Include professional income from `professions` array
- Include capital gains in calculations
- Include foreign income in calculations
- Include director/partner income in calculations
- Handle multiple house properties correctly
- Exclude presumptive income from calculations

4. Add real-time validation feedback for ITR-3 violations

**Validation:**

- Test validation with invalid ITR-3 data (e.g., unbalanced balance sheet, missing audit info)
- Verify error messages are clear and actionable
- Test computation with ITR-3 specific scenarios
- Test balance sheet validation
- Test audit information validation

### Task 7: Data Structure Consistency

**Files to Review:**

- `frontend/src/pages/ITR/ITRComputation.js` (lines 255-329)
- `frontend/src/services/itrJsonExportService.js`

**Actions:**

1. Ensure formData structure for ITR-3:

- `income.businessIncome` should be an object with `businesses` array (not a number)
- `income.professionalIncome` should be an object with `professions` array (not a number)
- `income.capitalGains` should be an object with `stcgDetails` and `ltcgDetails` arrays
- `income.houseProperty.properties` should be an array (multiple properties allowed)
- `income.foreignIncome` should be an object with `foreignIncomeDetails` array
- `income.directorPartner` should be an object with `directorIncome` and `partnerIncome`
- `balanceSheet` should be an object with `hasBalanceSheet`, `assets`, `liabilities` (if maintained)
- `auditInfo` should be an object with `isAuditApplicable`, `auditReportNumber`, `auditReportDate`, `caDetails` (if applicable)
- `scheduleFA` should be an object with `assets` array (if foreign income/assets exist)
- No `presumptiveIncome` object
- No `goodsCarriage` object

2. Fix initialization to set correct defaults for ITR-3
3. Ensure data structure is consistent across:

- Form state
- Draft saving
- JSON export
- Validation

**Validation:**

- Verify formData structure matches ITR-3 requirements
- Test data consistency across save/load/export

### Task 8: ITR Type Change Handling

**Files to Review:**

- `frontend/src/pages/ITR/ITRComputation.js` (lines 3525-3562)

**Actions:**

1. Add validation when changing to ITR-3
2. Automatically sanitize form data when switching to ITR-3:

- Ensure business income is an object (not a number)
- Ensure professional income is an object (not a number)
- Ensure capital gains is an object (not 0)
- Ensure foreign income is an object (not undefined)
- Ensure director/partner income is an object (not undefined)
- Remove presumptive income and goods carriage if they exist
- Initialize balance sheet and audit info if they don't exist

3. Add validation to prevent switching from ITR-3 if data is incompatible

**Validation:**

- Test switching to ITR-3 from other ITR types
- Test switching from ITR-3 to other ITR types
- Verify data is properly sanitized

## Testing Checklist

### Entry Points

- [ ] DataSourceSelector → ITR-3 computation
- [ ] ITRFormSelection → ITR-3 computation
- [ ] ITRDirectSelection → ITR-3 computation
- [ ] IncomeSourceSelector → ITR-3 computation
- [ ] DocumentUploadHub → ITR-3 computation
- [ ] Direct draft/filing ID access
- [ ] Dashboard/Filing History → ITR-3 computation
- [ ] Page refresh recovery

### Exit Points

- [ ] Save draft and reload
- [ ] Submit ITR and verify acknowledgment
- [ ] Download JSON and verify structure
- [ ] Back navigation from various entry points

### JSON Download

- [ ] JSON contains all ITR-3 specific fields
- [ ] JSON structure is ITD compliant
- [ ] JSON validation works correctly
- [ ] File download triggers correctly
- [ ] Balance sheet data included if applicable
- [ ] Audit information included if applicable
- [ ] Business income details properly formatted
- [ ] Professional income details properly formatted

### Draft Saving

- [ ] Draft saves all ITR-3 data
- [ ] Draft loads correctly on page refresh
- [ ] Draft updates preserve ITR-3 constraints
- [ ] Auto-save works for ITR-3
- [ ] Balance sheet data preserved
- [ ] Audit information preserved
- [ ] Business income structure preserved
- [ ] Professional income structure preserved

### Form Filtering

- [ ] Only ITR-3 sections are visible
- [ ] Hidden sections are not accessible
- [ ] Section titles are ITR-3 specific
- [ ] Income section shows only ITR-3 fields
- [ ] Business income section appears separately
- [ ] Professional income section appears separately
- [ ] Balance sheet section appears when applicable
- [ ] Audit info section appears when applicable
- [ ] Schedule FA section appears when foreign income/assets exist

### Validations

- [ ] Business income structure validation (must be object)
- [ ] Professional income structure validation (must be object)
- [ ] Balance sheet balance validation
- [ ] Audit information validation when applicable
- [ ] Business name required validation
- [ ] Profession name required validation
- [ ] Gross receipts validation
- [ ] Real-time validation feedback

### Computations

- [ ] Total income calculation (ITR-3 only)
- [ ] Tax computation (ITR-3 specific)
- [ ] Business income included in calculations (from businesses array)
- [ ] Professional income included in calculations (from professions array)
- [ ] Capital gains included in calculations
- [ ] Foreign income included in calculations
- [ ] Director/Partner income included in calculations
- [ ] Multiple house properties included in calculations
- [ ] Deductions calculation
- [ ] Final tax payable

## Deliverables

1. **Fixed Entry Points**: All entry points correctly initialize ITR-3
2. **Fixed Exit Points**: All exit points work correctly with proper data preservation
3. **Working JSON Download**: ITR-3 JSON export is complete and compliant
4. **Working Draft Save/Load**: Drafts save and load correctly for ITR-3
5. **Proper Form Filtering**: Only ITR-3 sections are displayed
6. **Complete Validations**: All ITR-3 validation rules are enforced
7. **Correct Computations**: All calculations are ITR-3 specific
8. **Balance Sheet Validation**: Balance sheet is properly validated
9. **Audit Information Validation**: Audit information is properly validated when applicable

## Files to Modify

1. `frontend/src/pages/ITR/ITRComputation.js` - Main computation page
2. `frontend/src/services/itrJsonExportService.js` - JSON export service
3. `frontend/src/components/ITR/core/ITRValidationEngine.js` - Validation engine
4. `frontend/src/components/ITR/ComputationSection.js` - Section rendering
5. `frontend/src/services/api/itrService.js` - Draft service (if needed)

## Success Criteria

1. All entry points correctly initialize ITR-3 with proper state
2. JSON download generates complete, ITD-compliant ITR-3 JSON
3. Drafts save and load correctly with all ITR-3 data preserved
4. Only ITR-3 specific forms/sections are displayed
5. All ITR-3 validation rules are enforced with clear error messages
6. All computations are ITR-3 specific and accurate
7. Exit points (save, submit, download) work correctly
8. Balance sheet is properly validated and balanced
9. Audit information is properly validated when applicable
10. Business and professional income structures are correctly maintained