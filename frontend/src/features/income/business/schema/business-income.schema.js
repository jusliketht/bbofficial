// =====================================================
// BUSINESS INCOME SCHEMA
// Validation schema for business income
// =====================================================

import * as yup from 'yup';

export const pnlSchema = yup.object({
  grossReceipts: yup.number().min(0, 'Gross receipts cannot be negative').default(0),
  openingStock: yup.number().min(0, 'Opening stock cannot be negative').default(0),
  purchases: yup.number().min(0, 'Purchases cannot be negative').default(0),
  closingStock: yup.number().min(0, 'Closing stock cannot be negative').default(0),
  directExpenses: yup.object({
    rawMaterials: yup.number().min(0).default(0),
    wages: yup.number().min(0).default(0),
    powerFuel: yup.number().min(0).default(0),
    freight: yup.number().min(0).default(0),
    other: yup.number().min(0).default(0),
  }),
  indirectExpenses: yup.object({
    rent: yup.number().min(0).default(0),
    salary: yup.number().min(0).default(0),
    utilities: yup.number().min(0).default(0),
    insurance: yup.number().min(0).default(0),
    advertising: yup.number().min(0).default(0),
    professionalFees: yup.number().min(0).default(0),
    other: yup.number().min(0).default(0),
  }),
  depreciation: yup.object({
    building: yup.number().min(0).default(0),
    machinery: yup.number().min(0).default(0),
    vehicles: yup.number().min(0).default(0),
    furniture: yup.number().min(0).default(0),
    other: yup.number().min(0).default(0),
  }),
  otherExpenses: yup.number().min(0).default(0),
  netProfit: yup.number().default(0),
});

export const businessSchema = yup.object({
  businessName: yup.string().required('Business name is required').max(200, 'Business name too long'),
  businessNature: yup.string().max(500, 'Business nature description too long'),
  businessAddress: yup.string().max(500, 'Address too long'),
  businessPAN: yup
    .string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN format')
    .nullable(),
  gstNumber: yup
    .string()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
    .nullable(),
  pnl: pnlSchema,
  presumptiveTax: yup.boolean().default(false),
  presumptiveSection: yup.string().oneOf(['44AD', '44ADA', '44AE']).nullable(),
});

export const businessIncomeSchema = yup.object({
  businesses: yup.array().of(businessSchema).min(0, 'Businesses array is required'),
  totalIncome: yup.number().default(0),
});

export default businessIncomeSchema;

