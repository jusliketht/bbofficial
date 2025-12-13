---
name: Remove Mock Data and Optimize DB Operations
overview: Remove all mock data from the platform, replace with real API calls and database operations, verify all DB operations work correctly, and optimize database queries for performance (indexes, N+1 queries, pagination).
todos:
  - id: itr-lifecycle-analysis
    content: Complete analysis of ITR lifecycle phases and identify gaps
    status: completed
  - id: post-filing-priority
    content: Prioritize post-filing features (ITR-V, Assessment, Tax Demand) as P0 critical
    status: completed
    dependencies:
      - itr-lifecycle-analysis
  - id: itr-v-backend
    content: Implement ITR-V Processing Service and backend APIs
    status: completed
    dependencies:
      - post-filing-priority
  - id: itr-v-frontend
    content: Build ITR-V tracking UI components and pages
    status: completed
    dependencies:
      - itr-v-backend
  - id: assessment-backend
    content: Implement Assessment Notice Service and backend APIs
    status: completed
    dependencies:
      - post-filing-priority
  - id: assessment-frontend
    content: Build Assessment Notice management UI components
    status: completed
    dependencies:
      - assessment-backend
  - id: tax-demand-backend
    content: Implement Tax Demand Service and backend APIs with payment integration
    status: completed
    dependencies:
      - post-filing-priority
  - id: tax-demand-frontend
    content: Build Tax Demand management UI components with payment forms
    status: completed
    dependencies:
      - tax-demand-backend
  - id: analytics-enhancement
    content: Enhance filing analytics with year-over-year comparison and trends
    status: completed
    dependencies:
      - post-filing-priority
  - id: scenario-planning-enhancement
    content: Complete scenario planning tool to 100% (currently 70%)
    status: completed
  - id: tax-optimizer-completion
    content: Complete tax optimizer to 100% (currently 70%)
    status: completed
  - id: lifecycle-testing
    content: End-to-end testing of complete ITR lifecycle
    status: completed
    dependencies:
      - itr-v-frontend
      - assessment-frontend
      - tax-demand-frontend
      - analytics-enhancement
---

# Remove Mock Data and Optimize DB Operations

## Overview

This plan removes all mock data from the platform, replaces it with real database operations, verifies all DB operations work correctly, and optimizes database queries for performance.

## Phase 1: Identify and Remove Mock Data

### 1.1 Backend Mock Data Removal

**Files to Update:**

1. **[backend/src/controllers/ITRController.js](backend/src/controllers/ITRController.js)**

   - Line 610: Replace mock acknowledgment number generation with real ERI integration
   - Line 3030-3031: Replace `TEMP_SHARE_TOKEN` with secure token generation
   - Line 3391: Replace mock OCR processing with real OCR service

2. **[backend/src/controllers/UserController.js](backend/src/controllers/UserController.js)**

   - Line 647-873: Replace mock notifications data with real `Notification` model queries
   - Use `Notification.findAll()` with proper filters and pagination

3. **[backend/src/controllers/AdminController.js](backend/src/controllers/AdminController.js)**

   - Line 4950: Replace mock document templates with real `DocumentTemplate` model (create if needed)
   - Line 4993: Implement real document template creation

4. **[backend/src/services/business/AssessmentNoticeService.js](backend/src/services/business/AssessmentNoticeService.js)**

   - Check for any mock data in notice processing

5. **[backend/src/services/business/ITRVProcessingService.js](backend/src/services/business/ITRVProcessingService.js)**

   - Verify all operations use real database queries

### 1.2 Frontend Mock Data Removal

**Files to Update:**

1. **[frontend/src/hooks/useFilingStatistics.js](frontend/src/hooks/useFilingStatistics.js)**

   - Already uses real API calls - verify it's working correctly
   - Add error handling if missing

2. **[frontend/src/pages/Admin/AdminPlatformOverview.js](frontend/src/pages/Admin/AdminPlatformOverview.js)**

   - Replace `mockPlatformStats` with real API call to `/api/admin/platform/stats`
   - Create backend endpoint if missing

3. **[frontend/src/pages/Admin/AdminControlPanel.js](frontend/src/pages/Admin/AdminControlPanel.js)**

   - Replace `mockSettings`, `mockCaFirms`, `mockUserLimits` with real API calls
   - Use existing admin endpoints or create new ones

4. **[frontend/src/services/form16ExtractionService.js](frontend/src/services/form16ExtractionService.js)**

   - Replace simulated PDF extraction with real OCR API call
   - Integrate with backend OCR service

5. **[frontend/src/services/DeductionOCRService.js](frontend/src/services/DeductionOCRService.js)**

   - Remove `mockDetection()` method
   - Ensure all calls use real OCR API

6. **[frontend/src/components/Layout/NotificationsPanel.js](frontend/src/components/Layout/NotificationsPanel.js)**

   - Verify uses real notification API

7. **[frontend/src/pages/Acknowledgment.js](frontend/src/pages/Acknowledgment.js)**

   - Verify uses real filing data

8. **[frontend/src/pages/Dashboard/UserDashboard.js](frontend/src/pages/Dashboard/UserDashboard.js)**

   - Check for any mock data usage

## Phase 2: Verify Database Operations

### 2.1 Code Review Verification

**Check all database operations:**

1. **Model Usage**

   - Verify all `findAll()`, `findOne()`, `findByPk()`, `create()`, `update()`, `destroy()` use real Sequelize models
   - No hardcoded data or mock responses

2. **Service Layer**

   - All services use real database models
   - No `Promise.resolve(mockData)` patterns
   - No `setTimeout(() => resolve(mockData))` patterns

3. **Controller Layer**

   - All controllers call real services
   - No direct mock data returns

### 2.2 Test Critical Queries

**Create test script: [backend/src/scripts/test-db-operations.js](backend/src/scripts/test-db-operations.js)**

Test the following operations:

- User CRUD operations
- ITR filing CRUD operations
- Notification queries
- Document queries
- Admin statistics queries
- Assessment notice queries
- Tax demand queries
- ITR-V processing queries
- Scenario save/load operations

**Verification Steps:**

1. Test each endpoint with real database
2. Verify data is persisted correctly
3. Verify queries return expected results
4. Check for any errors or missing data

## Phase 3: Database Performance Optimization

### 3.1 Add Missing Indexes

**Create migration: [backend/src/scripts/migrations/add-performance-indexes.js](backend/src/scripts/migrations/add-performance-indexes.js)**

**Indexes to Add:**

1. **ITR Filings Table**

   - Composite index: `(user_id, status, created_at DESC)` - for user filings with status filter
   - Composite index: `(firm_id, status, created_at DESC)` - for CA firm queries
   - Index: `assessment_year` - for year-based queries
   - Index: `submitted_at` - for date range queries
   - Composite index: `(user_id, assessment_year)` - for user year queries

2. **Notifications Table**

   - Composite index: `(user_id, is_read, created_at DESC)` - for unread notifications
   - Index: `created_at DESC` - for sorting

3. **Documents Table**

   - Composite index: `(user_id, category, created_at DESC)` - for user document queries
   - Composite index: `(filing_id, category)` - for filing documents

4. **Assessment Notices Table**

   - Composite index: `(user_id, status, received_date DESC)` - for user notices
   - Index: `due_date` - for overdue queries

5. **Tax Demands Table**

   - Composite index: `(user_id, status, received_date DESC)` - for user demands
   - Index: `due_date` - for overdue queries

6. **ITR-V Processing Table**

   - Composite index: `(filing_id, status)` - for filing status queries
   - Index: `expiry_date` - for expiry queries

7. **Scenarios Table**

   - Composite index: `(user_id, filing_id, created_at DESC)` - for user scenarios
   - Index: `scenario_type` - for type filtering

8. **Users Table**

   - Index: `email` (if not exists) - for login queries
   - Index: `pan_number` (if not exists) - for PAN lookups

### 3.2 Fix N+1 Query Problems

**Files to Optimize:**

1. **[backend/src/controllers/AdminController.js](backend/src/controllers/AdminController.js)**

   - Line 4536-4537: Use `include` with `User` model in `Document.findAndCountAll()` to avoid N+1
   - Optimize user info fetching for documents

2. **[backend/src/controllers/ITRController.js](backend/src/controllers/ITRController.js)**

   - Use `include` for related models (User, CAFirm, Invoice) in filing queries
   - Avoid separate queries for each filing

3. **[backend/src/services/business/TaxDemandService.js](backend/src/services/business/TaxDemandService.js)**

   - Line 181-189: Already uses `include` - verify it's optimal

4. **[backend/src/services/business/AssessmentNoticeService.js](backend/src/services/business/AssessmentNoticeService.js)**

   - Use `include` for User and ITRFiling in notice queries

5. **[backend/src/services/business/ITRVProcessingService.js](backend/src/services/business/ITRVProcessingService.js)**

   - Line 153-165: Already uses JOIN - verify it's optimal

6. **[backend/src/services/business/FilingAnalyticsService.js](backend/src/services/business/FilingAnalyticsService.js)**

   - Use aggregation queries instead of fetching all records
   - Use `COUNT()`, `SUM()`, `AVG()` in SQL instead of JavaScript calculations

### 3.3 Add Pagination to All List Queries

**Files to Update:**

1. **[backend/src/controllers/AdminController.js](backend/src/controllers/AdminController.js)**

   - Verify all list endpoints have pagination (page, limit, offset)
   - Add pagination to any missing endpoints

2. **[backend/src/controllers/UserController.js](backend/src/controllers/UserController.js)**

   - Add pagination to notifications endpoint
   - Verify other list endpoints have pagination

3. **[backend/src/services/business/TaxDemandService.js](backend/src/services/business/TaxDemandService.js)**

   - Add pagination to `getUserDemands()` method

4. **[backend/src/services/business/AssessmentNoticeService.js](backend/src/services/business/AssessmentNoticeService.js)**

   - Add pagination to `getUserNotices()` method

5. **[backend/src/services/business/ITRVProcessingService.js](backend/src/services/business/ITRVProcessingService.js)**

   - Add pagination to `getUserITRVRecords()` method

6. **[backend/src/services/business/ScenarioService.js](backend/src/services/business/ScenarioService.js)**

   - Add pagination to `getUserScenarios()` method

**Pagination Pattern:**

```javascript
const { page = 1, limit = 20 } = req.query;
const offset = (page - 1) * limit;

const { count, rows } = await Model.findAndCountAll({
  where: conditions,
  limit: parseInt(limit),
  offset: parseInt(offset),
  order: [['created_at', 'DESC']],
});

return {
  data: rows,
  pagination: {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(count / limit),
  },
};
```

### 3.4 Query Optimization Best Practices

**Apply to all services:**

1. **Use SELECT specific columns** instead of `SELECT *`

   - Only fetch needed fields
   - Reduces data transfer

2. **Use raw SQL for complex aggregations**

   - Better performance than Sequelize for complex queries
   - Use `sequelize.query()` with parameterized queries

3. **Add query result caching** (optional)

   - Cache frequently accessed, rarely changed data
   - Use Redis or in-memory cache

4. **Use database views** for complex queries

   - Pre-computed aggregations
   - Faster than running complex queries each time

## Phase 4: Create Missing Backend Endpoints

### 4.1 Admin Platform Stats Endpoint

**Create: [backend/src/controllers/AdminController.js](backend/src/controllers/AdminController.js)**

Add method:

```javascript
async getPlatformStats(req, res, next) {
  // Real database queries for:
  // - Total users
  // - Total filings
  // - Revenue stats
  // - Active CA firms
  // - System health metrics
}
```

**Route:** `GET /api/admin/platform/stats`

### 4.2 Document Template Model and Endpoints

**Create: [backend/src/models/DocumentTemplate.js](backend/src/models/DocumentTemplate.js)**

**Create migration: [backend/src/scripts/migrations/create-document-templates-table.js](backend/src/scripts/migrations/create-document-templates-table.js)**

**Update: [backend/src/controllers/AdminController.js](backend/src/controllers/AdminController.js)**

- Replace mock `getDocumentTemplates()` with real queries
- Implement real `createDocumentTemplate()` method

## Phase 5: Testing and Verification

### 5.1 Create Test Script

**Create: [backend/src/scripts/test-db-operations.js](backend/src/scripts/test-db-operations.js)**

Test all critical operations:

- User authentication
- ITR filing creation/update
- Notification creation/retrieval
- Document upload/retrieval
- Assessment notice operations
- Tax demand operations
- ITR-V processing
- Scenario save/load
- Admin statistics

### 5.2 Performance Testing

**Create: [backend/src/scripts/test-query-performance.js](backend/src/scripts/test-query-performance.js)**

Test query performance:

- Measure query execution time
- Verify indexes are being used
- Check for slow queries (>500ms)
- Generate performance report

## Implementation Order

1. **Phase 1**: Remove mock data (Backend → Frontend)
2. **Phase 2**: Verify DB operations (Code review → Test queries)
3. **Phase 3**: Optimize performance (Indexes → N+1 → Pagination)
4. **Phase 4**: Create missing endpoints
5. **Phase 5**: Testing and verification

## Success Criteria

- ✅ No mock data in codebase
- ✅ All operations use real database
- ✅ All critical queries tested and working
- ✅ All indexes added and verified
- ✅ All N+1 queries fixed
- ✅ All list queries have pagination
- ✅ Query performance < 500ms for 95% of queries
- ✅ All endpoints return real data

## Files Summary

**Backend Files to Modify:**

- `backend/src/controllers/ITRController.js`
- `backend/src/controllers/UserController.js`
- `backend/src/controllers/AdminController.js`
- `backend/src/services/business/*.js` (multiple services)
- `backend/src/models/DocumentTemplate.js` (new)
- `backend/src/scripts/migrations/add-performance-indexes.js` (new)
- `backend/src/scripts/migrations/create-document-templates-table.js` (new)
- `backend/src/scripts/test-db-operations.js` (new)
- `backend/src/scripts/test-query-performance.js` (new)

**Frontend Files to Modify:**

- `frontend/src/hooks/useFilingStatistics.js`
- `frontend/src/pages/Admin/AdminPlatformOverview.js`
- `frontend/src/pages/Admin/AdminControlPanel.js`
- `frontend/src/services/form16ExtractionService.js`
- `frontend/src/services/DeductionOCRService.js`
- `frontend/src/components/Layout/NotificationsPanel.js`
- `frontend/src/pages/Acknowledgment.js`
- `frontend/src/pages/Dashboard/UserDashboard.js`

**Migration Files:**

- Add to `backend/src/scripts/runPendingMigrations.js`:
  - `add-performance-indexes`
  - `create-document-templates-table`