// =====================================================
// BUSINESS INCOME FEATURE - BARREL EXPORTS
// =====================================================

// Services
export { businessIncomeService } from './services/business-income.service';
export { balanceSheetService } from './services/balance-sheet.service';
export { auditInformationService } from './services/audit-information.service';

// Hooks
export {
  useBusinessIncome,
  useUpdateBusinessIncome,
  useAddBusiness,
  useRemoveBusiness,
  usePresumptiveTaxCalculation,
} from './hooks/use-business-income';
export {
  useBalanceSheet,
  useUpdateBalanceSheet,
} from './hooks/use-balance-sheet';
export {
  useAuditInformation,
  useUpdateAuditInformation,
  useCheckAuditApplicability,
} from './hooks/use-audit-information';

// Components
export { default as BusinessIncomeForm } from './components/BusinessIncomeForm';
export { default as BusinessIncomeBreakdown } from './components/business-income-breakdown';
export { default as PresumptiveTaxCalculator } from './components/presumptive-tax-calculator';
export { default as BalanceSheetForm } from './components/balance-sheet-form';
export { default as AuditInformationForm } from './components/audit-information-form';

// Schemas
export { businessIncomeSchema } from './schema/business-income.schema';
export { balanceSheetSchema } from './schema/balance-sheet.schema';
export { auditInformationSchema } from './schema/audit-information.schema';
