// =====================================================
// SALARY SCHEMA
// Validation schema for salary income
// =====================================================

import * as yup from 'yup';

export const employerSchema = yup.object({
  employerName: yup
    .string()
    .required('Employer name is required')
    .max(100, 'Employer name too long'),
  employerTAN: yup
    .string()
    .matches(/^[A-Z]{4}[0-9]{5}[A-Z]$/, 'Invalid TAN format')
    .required('TAN is required'),
  employerAddress: yup.string().max(500, 'Address too long'),
  basicSalary: yup
    .number()
    .min(0, 'Basic salary cannot be negative')
    .required('Basic salary is required'),
  dearnessAllowance: yup.number().min(0, 'DA cannot be negative').default(0),
  hraReceived: yup.number().min(0, 'HRA cannot be negative').default(0),
  specialAllowance: yup.number().min(0, 'Special allowance cannot be negative').default(0),
  otherAllowances: yup.number().min(0, 'Other allowances cannot be negative').default(0),
  perquisites: yup.number().min(0, 'Perquisites cannot be negative').default(0),
  profitsInLieuOfSalary: yup.number().min(0, 'Profits cannot be negative').default(0),
  standardDeduction: yup.number().min(0).max(50000, 'Standard deduction max ₹50,000').default(50000),
});

export const salarySchema = yup.object({
  employers: yup.array().of(employerSchema).min(1, 'At least one employer is required'),
  totalSalary: yup.number().min(0, 'Total salary cannot be negative'),
});

export default salarySchema;

