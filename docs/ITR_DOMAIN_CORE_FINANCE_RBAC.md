# ITR Domain Core - Finance and RBAC Readiness

**Generated:** December 2024  
**Purpose:** Annotate future finance and RBAC hooks (DO NOT IMPLEMENT)

---

## Finance/Billing Hooks (Future)

### Billing Points

#### `COMPUTED` State
- **Hook Point:** After tax computation completes
- **Action:** Charge for computation service
- **Current Implementation:** ⚠️ Not implemented
- **Annotation:** 
  ```javascript
  // FUTURE: Billing hook at COMPUTED state
  // When Domain Core transitions to COMPUTED:
  // 1. Calculate billing amount based on ITR type and complexity
  // 2. Create invoice via InvoiceService
  // 3. Charge user (if not free tier)
  // 4. Update filing with invoice ID
  ```

#### `LOCKED` State
- **Hook Point:** After filing is locked
- **Action:** Charge for locking/filing preparation
- **Current Implementation:** ⚠️ Not implemented
- **Annotation:**
  ```javascript
  // FUTURE: Billing hook at LOCKED state
  // When Domain Core transitions to LOCKED:
  // 1. Calculate locking fee (if applicable)
  // 2. Create invoice via InvoiceService
  // 3. Charge user
  // 4. Update filing with invoice ID
  ```

#### `FILED` State
- **Hook Point:** After ITR is filed/submitted
- **Action:** Charge for filing service
- **Current Implementation:** ⚠️ Not implemented
- **Annotation:**
  ```javascript
  // FUTURE: Billing hook at FILED state
  // When Domain Core transitions to FILED:
  // 1. Calculate filing fee based on ITR type
  // 2. Create invoice via InvoiceService
  // 3. Charge user (if not already charged)
  // 4. Update filing with invoice ID
  // 5. Send payment confirmation
  ```

### Current Billing Implementation

#### `backend/src/services/business/InvoiceService.js`
- **Purpose:** Invoice generation service
- **Status:** ✅ Exists but not integrated with domain states
- **Annotation:** Should be called at billing hook points

#### `backend/src/controllers/PaymentController.js`
- **Purpose:** Payment processing
- **Status:** ✅ Exists but not integrated with domain states
- **Annotation:** Should be called at billing hook points

---

## RBAC (Role-Based Access Control) Hooks

### RBAC Rule

> RBAC checks should only:
> - Gate **who** can perform an allowed action
> - Never decide **what** is allowed (Domain Core decides)

### Current RBAC Implementation

#### `backend/src/middleware/rbac.js`
- **Purpose:** Role-based access control middleware
- **Methods:** `requireRole()`, `requirePermission()`, `checkPermission()`
- **Current Logic:**
  - Checks user role (END_USER, CA, ADMIN, SUPERADMIN)
  - Checks permissions
  - Gates access to routes
- **Status:** ✅ Exists
- **Annotation:**
  ```javascript
  // RBAC should be applied AFTER Domain Core decides allowed actions
  // Flow:
  // 1. Domain Core determines allowed_actions[] based on state
  // 2. RBAC filters allowed_actions[] based on user role/permissions
  // 3. User can only perform actions that pass both Domain Core and RBAC
  ```

### RBAC Integration Points

#### State-Based Action Gating
- **Location:** Domain Core `getAllowedActions()`
- **Annotation:**
  ```javascript
  // FUTURE: RBAC integration in Domain Core
  // getAllowedActions(filingId, userContext) {
  //   1. Get base allowed actions for current state
  //   2. Apply RBAC filter based on userContext.role
  //   3. Return filtered allowed_actions[]
  // }
  ```

#### Controller-Level RBAC
- **Location:** All ITR controllers
- **Current Logic:** RBAC middleware applied at route level
- **Annotation:**
  ```javascript
  // RBAC middleware should:
  // 1. Check if user has permission to access route
  // 2. But NOT decide if action is allowed (Domain Core decides)
  // 3. Domain Core will check state and return allowed_actions[]
  // 4. Controller should verify action is in allowed_actions[] before executing
  ```

---

## Finance and RBAC Summary

### Billing Hooks (Future)

1. **COMPUTED** - Charge for computation
2. **LOCKED** - Charge for locking
3. **FILED** - Charge for filing

### RBAC Integration (Future)

1. **Domain Core** - Should filter `allowed_actions[]` based on RBAC
2. **Controllers** - Should verify action is in `allowed_actions[]` before executing
3. **Middleware** - Should gate route access but not decide action legality

### Current Status

- ✅ Billing infrastructure exists (InvoiceService, PaymentController)
- ✅ RBAC infrastructure exists (rbac middleware)
- ⚠️ Not integrated with domain states
- ⚠️ Billing hooks not implemented
- ⚠️ RBAC not integrated with Domain Core

### Recommendations

1. **Implement billing hooks** at state transitions (COMPUTED, LOCKED, FILED)
2. **Integrate RBAC with Domain Core** - Filter allowed actions based on role
3. **Separate concerns** - RBAC gates "who", Domain Core decides "what"
4. **Add billing state tracking** - Track billing status per filing

