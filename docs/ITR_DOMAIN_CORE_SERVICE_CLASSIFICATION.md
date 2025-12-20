# ITR Domain Core - Service Classification

**Generated:** December 2024  
**Purpose:** Classify backend services into Domain-Independent vs Domain-Dependent

---

## Pure Domain-Independent Services

These services can execute without state checks - they are pure utilities or read-only operations.

### Core Services

#### `TaxComputationEngine` (`backend/src/services/core/TaxComputationEngine.js`)
- **Type:** Pure calculation engine
- **State Dependency:** None (pure function)
- **Note:** Should be called through Domain Core, but the engine itself is stateless
- **Status:** ✅ Domain-Independent

#### `RedisService` (`backend/src/services/core/RedisService.js`)
- **Type:** Infrastructure service (caching)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `JobQueue` (`backend/src/services/core/JobQueue.js`)
- **Type:** Infrastructure service (background jobs)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `CacheService` (`backend/src/services/core/CacheService.js`)
- **Type:** Infrastructure service (caching)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `PDFTemplateEngine` (`backend/src/services/core/PDFTemplateEngine.js`)
- **Type:** Template rendering (read-only)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `PDFGenerationService` (`backend/src/services/core/PDFGenerationService.js`)
- **Type:** PDF generation (read-only)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `DocumentService` (`backend/src/services/core/DocumentService.js`)
- **Type:** File storage operations
- **State Dependency:** None (file operations are stateless)
- **Status:** ✅ Domain-Independent

### Business Services

#### `RefundTrackingService` (`backend/src/services/business/RefundTrackingService.js`)
- **Type:** Read-only tracking service
- **State Dependency:** None (read-only)
- **Status:** ✅ Domain-Independent

#### `BrokerFileProcessingService` (`backend/src/services/business/BrokerFileProcessingService.js`)
- **Type:** File processing (data extraction)
- **State Dependency:** None (pure data extraction)
- **Status:** ✅ Domain-Independent

#### `RentReceiptOCRService` (`backend/src/services/business/RentReceiptOCRService.js`)
- **Type:** OCR service (data extraction)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `PropertyDocumentOCRService` (`backend/src/services/business/PropertyDocumentOCRService.js`)
- **Type:** OCR service (data extraction)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `PANVerificationService` (`backend/src/services/business/PANVerificationService.js`)
- **Type:** External API service (verification)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `AadhaarVerificationService` (`backend/src/services/business/AadhaarVerificationService.js`)
- **Type:** External API service (verification)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `InvoiceService` (`backend/src/services/business/InvoiceService.js`)
- **Type:** Invoice generation (read-only)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `ReportBuilderService` (`backend/src/services/business/ReportBuilderService.js`)
- **Type:** Report generation (read-only)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `FilingAnalyticsService` (`backend/src/services/business/FilingAnalyticsService.js`)
- **Type:** Analytics (read-only)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `KnowledgeBaseService` (`backend/src/services/business/KnowledgeBaseService.js`)
- **Type:** Knowledge base (read-only)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `DeadlineService` (`backend/src/services/business/DeadlineService.js`)
- **Type:** Deadline calculation (read-only)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `YearService` (`backend/src/services/business/YearService.js`)
- **Type:** Year/date utilities (read-only)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `VersionService` (`backend/src/services/business/VersionService.js`)
- **Type:** Version management (read-only)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `PreviousYearCopyService` (`backend/src/services/business/PreviousYearCopyService.js`)
- **Type:** Data copying (read-only source)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `TaxSimulationService` (`backend/src/services/business/TaxSimulationService.js`)
- **Type:** Simulation (read-only, doesn't affect state)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `InvestmentPlanningService` (`backend/src/services/business/InvestmentPlanningService.js`)
- **Type:** Planning service (read-only)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `ScenarioService` (`backend/src/services/business/ScenarioService.js`)
- **Type:** Scenario management (separate from filing state)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `TaxRegimeCalculator` (`backend/src/services/business/TaxRegimeCalculator.js`)
- **Type:** Calculation utility (pure function)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `BusinessIncomeCalculator` (`backend/src/services/business/BusinessIncomeCalculator.js`)
- **Type:** Calculation utility (pure function)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `ProfessionalIncomeCalculator` (`backend/src/services/business/ProfessionalIncomeCalculator.js`)
- **Type:** Calculation utility (pure function)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `TaxPaymentService` (`backend/src/services/business/TaxPaymentService.js`)
- **Type:** Payment tracking (read-only)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `TaxDemandService` (`backend/src/services/business/TaxDemandService.js`)
- **Type:** Demand tracking (read-only)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `AssessmentNoticeService` (`backend/src/services/business/AssessmentNoticeService.js`)
- **Type:** Notice tracking (read-only)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `ITRVProcessingService` (`backend/src/services/business/ITRVProcessingService.js`)
- **Type:** ITR-V tracking (read-only)
- **State Dependency:** None (read-only tracking)
- **Status:** ✅ Domain-Independent

#### `ServiceTicketService` (`backend/src/services/business/ServiceTicketService.js`)
- **Type:** Support ticket management (separate domain)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `MFAService` (`backend/src/services/business/MFAService.js`)
- **Type:** Multi-factor authentication (separate domain)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `ConsentService` (`backend/src/services/business/ConsentService.js`)
- **Type:** Consent management (separate domain)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `ClientProfileService` (`backend/src/services/business/ClientProfileService.js`)
- **Type:** Client profile management (separate domain)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `FirmDashboardService` (`backend/src/services/business/FirmDashboardService.js`)
- **Type:** Dashboard service (read-only)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `CAReviewQueueService` (`backend/src/services/business/CAReviewQueueService.js`)
- **Type:** Review queue management (separate domain)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `ExpertReviewService` (`backend/src/services/business/ExpertReviewService.js`)
- **Type:** Review service (separate domain)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `SourceTaggingService` (`backend/src/services/business/SourceTaggingService.js`)
- **Type:** Data tagging (metadata only)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `RTRService` (`backend/src/services/business/RTRService.js`)
- **Type:** RTR service (read-only)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

#### `eriSigningService` (`backend/src/services/business/eriSigningService.js`)
- **Type:** ERI signing utility (pure function)
- **State Dependency:** None
- **Status:** ✅ Domain-Independent

---

## Domain-Dependent Services (Must be Gated by Domain Core)

These services must only execute if Domain Core allows the action in the current state.

### Core Services

#### `ValidationEngine` (`backend/src/services/core/ValidationEngine.js`)
- **Type:** Validation based on ITR type and state
- **State Dependency:** ⚠️ **MUST be gated by Domain Core**
- **Current Assumptions:** Assumes ITR type is already determined
- **Required Check:** Must verify state allows validation before executing
- **Annotation:** "Must only execute if Domain Core allows validation action in current state"
- **Status:** ⚠️ Domain-Dependent

### Business Services

#### `DeductionTypeDetectionService` (`backend/src/services/business/DeductionTypeDetectionService.js`)
- **Type:** AI-powered deduction detection
- **State Dependency:** ⚠️ **MUST be gated by Domain Core**
- **Current Assumptions:** Assumes data collection state
- **Required Check:** Must verify state allows data mutation before executing
- **Annotation:** "Must only execute if Domain Core allows data mutation in current state"
- **Status:** ⚠️ Domain-Dependent

#### `EVerificationService` (`backend/src/services/business/EVerificationService.js`)
- **Type:** E-verification for ITR submission
- **State Dependency:** ⚠️ **MUST be gated by Domain Core**
- **Current Assumptions:** Assumes filing is in `LOCKED` state
- **Required Check:** Must verify state is `LOCKED` before allowing e-verification
- **Annotation:** "Must only execute if Domain Core allows e-verification (state must be LOCKED)"
- **Status:** ⚠️ Domain-Dependent

#### `DataMatchingService` (`backend/src/services/business/DataMatchingService.js`)
- **Type:** AIS/TIS discrepancy detection and resolution
- **State Dependency:** ⚠️ **MUST be gated by Domain Core**
- **Current Assumptions:** Assumes data is in `DATA_COLLECTED` or `DATA_CONFIRMED` state
- **Required Check:** Must verify state allows data matching/resolution
- **Annotation:** "Must only execute if Domain Core allows data matching in current state"
- **Status:** ⚠️ Domain-Dependent

#### `TaxAuditChecker` (`backend/src/services/business/TaxAuditChecker.js`)
- **Type:** Audit applicability checking
- **State Dependency:** ⚠️ **MUST be gated by Domain Core**
- **Current Assumptions:** Assumes data is collected and computed
- **Required Check:** Must verify state allows audit checking
- **Annotation:** "Must only execute if Domain Core allows audit checking in current state"
- **Status:** ⚠️ Domain-Dependent

#### `ERIIntegrationService` (`backend/src/services/business/ERIIntegrationService.js`)
- **Type:** ERI submission to ITD
- **State Dependency:** ⚠️ **MUST be gated by Domain Core**
- **Current Assumptions:** Assumes filing is in `LOCKED` state
- **Required Check:** Must verify state is `LOCKED` before submission
- **Annotation:** "Must only execute if Domain Core allows ERI submission (state must be LOCKED)"
- **Status:** ⚠️ Domain-Dependent

#### `ForeignAssetsService` (`backend/src/services/business/ForeignAssetsService.js`)
- **Type:** Foreign assets management
- **State Dependency:** ⚠️ **MUST be gated by Domain Core**
- **Current Assumptions:** Assumes data collection state
- **Required Check:** Must verify state allows data mutation
- **Annotation:** "Must only execute if Domain Core allows data mutation in current state"
- **Status:** ⚠️ Domain-Dependent

#### `BalanceSheetService` (`backend/src/services/business/BalanceSheetService.js`)
- **Type:** Balance sheet management
- **State Dependency:** ⚠️ **MUST be gated by Domain Core**
- **Current Assumptions:** Assumes data collection state
- **Required Check:** Must verify state allows data mutation
- **Annotation:** "Must only execute if Domain Core allows data mutation in current state"
- **Status:** ⚠️ Domain-Dependent

#### `AuditInformationService` (`backend/src/services/business/AuditInformationService.js`)
- **Type:** Audit information management
- **State Dependency:** ⚠️ **MUST be gated by Domain Core**
- **Current Assumptions:** Assumes data collection state
- **Required Check:** Must verify state allows data mutation
- **Annotation:** "Must only execute if Domain Core allows data mutation in current state"
- **Status:** ⚠️ Domain-Dependent

#### `ITRDataPrefetchService` (`backend/src/services/business/ITRDataPrefetchService.js`)
- **Type:** Data prefetching for ITR
- **State Dependency:** ⚠️ **MUST be gated by Domain Core**
- **Current Assumptions:** Assumes ITR type is determined
- **Required Check:** Must verify state allows prefetching
- **Annotation:** "Must only execute if Domain Core allows data prefetching in current state"
- **Status:** ⚠️ Domain-Dependent

#### `AIRecommendationService` (`backend/src/services/business/AIRecommendationService.js`)
- **Type:** AI recommendations for tax optimization
- **State Dependency:** ⚠️ **MUST be gated by Domain Core**
- **Current Assumptions:** Assumes data is collected
- **Required Check:** Must verify state allows recommendations
- **Annotation:** "Must only execute if Domain Core allows recommendations in current state"
- **Status:** ⚠️ Domain-Dependent

---

## Frontend Services

### Domain-Dependent (Frontend)

#### `ITRAutoDetector` (`frontend/src/services/ITRAutoDetector.js`)
- **Type:** ITR type detection (frontend)
- **State Dependency:** ⚠️ **MUST be gated by Domain Core**
- **Current Assumptions:** Assumes `DRAFT_INIT` state
- **Required Check:** Must go through Domain Core to determine ITR type
- **Annotation:** "Frontend should NOT decide ITR type - must go through Domain Core"
- **Violation:** ❌ **Frontend deciding ITR type** - This is a logic leak
- **Status:** ⚠️ Domain-Dependent (Frontend Logic Leak)

#### `AutoPopulationITRService` (`frontend/src/services/AutoPopulationITRService.js`)
- **Type:** Auto-population service
- **State Dependency:** ⚠️ **MUST be gated by Domain Core**
- **Current Assumptions:** Assumes data collection state
- **Required Check:** Must verify state allows auto-population
- **Annotation:** "Must only execute if Domain Core allows auto-population in current state"
- **Status:** ⚠️ Domain-Dependent

---

## Summary

### Domain-Independent Services: 35+
- Can execute without state checks
- Pure utilities, read-only operations, infrastructure services

### Domain-Dependent Services: 10+
- Must be gated by Domain Core
- Require state validation before execution
- Include: ValidationEngine, DeductionTypeDetectionService, EVerificationService, DataMatchingService, TaxAuditChecker, ERIIntegrationService, ForeignAssetsService, BalanceSheetService, AuditInformationService, ITRDataPrefetchService, AIRecommendationService

### Critical Violations
- ❌ **ITRAutoDetector (frontend)** - Frontend deciding ITR type (logic leak)
- ⚠️ **All Domain-Dependent services** - No state checks before execution

### Recommendations
1. All Domain-Dependent services must check state through Domain Core before executing
2. Frontend ITR type detection must go through Domain Core (backend)
3. All state-dependent operations must be gated by Domain Core

