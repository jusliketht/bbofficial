// =====================================================
// CAPITAL GAINS SCHEMA
// Validation schema for capital gains income
// =====================================================

import * as yup from 'yup';

export const capitalGainsEntrySchema = yup.object({
  assetType: yup
    .string()
    .oneOf(['equity_shares', 'mutual_funds', 'property', 'bonds', 'other'], 'Invalid asset type')
    .required('Asset type is required'),
  saleValue: yup
    .number()
    .min(0, 'Sale value cannot be negative')
    .required('Sale value is required'),
  purchaseValue: yup.number().min(0, 'Purchase value cannot be negative').default(0),
  indexedCost: yup.number().min(0, 'Indexed cost cannot be negative').nullable(),
  expenses: yup.number().min(0, 'Expenses cannot be negative').default(0),
  gainAmount: yup.number().min(0, 'Gain amount cannot be negative').default(0),
  purchaseDate: yup.date().nullable(),
  saleDate: yup.date().nullable(),
  isLongTerm: yup.boolean().default(false),
});

export const capitalGainsSchema = yup.object({
  hasCapitalGains: yup.boolean().default(false),
  stcgDetails: yup.array().of(capitalGainsEntrySchema).default([]),
  ltcgDetails: yup.array().of(capitalGainsEntrySchema).default([]),
  totalSTCG: yup.number().min(0).default(0),
  totalLTCG: yup.number().min(0).default(0),
});

export default capitalGainsSchema;

