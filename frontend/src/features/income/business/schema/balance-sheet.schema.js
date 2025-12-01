// =====================================================
// BALANCE SHEET SCHEMA
// Yup validation schema for balance sheet
// =====================================================

import * as yup from 'yup';

const currentAssetsSchema = yup.object({
  cash: yup.number().min(0, 'Cash cannot be negative').required(),
  bank: yup.number().min(0, 'Bank balance cannot be negative').required(),
  inventory: yup.number().min(0, 'Inventory cannot be negative').required(),
  receivables: yup.number().min(0, 'Receivables cannot be negative').required(),
  other: yup.number().min(0, 'Other current assets cannot be negative').required(),
  total: yup.number().min(0).required(),
});

const fixedAssetsSchema = yup.object({
  building: yup.number().min(0, 'Building value cannot be negative').required(),
  machinery: yup.number().min(0, 'Machinery value cannot be negative').required(),
  vehicles: yup.number().min(0, 'Vehicles value cannot be negative').required(),
  furniture: yup.number().min(0, 'Furniture value cannot be negative').required(),
  other: yup.number().min(0, 'Other fixed assets cannot be negative').required(),
  total: yup.number().min(0).required(),
});

const assetsSchema = yup.object({
  currentAssets: currentAssetsSchema.required(),
  fixedAssets: fixedAssetsSchema.required(),
  investments: yup.number().min(0, 'Investments cannot be negative').required(),
  loansAdvances: yup.number().min(0, 'Loans and advances cannot be negative').required(),
  total: yup.number().min(0).required(),
});

const currentLiabilitiesSchema = yup.object({
  creditors: yup.number().min(0, 'Creditors cannot be negative').required(),
  bankOverdraft: yup.number().min(0, 'Bank overdraft cannot be negative').required(),
  shortTermLoans: yup.number().min(0, 'Short-term loans cannot be negative').required(),
  other: yup.number().min(0, 'Other current liabilities cannot be negative').required(),
  total: yup.number().min(0).required(),
});

const longTermLiabilitiesSchema = yup.object({
  longTermLoans: yup.number().min(0, 'Long-term loans cannot be negative').required(),
  other: yup.number().min(0, 'Other long-term liabilities cannot be negative').required(),
  total: yup.number().min(0).required(),
});

const liabilitiesSchema = yup.object({
  currentLiabilities: currentLiabilitiesSchema.required(),
  longTermLiabilities: longTermLiabilitiesSchema.required(),
  capital: yup.number().min(0, 'Capital cannot be negative').required(),
  total: yup.number().min(0).required(),
});

export const balanceSheetSchema = yup.object({
  hasBalanceSheet: yup.boolean().required(),
  assets: yup.object().when('hasBalanceSheet', {
    is: true,
    then: () => assetsSchema.required(),
    otherwise: () => yup.object().optional(),
  }),
  liabilities: yup.object().when('hasBalanceSheet', {
    is: true,
    then: () => liabilitiesSchema.required(),
    otherwise: () => yup.object().optional(),
  }),
}).test('balanced', 'Balance sheet must be balanced (Assets = Liabilities + Capital)', function(value) {
  if (!value.hasBalanceSheet) {
    return true;
  }
  const assetsTotal = value.assets?.total || 0;
  const liabilitiesTotal = value.liabilities?.total || 0;
  const difference = Math.abs(assetsTotal - liabilitiesTotal);
  return difference < 0.01 || this.createError({
    message: `Balance sheet is not balanced. Difference: ₹${difference.toLocaleString('en-IN')}`,
  });
});

export default balanceSheetSchema;

