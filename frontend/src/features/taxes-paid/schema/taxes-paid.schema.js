// =====================================================
// TAXES PAID SCHEMA
// Validation schema for taxes paid
// =====================================================

import * as yup from 'yup';

export const tdsSchema = yup.object({
  deductorName: yup.string().required('Deductor name is required'),
  deductorTAN: yup.string().matches(/^[A-Z]{4}[0-9]{5}[A-Z]$/, 'Invalid TAN format'),
  amount: yup.number().min(0, 'Amount cannot be negative').required('Amount is required'),
  section: yup.string().required('Section is required'),
  dateOfDeduction: yup.date().required('Date of deduction is required'),
});

export const advanceTaxSchema = yup.object({
  challanNumber: yup.string().required('Challan number is required'),
  bsrCode: yup.string().required('BSR code is required'),
  dateOfPayment: yup.date().required('Date of payment is required'),
  amount: yup.number().min(0, 'Amount cannot be negative').required('Amount is required'),
});

export const taxesPaidSchema = yup.object({
  tds: yup.array().of(tdsSchema).default([]),
  advanceTax: yup.array().of(advanceTaxSchema).default([]),
  selfAssessmentTax: yup.array().of(advanceTaxSchema).default([]),
  tcs: yup.array().default([]),
});

export default taxesPaidSchema;

