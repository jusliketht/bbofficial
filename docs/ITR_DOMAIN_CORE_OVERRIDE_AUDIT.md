# ITR Domain Core - Override and Audit Mapping

**Generated:** December 2024  
**Purpose:** Map override and audit points (CA edits, admin edits, auto-corrections)

---

## Rule

> Override allowed ONLY in `COMPUTED`, never after `LOCKED`

---

## CA Edit Functionality

### CA Review and Edit

#### `backend/src/controllers/AdminController.js`
- **Methods:** Admin user management and editing
- **State:** Should be `COMPUTED` for overrides
- **Override Reason:** ⚠️ Not explicitly required
- **Audit:** ⚠️ May not be triggered for all edits
- **Violation:** ❌ No state check before allowing CA edits

#### `backend/src/services/business/ExpertReviewService.js`
- **Purpose:** Expert/CA review service
- **State:** Should be `COMPUTED` for overrides
- **Override Reason:** ⚠️ Not explicitly required
- **Audit:** ⚠️ May not be triggered
- **Violation:** ❌ No state check

#### `backend/src/services/business/CAReviewQueueService.js`
- **Purpose:** CA review queue management
- **State:** Should be `COMPUTED` for overrides
- **Override Reason:** ⚠️ Not explicitly required
- **Audit:** ⚠️ May not be triggered
- **Violation:** ❌ No state check

#### `frontend/src/components/CA/CANotes.js`
- **Purpose:** CA notes component
- **State:** Should be `COMPUTED` for overrides
- **Override Reason:** ⚠️ Not explicitly required
- **Audit:** ⚠️ May not be triggered
- **Violation:** ❌ No state check

#### `frontend/src/components/CA/ClientCommunication.js`
- **Purpose:** Client communication component
- **State:** Should be `COMPUTED` for overrides
- **Override Reason:** ⚠️ Not explicitly required
- **Audit:** ⚠️ May not be triggered
- **Violation:** ❌ No state check

---

## Admin Edit Functionality

### Admin Override

#### `backend/src/controllers/AdminController.js`
- **Methods:** Admin user management, may include ITR editing
- **State:** Should be `COMPUTED` for overrides (admin unlock may be allowed in `LOCKED`)
- **Override Reason:** ⚠️ Not explicitly required
- **Audit:** ⚠️ May not be triggered
- **Violation:** ❌ No state check

#### `backend/src/controllers/AdminSupportController.js`
- **Methods:** Admin support operations
- **State:** Should be `COMPUTED` for overrides
- **Override Reason:** ⚠️ Not explicitly required
- **Audit:** ⚠️ May not be triggered
- **Violation:** ❌ No state check

---

## System Auto-Correction

### Auto-Population and Auto-Correction

#### `frontend/src/services/AutoPopulationITRService.js`
- **Purpose:** Auto-population service
- **State:** Should be `DATA_COLLECTED` or `DATA_CONFIRMED`
- **Override Reason:** N/A (system operation)
- **Audit:** ⚠️ May not be triggered
- **Violation:** ⚠️ No state check

#### `frontend/src/services/ITRAutoFillService.js`
- **Purpose:** Auto-fill service
- **State:** Should be `DATA_COLLECTED` or `DATA_CONFIRMED`
- **Override Reason:** N/A (system operation)
- **Audit:** ⚠️ May not be triggered
- **Violation:** ⚠️ No state check

#### `backend/src/services/business/DeductionTypeDetectionService.js`
- **Purpose:** AI-powered deduction detection
- **State:** Should be `DATA_COLLECTED` or `DATA_CONFIRMED`
- **Override Reason:** N/A (system operation)
- **Audit:** ⚠️ May not be triggered
- **Violation:** ⚠️ No state check

#### `backend/src/services/business/AIRecommendationService.js`
- **Purpose:** AI recommendations
- **State:** Should be `DATA_COLLECTED`, `DATA_CONFIRMED`, or `COMPUTED`
- **Override Reason:** N/A (recommendations only)
- **Audit:** N/A (read-only recommendations)
- **Violation:** ⚠️ No state check

---

## Audit Logging Points

### Current Audit Implementation

#### `backend/src/services/utils/AuditService.js`
- **Purpose:** Audit logging service
- **Methods:** `logAction()`, `getAuditLogs()`, `getUserActivity()`
- **Status:** ✅ Exists but may not be called for all overrides

#### `backend/src/middleware/auditLogger.js`
- **Purpose:** Audit logging middleware
- **Status:** ✅ Exists but may not capture all override operations

#### `backend/src/models/AuditLog.js`
- **Purpose:** Audit log model
- **Status:** ✅ Exists

---

## Override Points Summary

### CA Edits
- **Location:** CA review components and services
- **Current State:** ⚠️ No state validation
- **Override Reason:** ⚠️ Not explicitly required
- **Audit:** ⚠️ May not be triggered
- **Required Fix:**
  - Check state is `COMPUTED` before allowing overrides
  - Require override reason
  - Trigger audit log

### Admin Edits
- **Location:** Admin controllers and services
- **Current State:** ⚠️ No state validation
- **Override Reason:** ⚠️ Not explicitly required
- **Audit:** ⚠️ May not be triggered
- **Required Fix:**
  - Check state is `COMPUTED` (or `LOCKED` for admin unlock)
  - Require override reason
  - Trigger audit log

### System Auto-Corrections
- **Location:** Auto-population and auto-fill services
- **Current State:** ⚠️ No state validation
- **Override Reason:** N/A (system operation)
- **Audit:** ⚠️ May not be triggered
- **Required Fix:**
  - Check state allows auto-population
  - Trigger audit log for system operations

---

## Summary

### Critical Violations (❌)

1. **CA edits** - No state check before allowing overrides
2. **Admin edits** - No state check before allowing overrides
3. **Override reason** - Not explicitly required for CA/admin edits
4. **Audit logging** - May not be triggered for all overrides

### Warnings (⚠️)

1. **System auto-corrections** - No state validation
2. **Auto-population** - No state check
3. **AI recommendations** - No state check

### Recommendations

1. **All overrides must check state** - Only allow in `COMPUTED` (or `LOCKED` for admin unlock)
2. **Override reason must be mandatory** - Require reason for all CA/admin overrides
3. **Audit must be triggered** - Log all override operations
4. **System operations must be logged** - Audit all auto-corrections and auto-populations

