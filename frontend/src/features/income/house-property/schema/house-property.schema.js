// =====================================================
// HOUSE PROPERTY SCHEMA
// Validation schema for house property income
// =====================================================

import * as yup from 'yup';

export const propertySchema = yup.object({
  propertyType: yup
    .string()
    .oneOf(['self_occupied', 'let_out', 'deemed_let_out'], 'Invalid property type')
    .required('Property type is required'),
  annualRentalIncome: yup
    .number()
    .min(0, 'Annual rental income cannot be negative')
    .default(0),
  municipalTaxes: yup
    .number()
    .min(0, 'Municipal taxes cannot be negative')
    .default(0),
  interestOnLoan: yup
    .number()
    .min(0, 'Interest on loan cannot be negative')
    .default(0),
  preConstructionInterest: yup
    .number()
    .min(0, 'Pre-construction interest cannot be negative')
    .default(0),
  propertyAddress: yup.string().max(500, 'Address too long'),
  constructionStartDate: yup.date().nullable(),
  possessionDate: yup.date().nullable(),
  loanAmount: yup.number().min(0, 'Loan amount cannot be negative').nullable(),
  interestRate: yup.number().min(0, 'Interest rate cannot be negative').max(100, 'Interest rate too high').nullable(),
});

export const housePropertySchema = yup.object({
  properties: yup.array().of(propertySchema).min(0, 'Properties array is required'),
  totalIncome: yup.number().default(0),
  totalLoss: yup.number().default(0),
});

export default housePropertySchema;

