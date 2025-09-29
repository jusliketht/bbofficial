Got it ✅ — this is a classic case of **fragmented development + scope creep → duplication + tech debt**. To fix this, we need a **single, enforceable guide** that resets the codebase to our enterprise-grade BurnBlack architecture. Here’s the **crisp playbook** for your CTO + devs:

---

# 🏗️ BurnBlack Codebase Reset & Refactor Guide

**Objective:** Eliminate duplication, enforce modularity, and realign implementation with architecture → **zero ambiguity, enterprise-grade clarity.**

---

## 1. 🔑 Guiding Principles

- **Single Source of Truth**: Every feature has _one canonical implementation_, consumed via services/components.
- **Separation of Concerns**: UI ↔ Business Logic ↔ Persistence must remain distinct.
- **Config > Code**: Rules (tax slabs, validation) live in configs/JSON, not scattered in code.
- **Reusability**: Shared logic sits in `/common` or `/services`, never duplicated.
- **Convention over Configuration**: File structure follows standard, predictable paths.

---

## 2. 📂 Canonical File Structure

### **Frontend**

```
frontend/src/
├── pages/               # High-level flows (Dashboard, ITR1, ITR2, Admin)
│   └── ITR/
│       ├── ITRFiling.js     # Orchestrator (shared)
│       ├── ITR1Filing.js    # Wrapper for ITR-1 configs
│       ├── ITR2Filing.js    # Wrapper for ITR-2 configs
│       └── FilingHistory.js
├── components/
│   ├── ITR/                 # Shared filing UI components
│   │   ├── IncomeForm.js
│   │   ├── DeductionForm.js
│   │   ├── TaxSummaryPanel.js
│   │   └── ValidationMessages.js
│   ├── Common/              # Buttons, Cards, Tooltips, Status indicators
│   └── Layout/              # Nav, Sidebar, Header
├── services/
│   ├── apiClient.js         # Unified API handler (axios/fetch wrapper)
│   ├── filingService.js     # Filing CRUD (ITR1, ITR2)
│   └── authService.js
└── contexts/
    └── AppContext.js        # Global state (auth, flags, UI prefs)
```

### **Backend**

```
backend/src/
├── routes/
│   └── itr.js               # Single entry, itrType param decides flow
├── controllers/
│   └── ITRController.js     # Handles create/validate/submit
├── services/
│   ├── ValidationEngine.js  # itrType-based rule sets
│   ├── TaxComputationEngine.js
│   ├── ERIIntegration.js
│   └── DocumentService.js
├── models/
│   ├── ITRFiling.js         # itr_filings schema
│   ├── ITRDraft.js          # itr_drafts schema
│   └── User.js
└── common/
    ├── rules/itr1.rules.json
    ├── rules/itr2.rules.json
    └── taxSlabs/2024-25.json
```

---

## 3. 🔄 Refactor Rules

1. **Duplicate Files → Merge & Delete**
   - Keep only one `ITRFiling.js` orchestrator.
   - Remove all stray `itr1.js`, `itr2.js` clones → use `itrType`.

2. **Shared Logic → Centralize**
   - Validation → `ValidationEngine.js` with rule configs.
   - Tax computation → `TaxComputationEngine.js`.
   - API calls → `apiClient.js`.

3. **UI Consistency → Common Library**
   - Buttons, Cards, Tooltips, Modals → from `components/Common`.
   - Status colors → `theme.js` or `design-system.css`.

4. **Feature Toggles → Configurable**
   - AI assist, OCR, ERI live integration → driven by `featureFlags.js`.

5. **Kill Hardcoding**
   - Slabs, caps (80C, 80D, etc.) in JSON under `/common/rules`.
   - Never inside React or Node files.

---

## 4. 🧹 Cleanup Process (Step-by-Step)

1. **Audit** → List duplicates (already noted).
2. **Canonicalize** → Pick master files (per module).
3. **Refactor** → Route all calls to canonical services.
4. **Delete** → Remove duplicate/legacy files.
5. **Lint + Format** → Prettier + ESLint with strict rules.
6. **Test Coverage** → Add tests before deleting risky files.

---

## 5. 📊 Quality Guardrails

- **Code Review Checklist**
  - Is this logic already implemented elsewhere?
  - Does this file belong to the right folder (pages vs services vs components)?
  - Are validation rules centralized?
  - Are UI elements using common components?

- **Static Analysis**
  - ESLint + SonarQube for code smells + duplication detection.

- **Design Enforcement**
  - Storybook for UI components → every button, card, tooltip must come from library.
  - Figma alignment check → design tokens (`theme.js`) enforced.

- **Performance Checks**
  - Bundle analyzer → cap size at < 250kb for core JS on mobile.
  - DB queries tested with `EXPLAIN` for indexing.

---

## 6. 🚀 Deliverables After Refactor

- **One clean file tree** (frontend + backend) with no duplication.
- **Canonical engines** for validation + computation.
- **Unified design system** with reusable components.
- **Tests passing** → 80% coverage for core modules.
- **Migration scripts** in version control.
- **Docs updated** → architecture.md + source_of_truth.md reflect reality.

---

👉 In short: **Reset to modular, layered architecture, cut duplication, centralize rules, and enforce a design system.**

Would you like me to **draft the exact migration/refactor tracker** (file-by-file, who cleans what, dependencies) so your CTO can run it sprint by sprint?

    Got it ✅ — this is a classic case of **fragmented development + scope creep → duplication + tech debt**. To fix this, we need a **single, enforceable guide** that resets the codebase to our enterprise-grade BurnBlack architecture. Here’s the **crisp playbook** for your CTO + devs:

---

# 🏗️ BurnBlack Codebase Reset & Refactor Guide

**Objective:** Eliminate duplication, enforce modularity, and realign implementation with architecture → **zero ambiguity, enterprise-grade clarity.**

---

## 1. 🔑 Guiding Principles

- **Single Source of Truth**: Every feature has _one canonical implementation_, consumed via services/components.
- **Separation of Concerns**: UI ↔ Business Logic ↔ Persistence must remain distinct.
- **Config > Code**: Rules (tax slabs, validation) live in configs/JSON, not scattered in code.
- **Reusability**: Shared logic sits in `/common` or `/services`, never duplicated.
- **Convention over Configuration**: File structure follows standard, predictable paths.

---

## 2. 📂 Canonical File Structure

### **Frontend**

```
frontend/src/
├── pages/               # High-level flows (Dashboard, ITR1, ITR2, Admin)
│   └── ITR/
│       ├── ITRFiling.js     # Orchestrator (shared)
│       ├── ITR1Filing.js    # Wrapper for ITR-1 configs
│       ├── ITR2Filing.js    # Wrapper for ITR-2 configs
│       └── FilingHistory.js
├── components/
│   ├── ITR/                 # Shared filing UI components
│   │   ├── IncomeForm.js
│   │   ├── DeductionForm.js
│   │   ├── TaxSummaryPanel.js
│   │   └── ValidationMessages.js
│   ├── Common/              # Buttons, Cards, Tooltips, Status indicators
│   └── Layout/              # Nav, Sidebar, Header
├── services/
│   ├── apiClient.js         # Unified API handler (axios/fetch wrapper)
│   ├── filingService.js     # Filing CRUD (ITR1, ITR2)
│   └── authService.js
└── contexts/
    └── AppContext.js        # Global state (auth, flags, UI prefs)
```

### **Backend**

```
backend/src/
├── routes/
│   └── itr.js               # Single entry, itrType param decides flow
├── controllers/
│   └── ITRController.js     # Handles create/validate/submit
├── services/
│   ├── ValidationEngine.js  # itrType-based rule sets
│   ├── TaxComputationEngine.js
│   ├── ERIIntegration.js
│   └── DocumentService.js
├── models/
│   ├── ITRFiling.js         # itr_filings schema
│   ├── ITRDraft.js          # itr_drafts schema
│   └── User.js
└── common/
    ├── rules/itr1.rules.json
    ├── rules/itr2.rules.json
    └── taxSlabs/2024-25.json
```

---

## 3. 🔄 Refactor Rules

1. **Duplicate Files → Merge & Delete**
   - Keep only one `ITRFiling.js` orchestrator.
   - Remove all stray `itr1.js`, `itr2.js` clones → use `itrType`.

2. **Shared Logic → Centralize**
   - Validation → `ValidationEngine.js` with rule configs.
   - Tax computation → `TaxComputationEngine.js`.
   - API calls → `apiClient.js`.

3. **UI Consistency → Common Library**
   - Buttons, Cards, Tooltips, Modals → from `components/Common`.
   - Status colors → `theme.js` or `design-system.css`.

4. **Feature Toggles → Configurable**
   - AI assist, OCR, ERI live integration → driven by `featureFlags.js`.

5. **Kill Hardcoding**
   - Slabs, caps (80C, 80D, etc.) in JSON under `/common/rules`.
   - Never inside React or Node files.

---

## 4. 🧹 Cleanup Process (Step-by-Step)

1. **Audit** → List duplicates (already noted).
2. **Canonicalize** → Pick master files (per module).
3. **Refactor** → Route all calls to canonical services.
4. **Delete** → Remove duplicate/legacy files.
5. **Lint + Format** → Prettier + ESLint with strict rules.
6. **Test Coverage** → Add tests before deleting risky files.

---

## 5. 📊 Quality Guardrails

- **Code Review Checklist**
  - Is this logic already implemented elsewhere?
  - Does this file belong to the right folder (pages vs services vs components)?
  - Are validation rules centralized?
  - Are UI elements using common components?

- **Static Analysis**
  - ESLint + SonarQube for code smells + duplication detection.

- **Design Enforcement**
  - Storybook for UI components → every button, card, tooltip must come from library.
  - Figma alignment check → design tokens (`theme.js`) enforced.

- **Performance Checks**
  - Bundle analyzer → cap size at < 250kb for core JS on mobile.
  - DB queries tested with `EXPLAIN` for indexing.

---

## 6. 🚀 Deliverables After Refactor

- **One clean file tree** (frontend + backend) with no duplication.
- **Canonical engines** for validation + computation.
- **Unified design system** with reusable components.
- **Tests passing** → 80% coverage for core modules.
- **Migration scripts** in version control.
- **Docs updated** → architecture.md + source_of_truth.md reflect reality.

---

👉 In short: **Reset to modular, layered architecture, cut duplication, centralize rules, and enforce a design system.**

Would you like me to **draft the exact migration/refactor tracker** (file-by-file, who cleans what, dependencies) so your CTO can run it sprint by sprint?

Perfect ✅ — here’s the **Duplicate → Canonical File Mapping Matrix** for BurnBlack. This will be your CTO’s **surgical cleanup map** — exactly which files to keep, which to delete, and what they consolidate into.

---

# 🗂️ BurnBlack Duplicate Cleanup Matrix

---

## 1. **Backend – Filing System**

| Duplicate Files                                                                                        | Canonical File (Keep)              | Action                                                                |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------- | --------------------------------------------------------------------- |
| `routes/itr1.js`, `routes/itr2.js`, `routes/filing.js`                                                 | `routes/itr.js`                    | Merge logic → use `itrType` param                                     |
| `controllers/ITR1Controller.js`, `controllers/ITR2Controller.js`, `controllers/ITRFilingController.js` | `controllers/ITRController.js`     | Consolidate → methods: `createDraft`, `validate`, `compute`, `submit` |
| `services/TaxComputationEngine.js` (partially working), duplicated logic in controllers                | `services/TaxComputationEngine.js` | Refactor into strategy pattern (`ITR1Calculator`, `ITR2Calculator`)   |
| Multiple draft handlers (inside controllers & services)                                                | `models/ITRDraft.js`               | Centralize draft schema with JSONB field                              |
| Multiple validation functions scattered                                                                | `services/ValidationEngine.js`     | Load rules from config JSON per ITR type                              |

---

## 2. **Frontend – Filing Pages**

| Duplicate Files                                                                                      | Canonical File (Keep)                                                   | Action                                                      |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| `pages/ITR/ITR1Filing.js`, `pages/ITR/ITR2Filing.js`                                                 | `pages/ITR/ITRFiling.js`                                                | Orchestrator handles stepper, loads form based on `itrType` |
| `components/ITR/IncomeForm.js`, `components/ITR/DeductionForm.js`, `components/ITR/TaxCalculator.js` | Keep all three, but refactor into **parameterized reusable components** | Delete ITR-specific variants; extend with props/config      |
| Any specialized forms (e.g., for ITR-2 like Capital Gains, Foreign Income)                           | New files: `CapitalGainsForm.js`, `ForeignIncomeForm.js`                | Add only where unique logic exists                          |
| Duplicate state mgmt in each form                                                                    | `contexts/FilingContext.js`                                             | Centralize form state + draft handling                      |

---

## 3. **Admin Dashboards**

| Duplicate Files                                                                                                       | Canonical File (Keep)                          | Action                                                                     |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------- |
| `AdminDashboard.js`, `PlatformAdminDashboard.js`, `CAFirmAdminDashboard.js`, `CADashboard.js`, `SeniorCADashboard.js` | `pages/Dashboard/AdminDashboard.js` (scaffold) | Consolidate into single admin framework → role-based conditional rendering |
| Duplicate stats/components (AdminStats.js, UserManagement.js, ServiceManagement.js scattered)                         | `components/Dashboard/`                        | Modularize: keep one file per feature, import everywhere                   |

---

## 4. **Notification System**

| Duplicate Files                                                         | Canonical File (Keep)                                                           | Action                                                      |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `services/notificationService.js` (backend) + duplicates in controllers | `services/notificationService.js`                                               | Consolidate logic here only                                 |
| `NotificationSystem.js` (frontend) + `pages/Notifications.js`           | Keep `NotificationSystem.js` as UI component + `pages/Notifications.js` as page | Delete extra hook stubs unless used (`useNotifications.js`) |

---

## 5. **Document Management**

| Duplicate Files                                                                                           | Canonical File (Keep)                               | Action                                                                        |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------- |
| `routes/documents.js`, `controllers/DocumentController.js`, `services/documentService.js`                 | Keep all 3, clean separation of concerns            | Delete file-upload duplicates in middleware; keep `middleware/file-upload.js` |
| Frontend: `DocumentUpload.js`, `DocumentList.js`, `DocumentViewer.js`, `FileUpload.js`, `DocumentCard.js` | Keep all 5, modularize into `components/Documents/` | Remove duplicate upload logic in forms                                        |

---

## 6. **Design System & Styling**

| Duplicate Files                                                           | Canonical File (Keep)                                                        | Action                                      |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------- |
| `styles/mobile-first.css`, `styles/design-system.css`, `styles/index.css` | Keep `design-system.css` as token source, `mobile-first.css` for breakpoints | Refactor `index.css` to only handle imports |
| Duplicate button/card styles in multiple components                       | `components/Common/` → Button.js, Card.js, Tooltip.js                        | Standardize & enforce use across platform   |

---

# 🛠️ Cleanup Steps (CTO Execution Order)

1. **Backend Filing** – Merge routes/controllers/services → 1 canonical flow.
2. **Frontend Filing** – Orchestrator + reusable components → delete duplicates.
3. **Dashboards** – One admin framework, conditional role rendering.
4. **Notifications** – Single backend service + 1 UI system.
5. **Documents** – Modularize & remove duplicates.
6. **Design System** – All styles + components centralized.

---

# 📊 Outcome

- **50% fewer files** (no duplicates).
- **Clear modular structure** (controllers, services, models, UI).
- **Zero ambiguity** → each feature has **exact one place**.
- **Future-proof** → Adding new ITR = extend rules/config, not rewrite code.

---

⚡ Now, before I hand this tracker to your CTO:
Do you want me to **expand this into a sprint plan** (like 1 week per cleanup area), or keep it as a one-shot execution order list?
