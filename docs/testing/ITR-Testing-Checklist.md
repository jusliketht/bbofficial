# ITR-1 and ITR-2 Comprehensive Testing Checklist

## Overview
This document provides a comprehensive testing checklist for ITR-1 and ITR-2 flows, including form validations, calculations, and JSON export functionality.

---

## Phase 1: JSON Export Testing

### ITR-1 JSON Export Tests
- [ ] **Basic Export**
  - [ ] JSON file downloads successfully
  - [ ] File name format: `ITR-1_2024-25_YYYY-MM-DD.json`
  - [ ] JSON structure is valid (parseable)
  - [ ] All required fields present

- [ ] **Data Mapping Verification**
  - [ ] `personalInfo.pan` → `Taxpayer_Information.PAN`
  - [ ] `personalInfo.name` → `Taxpayer_Information.Name` (split correctly)
  - [ ] `personalInfo.email` → `Taxpayer_Information.Contact_Information.Email_ID`
  - [ ] `personalInfo.phone` → `Taxpayer_Information.Contact_Information.Mobile_Number`
  - [ ] `income.salary` → `Income_Details.Income_from_Salary`
  - [ ] `income.houseProperty` → `Income_Details.Income_from_House_Property`
  - [ ] `income.otherIncome` → `Income_Details.Income_from_Other_Sources`
  - [ ] `deductions.section80C` → `Deductions.Section_80C`
  - [ ] `deductions.section80D` → `Deductions.Section_80D`
  - [ ] `deductions.section80G` → `Deductions.Section_80G`
  - [ ] `deductions.section80TTA` → `Deductions.Section_80TTA`
  - [ ] `taxesPaid.tds` → `Tax_Calculation.TDS_TCS`
  - [ ] `taxesPaid.advanceTax` → `Tax_Calculation.Advance_Tax`
  - [ ] `taxesPaid.selfAssessmentTax` → `Tax_Calculation.Self_Assessment_Tax`
  - [ ] `bankDetails.accountNumber` → `Bank_Account_Details.Account_Number`
  - [ ] `bankDetails.ifsc` → `Bank_Account_Details.IFSC_Code`
  - [ ] `bankDetails.accountType` → `Bank_Account_Details.Account_Type`

- [ ] **Calculated Fields**
  - [ ] `Total_Gross_Income` = Sum of all income sources
  - [ ] `Total_Deductions` = Sum of all deductions
  - [ ] `Total_Income` = Total_Gross_Income - Total_Deductions
  - [ ] `Total_Tax_Liability` calculated correctly
  - [ ] `Education_Cess` = 4% of tax liability
  - [ ] `Total_Tax_Payable` = Tax_Liability + Education_Cess
  - [ ] `Total_Tax_Paid` = TDS + Advance_Tax + Self_Assessment_Tax

- [ ] **ITR-1 Specific Fields**
  - [ ] `ITR1_Specific.Business_Income_Already_Covered` = 'NO'
  - [ ] `ITR1_Specific.Capital_Gains_Already_Covered` = 'NO'

### ITR-2 JSON Export Tests
- [ ] **Basic Export**
  - [ ] JSON file downloads successfully
  - [ ] File name format: `ITR-2_2024-25_YYYY-MM-DD.json`
  - [ ] JSON structure is valid (parseable)
  - [ ] All required fields present

- [ ] **Structured Data Mapping**
  - [ ] `income.capitalGains.stcgDetails[]` → `ITR2_Specific.Capital_Gains_Detailed.stcgDetails`
  - [ ] `income.capitalGains.ltcgDetails[]` → `ITR2_Specific.Capital_Gains_Detailed.ltcgDetails`
  - [ ] Capital gains total calculated from arrays
  - [ ] `income.houseProperty.properties[]` → `ITR2_Specific.House_Property_Detailed.properties`
  - [ ] House property income calculated from multiple properties
  - [ ] `income.foreignIncome.foreignIncomeDetails[]` → `ITR2_Specific.Foreign_Income_Details`
  - [ ] Foreign income converted to INR correctly
  - [ ] `income.directorPartner` → `ITR2_Specific.Director_Partner_Income`

- [ ] **Capital Gains Details**
  - [ ] Each STCG entry has: assetType, saleValue, purchaseValue, expenses, gainAmount
  - [ ] Each LTCG entry has: assetType, saleValue, purchaseValue, expenses, gainAmount
  - [ ] Dates included (buyDate, sellDate) if available
  - [ ] Source indicator (broker_import, manual) preserved

- [ ] **Multiple House Properties**
  - [ ] All properties included in export
  - [ ] Each property has: propertyType, annualRentalIncome, municipalTaxes, interestOnLoan
  - [ ] Net income calculated correctly per property
  - [ ] Total house property income = sum of all properties

- [ ] **Foreign Income Details**
  - [ ] Each entry has: country, incomeType, amount, exchangeRate, amountInr
  - [ ] DTAA applicable flag preserved
  - [ ] Tax paid abroad included if applicable

---

## Phase 2: Form Validation Testing

### Personal Info Form Validations
- [ ] **PAN Validation**
  - [ ] Format: 10 characters (5 letters + 4 digits + 1 letter)
  - [ ] Pattern: `^[A-Z]{5}[0-9]{4}[A-Z]{1}$`
  - [ ] Required field
  - [ ] Error message displays on invalid format
  - [ ] Auto-uppercase conversion

- [ ] **Email Validation**
  - [ ] Valid email format required
  - [ ] Error message on invalid format
  - [ ] Required field

- [ ] **Phone Validation**
  - [ ] 10 digits required
  - [ ] Pattern: `^[6-9]\d{9}$` (starts with 6-9)
  - [ ] Error message on invalid format
  - [ ] Optional field (but validated if provided)

- [ ] **Date of Birth Validation**
  - [ ] Valid date required
  - [ ] Age calculation correct
  - [ ] Future dates rejected
  - [ ] Error message on invalid date

- [ ] **Address Validation**
  - [ ] City required
  - [ ] State required
  - [ ] Pincode: 6 digits, pattern `^[0-9]{6}$`
  - [ ] Error messages for each field

### Income Form Validations (ITR-1)
- [ ] **Income Limits**
  - [ ] Total income max ₹50L for ITR-1
  - [ ] Error message when limit exceeded
  - [ ] Suggestion to use ITR-2

- [ ] **Field Restrictions**
  - [ ] Capital gains field hidden/disabled
  - [ ] Business income field hidden/disabled
  - [ ] Error if capital gains entered
  - [ ] Error if business income entered

- [ ] **Required Fields**
  - [ ] At least salary OR house property income required
  - [ ] Error message if both missing

- [ ] **Numeric Validation**
  - [ ] All income fields accept only numbers
  - [ ] Negative values rejected or handled
  - [ ] Decimal values handled correctly

### Income Form Validations (ITR-2)
- [ ] **Capital Gains Validation**
  - [ ] If `hasCapitalGains` = true, details required
  - [ ] Each STCG entry validated (assetType, saleValue, purchaseValue, gainAmount)
  - [ ] Each LTCG entry validated
  - [ ] Sale date > purchase date for LTCG
  - [ ] Gain amount = saleValue - purchaseValue - expenses

- [ ] **House Property Validation**
  - [ ] Max 2 self-occupied properties
  - [ ] Error message if more than 2 self-occupied
  - [ ] Each property validated (rentalIncome, municipalTaxes, interestOnLoan)
  - [ ] Net income calculated correctly

- [ ] **Foreign Income Validation**
  - [ ] If `hasForeignIncome` = true, details required
  - [ ] Exchange rate > 0 required
  - [ ] Amount in INR auto-calculated
  - [ ] Tax paid abroad required if DTAA applicable

- [ ] **Director/Partner Income Validation**
  - [ ] If `isDirector` = true, directorIncome required
  - [ ] If `isPartner` = true, partnerIncome required
  - [ ] Error message if flag true but income missing

### Deductions Form Validations
- [ ] **Section 80C**
  - [ ] Max limit: ₹1.5L
  - [ ] Warning when limit exceeded
  - [ ] Non-negative values only

- [ ] **Section 80D**
  - [ ] Max limit: ₹25K (self), ₹50K (with parents)
  - [ ] Warning when limit exceeded

- [ ] **Section 80G**
  - [ ] Max limit: ₹1L
  - [ ] Warning when limit exceeded

- [ ] **Section 80TTA**
  - [ ] Max limit: ₹10K
  - [ ] Warning when limit exceeded

- [ ] **Total Deductions**
  - [ ] Sum calculated correctly
  - [ ] Displayed prominently

### Bank Details Form Validations
- [ ] **IFSC Code**
  - [ ] Format: 11 characters (4 letters + 0 + 6 alphanumeric)
  - [ ] Pattern: `^[A-Z]{4}0[A-Z0-9]{6}$`
  - [ ] Error message on invalid format
  - [ ] Auto-uppercase conversion

- [ ] **Account Number**
  - [ ] Required for refund processing
  - [ ] Minimum length validation
  - [ ] Numeric validation

- [ ] **Account Type**
  - [ ] Required field
  - [ ] Valid options: savings, current, salary

---

## Phase 3: Tax Calculation Testing

### Income Calculations
- [ ] **Gross Total Income**
  - [ ] ITR-1: Salary + House Property + Other Income
  - [ ] ITR-2: Salary + House Property + Capital Gains + Foreign Income + Director/Partner + Other Income
  - [ ] Capital gains summed from STCG + LTCG arrays
  - [ ] House property summed from multiple properties
  - [ ] Foreign income summed and converted to INR

- [ ] **Deduction Calculations**
  - [ ] Total Deductions = Sum of all section deductions
  - [ ] Deduction limits enforced
  - [ ] Standard deduction applied (Old regime: ₹50K, New regime: varies)

- [ ] **Taxable Income**
  - [ ] Taxable Income = Gross Total Income - Total Deductions
  - [ ] Negative taxable income handled (set to 0)

### Tax Liability Calculations
- [ ] **Old Regime Tax Slabs**
  - [ ] ₹0-2.5L: 0%
  - [ ] ₹2.5L-5L: 5%
  - [ ] ₹5L-7.5L: 10%
  - [ ] ₹7.5L-10L: 15%
  - [ ] ₹10L-12.5L: 20%
  - [ ] ₹12.5L-15L: 25%
  - [ ] Above ₹15L: 30%

- [ ] **New Regime Tax Slabs**
  - [ ] ₹0-3L: 0%
  - [ ] ₹3L-7L: 5%
  - [ ] ₹7L-10L: 10%
  - [ ] ₹10L-12L: 15%
  - [ ] ₹12L-15L: 20%
  - [ ] Above ₹15L: 30%

- [ ] **Education Cess**
  - [ ] 4% of tax liability
  - [ ] Calculated correctly

- [ ] **Surcharge** (if applicable)
  - [ ] Applied at correct income thresholds
  - [ ] Calculated correctly

- [ ] **Rebate Section 87A**
  - [ ] Applied if taxable income ≤ ₹5L
  - [ ] Rebate amount: ₹12,500

### Tax Payable/Refund Calculations
- [ ] **Total Tax Paid**
  - [ ] Total Tax Paid = TDS + Advance Tax + Self Assessment Tax
  - [ ] Calculated correctly

- [ ] **Tax Payable**
  - [ ] Tax Payable = Tax Liability - Total Tax Paid
  - [ ] Negative value indicates refund

- [ ] **Refund Calculation**
  - [ ] Refund = -Tax Payable (when negative)
  - [ ] Displayed correctly in UI

### Regime Comparison
- [ ] **Both Regimes Calculated**
  - [ ] Old regime tax calculated
  - [ ] New regime tax calculated
  - [ ] Both displayed simultaneously
  - [ ] Better regime highlighted

- [ ] **Regime Toggle**
  - [ ] Toggle switches between regimes
  - [ ] Calculations update immediately
  - [ ] UI reflects selected regime

---

## Phase 4: Dynamic Behavior Testing

### ITR Type Switching
- [ ] **Form Field Visibility**
  - [ ] ITR-1: Capital gains hidden
  - [ ] ITR-1: Business income hidden
  - [ ] ITR-2: All fields visible
  - [ ] Fields show/hide correctly on switch

- [ ] **Validation Rules**
  - [ ] ITR-1 restrictions apply
  - [ ] ITR-2 requirements apply
  - [ ] Rules change dynamically

- [ ] **Data Persistence**
  - [ ] Data preserved when switching ITR types
  - [ ] Invalid data cleared appropriately

### Tax Regime Toggle
- [ ] **Real-time Updates**
  - [ ] Tax calculation updates on regime change
  - [ ] Deduction application changes
  - [ ] UI updates immediately

- [ ] **Standard Deduction**
  - [ ] Old regime: ₹50K standard deduction
  - [ ] New regime: Standard deduction varies
  - [ ] Applied correctly

### Year Selection
- [ ] **Tax Slabs Update**
  - [ ] Slabs change based on assessment year
  - [ ] Correct slabs for selected year

- [ ] **Deduction Limits Update**
  - [ ] Limits change based on year
  - [ ] Correct limits for selected year

- [ ] **Prefetch Data**
  - [ ] Data loads for selected year
  - [ ] Correct year data displayed

- [ ] **Draft Loading**
  - [ ] Drafts load for different years
  - [ ] Year-specific drafts work correctly

### Conditional Fields
- [ ] **Capital Gains**
  - [ ] Details show only if `hasCapitalGains` = true
  - [ ] Fields hidden when false

- [ ] **Foreign Income**
  - [ ] Details show only if `hasForeignIncome` = true
  - [ ] Fields hidden when false

- [ ] **Director/Partner**
  - [ ] Income fields show only if flags true
  - [ ] Fields hidden when false

---

## Phase 5: End-to-End Flow Testing

### ITR-1 Complete Flow
- [ ] **Start to Finish**
  1. [ ] Start Filing → Person Selection
  2. [ ] PAN Verification (if needed)
  3. [ ] Form Recommendation → ITR-1 selected
  4. [ ] Computation Page loads
  5. [ ] Personal Info entered
  6. [ ] Income entered (salary, house property)
  7. [ ] Deductions entered
  8. [ ] Taxes paid entered
  9. [ ] Bank details entered
  10. [ ] Tax calculated (old regime)
  11. [ ] Tax calculated (new regime)
  12. [ ] Regime comparison shown
  13. [ ] Draft saved
  14. [ ] Draft loaded
  15. [ ] JSON exported
  16. [ ] JSON downloaded successfully

- [ ] **Form 16 Integration**
  - [ ] Form 16 uploaded
  - [ ] Data extracted correctly
  - [ ] Auto-populated in income form
  - [ ] Multiple Form 16s handled

- [ ] **Validation Throughout**
  - [ ] Errors shown at each step
  - [ ] Cannot proceed with invalid data
  - [ ] Error messages clear and actionable

### ITR-2 Complete Flow
- [ ] **Start to Finish**
  1. [ ] Start Filing → Person Selection
  2. [ ] PAN Verification (if needed)
  3. [ ] Form Recommendation → ITR-2 selected
  4. [ ] Computation Page loads
  5. [ ] Personal Info entered
  6. [ ] Income entered (salary, house property, other)
  7. [ ] Capital Gains entered (STCG/LTCG)
  8. [ ] Broker file uploaded and imported
  9. [ ] Multiple house properties entered
  10. [ ] Rent receipts uploaded
  11. [ ] Foreign income entered
  12. [ ] Director/Partner income entered
  13. [ ] Deductions entered
  14. [ ] Taxes paid entered
  15. [ ] Bank details entered
  16. [ ] Tax calculated (old regime)
  17. [ ] Tax calculated (new regime)
  18. [ ] Regime comparison shown
  19. [ ] Draft saved
  20. [ ] Draft loaded
  21. [ ] JSON exported
  22. [ ] JSON downloaded successfully

- [ ] **Broker File Import**
  - [ ] Excel/CSV file uploaded
  - [ ] Broker selected
  - [ ] Data extracted correctly
  - [ ] Capital gains populated
  - [ ] STCG/LTCG separated correctly

- [ ] **Rent Receipt OCR**
  - [ ] Receipt uploaded
  - [ ] Rent amount extracted
  - [ ] Auto-populated in property form

- [ ] **Data Verification Panel**
  - [ ] Discrepancies detected
  - [ ] Manual vs uploaded data compared
  - [ ] Severity levels shown
  - [ ] Resolution actions work

---

## Phase 6: Edge Cases and Error Handling

### Edge Cases
- [ ] **Zero Income**
  - [ ] Form handles zero income
  - [ ] Tax calculation = 0
  - [ ] JSON export works

- [ ] **Negative Deductions**
  - [ ] Negative values rejected
  - [ ] Error message shown

- [ ] **Very Large Numbers**
  - [ ] Large income amounts handled
  - [ ] No overflow errors
  - [ ] Formatting correct

- [ ] **Empty Fields**
  - [ ] Empty fields handled gracefully
  - [ ] Defaults applied where appropriate
  - [ ] Required fields validated

- [ ] **Invalid Dates**
  - [ ] Future dates rejected
  - [ ] Invalid date formats handled
  - [ ] Age calculation correct

### Error Handling
- [ ] **Network Errors**
  - [ ] API failures handled gracefully
  - [ ] Error messages shown
  - [ ] Retry options available

- [ ] **Validation Errors**
  - [ ] All validation errors displayed
  - [ ] Error messages clear
  - [ ] Fields highlighted

- [ ] **JSON Export Errors**
  - [ ] Export failures handled
  - [ ] Error messages shown
  - [ ] Fallback options available

---

## Phase 7: Performance Testing

- [ ] **Form Rendering**
  - [ ] Forms load quickly
  - [ ] No lag on input
  - [ ] Smooth transitions

- [ ] **Tax Calculation**
  - [ ] Calculations update quickly (<300ms)
  - [ ] Debouncing works correctly
  - [ ] No performance issues

- [ ] **JSON Export**
  - [ ] Export completes quickly
  - [ ] Large datasets handled
  - [ ] No memory issues

---

## Test Results Summary

### Test Execution Date: ___________
### Tester: ___________
### Environment: ___________

### Summary
- Total Tests: ______
- Passed: ______
- Failed: ______
- Skipped: ______

### Critical Issues Found
1. ___________
2. ___________
3. ___________

### Notes
___________
___________
___________

