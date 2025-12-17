# ITR Variants + Progressive Disclosure Rules (ITR-1/2/3/4)

This document defines **what steps/sections are necessary** per ITR type and how Burnblack should **progressively disclose** complexity based on user signals and available data. It uses the existing rule engine and configs as the source of truth.

## Source of truth in code
- **ITR rule engine**: `[frontend/src/services/ITRAutoDetector.js](frontend/src/services/ITRAutoDetector.js)`
- **Field/section configs**:
  - `[frontend/src/components/ITR/config/ITR1Config.js](frontend/src/components/ITR/config/ITR1Config.js)`
  - `[frontend/src/components/ITR/config/ITR2Config.js](frontend/src/components/ITR/config/ITR2Config.js)`
  - `[frontend/src/components/ITR/config/ITR3Config.js](frontend/src/components/ITR/config/ITR3Config.js)`
  - `[frontend/src/components/ITR/config/ITR4Config.js](frontend/src/components/ITR/config/ITR4Config.js)`
  - Registry/helpers: `[frontend/src/components/ITR/config/ITRConfigRegistry.js](frontend/src/components/ITR/config/ITRConfigRegistry.js)`

---

## Universal “core” steps (all ITRs)
These steps must always exist; the ITR type only changes what appears inside **CollectData**.

1. Identity & context (self/family/client)
2. PAN verification (or verified status)
3. Determine ITR (guided/expert/auto)
4. Collect data (progressive sections)
5. Draft persistence + resume
6. Compute tax (manual)
7. Review & validate
8. Submit + e-verify
9. Acknowledgment + tracking

---

## ITR-1 (Sahaj) — “simple salaried”

### When to recommend (signals)
Use the `itr1_eligible` rule in `ITRAutoDetector`:
- salary > 0
- interestIncome ≤ 50,000
- no capital gains
- ≤ 1 house property
- no business/professional income
- no foreign income / DTAA / NRI
- not director/partner
- agricultural income ≤ 5,000

### Must-have sections
- Personal info (PAN, DOB, contact, residential status)
- Salary income
- One house property (if applicable)
- Other sources (interest)
- Deductions (Chapter VI-A)
- Taxes paid (TDS/advance/self-assessment)

### Progressive disclosure (ITR-1)
- Do **not** show capital gains / foreign / business modules.
- If agricultural income is selected, ask only:
  - “Up to ₹5,000?” (if yes, keep ITR-1; if no, force ITR-2)

---

## ITR-2 — “capital gains / multiple property / foreign”

### When to recommend (signals)
Use detector rules:
- `capital_gains`
- `multiple_properties`
- `foreign_income`
- `director_partner`
- `agricultural_income` (if > 5,000)

### Must-have additions vs ITR-1
- Capital gains module(s) (equity/property/VDA)
- Multi-property module (if >1)
- Foreign income/assets module (if applicable)
- Director/partner disclosures (if applicable)

### Progressive disclosure (ITR-2)
- Capital gains asks only the **sub-module** needed:
  - equity/MF vs property vs VDA (from guided selection)
- Foreign module appears only if:
  - NRI status OR foreign income/assets OR DTAA claim
- Director/partner appears only if the user answers yes or the prefill indicates it

---

## ITR-4 (Sugam) — “presumptive”

### When to recommend (signals)
Detector’s business/professional rule recommends ITR-3 but may allow **ITR-4** as an alternative when presumptive is eligible.

### Must-have additions vs ITR-1
- Presumptive income module:
  - turnover/receipts
  - presumptive scheme selection (44AD/44ADA/44AE)
  - basic business/prof profile (nature, GSTIN if required)

### Progressive disclosure (ITR-4)
- Ask the “eligibility gate” first:
  - “Are you opting for presumptive taxation?” → if no, route to ITR-3 path
- Only show:
  - detailed P&L / balance sheet if the user *is not* presumptive (i.e., ITR-3)

---

## ITR-3 — “business/profession with books”

### When to recommend (signals)
Detector `business_income` rule:
- businessIncome > 0 OR professionalIncome > 0

### Must-have additions vs ITR-1/2
- Business/profession profile
- Books/audit gating:
  - If audit required → collect audit info
  - If books maintained → show P&L + Balance Sheet modules

### Progressive disclosure (ITR-3)
ITR-3 must feel like “add modules”, not “new product”.

Recommended gating order:
1. “Business or profession?” (already in guided selection)
2. “Presumptive?” (if yes → ITR-4)
3. “Books maintained?” and “Audit applicable?” (only if not presumptive)
4. Show additional schedules only if user flags them:
   - director/partner
   - foreign assets
   - capital gains

---

## Progressive disclosure mechanism (implementation rule)

### Primary rule: show sections based on **ITR type + data signals**
Use the config registry to define what can exist, and the rule engine / selections to decide what *should* exist.

Practical implementation guideline:
- `ITRConfigRegistry.getSections(selectedITR)` provides the available sections.
- For each section:
  - render it only if either:
    - it’s marked required in config, OR
    - a “signal” (user selection/prefill) indicates relevance, OR
    - user explicitly adds it (“Add capital gains”).

### CA review triggers (trust + safety)
When `ITRAutoDetector` marks `caReviewRequired: true`, the UI should:
- show a non-blocking banner (“CA review recommended”) and
- optionally create a review queue item in CA flows (future)

---

## Relationship to current selection pages (today)
Current selection pages already capture most signals:
- Guided: `/itr/income-sources` → income source signals
- Questionnaire: `/itr/select-form` → eligibility signals
- Recommender: `/itr/recommend-form` → rule engine + optional backend validation
- Expert: `/itr/direct-selection` → explicit ITR choice

The long-term goal is to converge to one canonical “Determine ITR” surface, but the **signals** remain the same.


