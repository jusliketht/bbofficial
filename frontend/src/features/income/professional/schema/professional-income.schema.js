// =====================================================
// PROFESSIONAL INCOME SCHEMA
// Validation schema for professional income
// =====================================================

import * as yup from 'yup';

export const professionalActivitySchema = yup.object({
  activityName: yup.string().required('Activity name is required').max(200, 'Activity name too long'),
  activityType: yup.string().max(500, 'Activity type description too long'),
  grossReceipts: yup.number().min(0, 'Gross receipts cannot be negative').default(0),
  expenses: yup.object({
    rent: yup.number().min(0).default(0),
    salary: yup.number().min(0).default(0),
    utilities: yup.number().min(0).default(0),
    professionalFees: yup.number().min(0).default(0),
    travel: yup.number().min(0).default(0),
    other: yup.number().min(0).default(0),
  }),
  depreciation: yup.number().min(0).default(0),
  otherExpenses: yup.number().min(0).default(0),
  netIncome: yup.number().default(0),
});

export const professionalIncomeSchema = yup.object({
  activities: yup.array().of(professionalActivitySchema).min(0, 'Activities array is required'),
  totalIncome: yup.number().default(0),
});

export default professionalIncomeSchema;

