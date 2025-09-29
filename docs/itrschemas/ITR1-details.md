Perfect 👍 Let’s add **datatypes** to every field in the **ITR-1 JSON schema** and keep the structured mapping by **input source**. This will help you directly design your data capture engine and validation logic.

---

# 🗂️ **ITR-1 JSON Schema – Field → Datatype → Source Mapping**

---

## **Group 1 – System/Prefill (Govt Data Sources)**

| **Schema Section** | **Field**           | **Datatype**                          | **Source**            |
| ------------------ | ------------------- | ------------------------------------- | --------------------- |
| PersonalInfo       | `PAN`               | string (10 chars)                     | PAN DB (Prefill)      |
| PersonalInfo       | `Name`              | string                                | PAN DB (Prefill)      |
| PersonalInfo       | `DOB`               | string (YYYY-MM-DD)                   | PAN DB (Prefill)      |
| PersonalInfo       | `Gender`            | string (M/F/O)                        | PAN DB                |
| FilingStatus       | `AssessmentYear`    | string (YYYY-YY)                      | ITD prefill           |
| FilingStatus       | `ReturnType`        | string (enum: Original/Revised)       | ITD prefill / user    |
| FilingStatus       | `FilingType`        | string (enum: 139(1), 139(4), 139(5)) | User selection        |
| Refund             | `BankAccountNumber` | string (15-18 digits)                 | ITD prevalidated bank |
| Refund             | `IFSC`              | string (11 chars)                     | ITD prevalidated bank |

---

## **Group 2 – Employer / Form 16**

| **Schema Section** | **Field**       | **Datatype**        | **Source**       |
| ------------------ | --------------- | ------------------- | ---------------- |
| IncomeDetails      | `SalaryIncome`  | number (2 decimals) | Form 16 (Part B) |
| IncomeDetails      | `PensionIncome` | number              | Form 16 / AIS    |
| TaxPaid            | `TDSonSalary`   | number              | Form 16 (Part A) |
| TaxPaid            | `EmployerTAN`   | string (10 chars)   | Form 16          |
| TaxPaid            | `EmployerName`  | string              | Form 16          |

---

## **Group 3 – AIS / Form 26AS**

| **Schema Section** | **Field**                | **Datatype**        | **Source**               |
| ------------------ | ------------------------ | ------------------- | ------------------------ |
| IncomeDetails      | `SavingsInterest`        | number              | AIS / Form 26AS          |
| IncomeDetails      | `FDInterest`             | number              | AIS / Form 26AS          |
| IncomeDetails      | `OtherSources`           | number              | AIS                      |
| IncomeDetails      | `ExemptIncome`           | number              | AIS / User               |
| TaxPaid            | `TDSonOtherIncome`       | number              | Form 26AS                |
| TaxPaid            | `TCS`                    | number              | Form 26AS                |
| TaxPaid            | `AdvanceTax`             | number              | Form 26AS                |
| TaxPaid            | `SelfAssessmentTax`      | number              | Form 26AS / User challan |
| ScheduleIT         | `ChallanDetails.BSRCode` | string (7 chars)    | Challan (Form 26AS)      |
| ScheduleIT         | `ChallanDetails.Date`    | string (YYYY-MM-DD) | Challan                  |
| ScheduleIT         | `ChallanDetails.Amount`  | number              | Challan                  |
| ScheduleIT         | `ChallanDetails.CIN`     | string              | Challan                  |

---

## **Group 4 – User Inputs (Declarations)**

| **Schema Section** | **Field**                           | **Datatype**                      | **Source**                       |
| ------------------ | ----------------------------------- | --------------------------------- | -------------------------------- |
| DeductionDetails   | `80C`                               | number                            | User (LIC, PPF, EPF, ELSS, etc.) |
| DeductionDetails   | `80D`                               | number                            | User (Medical insurance)         |
| DeductionDetails   | `80TTA`                             | number                            | User (Savings account interest)  |
| Schedule80G        | `DonationDetails.DoneePAN`          | string (10 chars)                 | User                             |
| Schedule80G        | `DonationDetails.Amount`            | number                            | User                             |
| Schedule80G        | `DonationDetails.QualifyingPercent` | number (0/50/100)                 | User                             |
| Verification       | `DeclarationName`                   | string                            | User                             |
| Verification       | `FatherName`                        | string                            | User                             |
| Verification       | `Place`                             | string                            | User                             |
| Verification       | `Date`                              | string (YYYY-MM-DD)               | User                             |
| Verification       | `Capacity`                          | string (enum: Self/CA/Authorized) | User                             |

---

## **Group 5 – System Computed (Derived Fields)**

| **Schema Section** | **Field**          | **Datatype** | **Source**                      |
| ------------------ | ------------------ | ------------ | ------------------------------- |
| TaxComputation     | `GrossTotalIncome` | number       | System (Salary + Other Sources) |
| TaxComputation     | `TotalDeductions`  | number       | System (sum of 80C/80D/etc.)    |
| TaxComputation     | `TaxableIncome`    | number       | System                          |
| TaxComputation     | `TaxLiability`     | number       | System (based on slabs)         |
| Refund             | `RefundAmount`     | number       | System (TaxPaid – TaxLiability) |

---

# 🧭 **Notes for Implementation**

- **Datatypes** must strictly follow **ITD JSON schema** → `string`, `number`, `enum`, `date`.
- **Mandatory fields**: PAN, Name, DOB, AY, Bank details, Salary, Verification.
- **Conditional fields**: `TDS`, `AdvanceTax`, `80G`, etc. only if applicable.
- **System-computed fields**: should be populated _exactly as per ITD schema formulas_ (not free input).

---

✅ With this, you now have a **complete field → datatype → input source map** for ITR-1 JSON.

########### CRITICAL EXAMPLE FOR FEATURE DEVELOPMENT ###############

the platform must bridge the gap between granular user inputs and the aggregated schema field.

🔧 Bridging Strategy: 80C and Similar Deductions

1. Input Layer (Adaptive UI)

Show category-level fields under 80C:

LIC Premiums

PPF

Employee Provident Fund (EPF)

ELSS Mutual Funds

NSC

5-Year FD

Tuition Fees (for children)

Home Loan Principal Repayment

Each input accepts: Amount + optional Proof Upload.

User can add multiple entries within a category (e.g., multiple LIC policies).

👉 UI Adaptation Rule: Start with a simple “+ Add Investment” button. On click, dropdown of eligible instruments opens → user picks → amount field appears.

2. Processing & Validation Layer

Step 1: Aggregate → Sum all entries from user across instruments.

Step 2: Cap Validation → Max ₹1,50,000 allowed under 80C.

if total_80C > 150000:
eligible_80C = 150000
else:
eligible_80C = total_80C

Step 3: Error/Warning

If user exceeds ₹1.5L → show info: “Total exceeds limit, ₹1,50,000 will be considered.”

If user leaves proof missing → mark validation warning.

3. Output Layer (Mapping to JSON Schema)

ITD JSON needs only:

{
"DeductionDetails": {
"80C": 150000
}
}

Internally store a breakdown table:

{
"80C_Breakdown": [
{ "type": "LIC", "amount": 60000 },
{ "type": "PPF", "amount": 40000 },
{ "type": "EPF", "amount": 80000 }
],
"80C_Total": 180000,
"80C_Eligible": 150000
}

🗂️ Structured Flow Example for 80C
Stage Action System Behavior
Input UI User adds LIC = ₹60k, PPF = ₹40k, EPF = ₹80k Store in breakdown DB
Processing Compute total = ₹1.8L Apply cap = ₹1.5L
Validation Detect over-limit Warn user + show eligible limit
Output JSON 80C = 150000 Generate ITD JSON schema
Analytics Store breakdown Available for CA/Admin reports
🚀 Generalization

Same approach applies to 80D (Medical Insurance: self, parents <60, parents >60 → different caps).

Same for 80G (Donations: different qualifying %).

So design per-section input forms that:

Allow multiple entries with instrument-specific validation.

System computes aggregate + caps.

Export single number to ITD JSON.

✅ Result:

Users enter granular, intuitive inputs.

System handles sum + caps + validation.

JSON stays compliant with ITD’s expected single-value format.
