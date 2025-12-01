// =====================================================
// FOREIGN ASSETS SCHEMA
// Zod validation schemas for foreign assets
// =====================================================

import { z } from 'zod';

// Foreign Bank Account Asset Details Schema
export const foreignBankAccountDetailsSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  accountType: z.enum(['savings', 'current', 'fixed_deposit'], {
    errorMap: () => ({ message: 'Invalid account type' }),
  }),
  balance: z.number().min(0, 'Balance must be non-negative').optional(),
  currency: z.string().min(1, 'Currency is required'),
  openingDate: z.string().optional(),
  closingDate: z.string().optional(),
});

// Foreign Equity Holding Asset Details Schema
export const foreignEquityHoldingDetailsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  isin: z.string().optional(),
  securityType: z.enum(['equity', 'preference', 'debt', 'mutual_fund', 'etf'], {
    errorMap: () => ({ message: 'Invalid security type' }),
  }),
  numberOfShares: z.number().positive('Number of shares must be greater than 0'),
  faceValuePerShare: z.number().min(0, 'Face value must be non-negative').optional(),
  currency: z.string().min(1, 'Currency is required'),
  purchaseDate: z.string().optional(),
  currentMarketValue: z.number().min(0, 'Market value must be non-negative').optional(),
});

// Foreign Immovable Property Asset Details Schema
export const foreignImmovablePropertyDetailsSchema = z.object({
  address: z.string().min(1, 'Property address is required'),
  propertyType: z.enum(['residential', 'commercial', 'land'], {
    errorMap: () => ({ message: 'Invalid property type' }),
  }),
  area: z.number().positive('Area must be greater than 0').optional(),
  areaUnit: z.enum(['sqft', 'sqm']).optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().min(0, 'Purchase price must be non-negative').optional(),
  currency: z.string().min(1, 'Currency is required'),
  currentMarketValue: z.number().min(0, 'Market value must be non-negative').optional(),
  coOwners: z.array(z.string()).optional(),
});

// Foreign Asset Base Schema (without refinements - can be extended)
const foreignAssetBaseSchema = z.object({
  assetType: z.enum(['bank_account', 'equity_holding', 'immovable_property', 'other'], {
    errorMap: () => ({ message: 'Invalid asset type' }),
  }),
  country: z.string().min(1, 'Country is required'),
  assetDetails: z.union([
    foreignBankAccountDetailsSchema,
    foreignEquityHoldingDetailsSchema,
    foreignImmovablePropertyDetailsSchema,
    z.object({}).passthrough(), // For 'other' type
  ]),
  declarationDate: z.string().optional(),
  valuationDate: z.string().optional(),
  valuationAmountInr: z.number().min(0, 'Valuation amount must be non-negative').optional(),
  valuationAmountForeign: z.number().min(0, 'Foreign valuation amount must be non-negative').optional(),
  currency: z.string().optional(),
  exchangeRate: z.number().positive('Exchange rate must be greater than 0').optional(),
  dtaaApplicable: z.boolean().default(false),
  dtaaCountry: z.string().optional(),
  supportingDocuments: z.array(z.object({
    url: z.string().url('Invalid document URL'),
    type: z.string().optional(),
    uploadedAt: z.string().optional(),
  })).optional(),
});

// Foreign Asset Schema (union of all types) with refinements
export const foreignAssetSchema = foreignAssetBaseSchema.refine(
  (data) => {
    // If valuationAmountInr is not provided, both valuationAmountForeign and exchangeRate must be provided
    if (!data.valuationAmountInr) {
      return !!(data.valuationAmountForeign && data.exchangeRate);
    }
    return true;
  },
  {
    message: 'Either valuation amount in INR or foreign amount with exchange rate must be provided',
    path: ['valuationAmountInr'],
  },
).refine(
  (data) => {
    // If DTAA is applicable, DTAA country must be provided
    if (data.dtaaApplicable && !data.dtaaCountry) {
      return false;
    }
    return true;
  },
  {
    message: 'DTAA country is required when DTAA is applicable',
    path: ['dtaaCountry'],
  },
);

// Type-specific schemas for form validation (extend base schema, then apply refinements)
export const bankAccountAssetSchema = foreignAssetBaseSchema.extend({
  assetType: z.literal('bank_account'),
  assetDetails: foreignBankAccountDetailsSchema,
}).refine(
  (data) => {
    if (!data.valuationAmountInr) {
      return !!(data.valuationAmountForeign && data.exchangeRate);
    }
    return true;
  },
  {
    message: 'Either valuation amount in INR or foreign amount with exchange rate must be provided',
    path: ['valuationAmountInr'],
  },
).refine(
  (data) => {
    if (data.dtaaApplicable && !data.dtaaCountry) {
      return false;
    }
    return true;
  },
  {
    message: 'DTAA country is required when DTAA is applicable',
    path: ['dtaaCountry'],
  },
);

export const equityHoldingAssetSchema = foreignAssetBaseSchema.extend({
  assetType: z.literal('equity_holding'),
  assetDetails: foreignEquityHoldingDetailsSchema,
}).refine(
  (data) => {
    if (!data.valuationAmountInr) {
      return !!(data.valuationAmountForeign && data.exchangeRate);
    }
    return true;
  },
  {
    message: 'Either valuation amount in INR or foreign amount with exchange rate must be provided',
    path: ['valuationAmountInr'],
  },
).refine(
  (data) => {
    if (data.dtaaApplicable && !data.dtaaCountry) {
      return false;
    }
    return true;
  },
  {
    message: 'DTAA country is required when DTAA is applicable',
    path: ['dtaaCountry'],
  },
);

export const immovablePropertyAssetSchema = foreignAssetBaseSchema.extend({
  assetType: z.literal('immovable_property'),
  assetDetails: foreignImmovablePropertyDetailsSchema,
}).refine(
  (data) => {
    if (!data.valuationAmountInr) {
      return !!(data.valuationAmountForeign && data.exchangeRate);
    }
    return true;
  },
  {
    message: 'Either valuation amount in INR or foreign amount with exchange rate must be provided',
    path: ['valuationAmountInr'],
  },
).refine(
  (data) => {
    if (data.dtaaApplicable && !data.dtaaCountry) {
      return false;
    }
    return true;
  },
  {
    message: 'DTAA country is required when DTAA is applicable',
    path: ['dtaaCountry'],
  },
);

