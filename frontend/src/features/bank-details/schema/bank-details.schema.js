// =====================================================
// BANK DETAILS SCHEMA
// Validation schema for bank details
// =====================================================

import * as yup from 'yup';

export const bankAccountSchema = yup.object({
  bankName: yup.string().required('Bank name is required').max(100, 'Bank name too long'),
  ifsc: yup
    .string()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format')
    .required('IFSC code is required'),
  accountNumber: yup
    .string()
    .required('Account number is required')
    .min(9, 'Account number must be at least 9 digits')
    .matches(/^\d+$/, 'Account number must contain only digits'),
  accountType: yup.string().oneOf(['savings', 'current'], 'Invalid account type').required(),
  isRefundAccount: yup.boolean().default(false),
});

export const bankDetailsSchema = yup.object({
  accounts: yup.array().of(bankAccountSchema).min(1, 'At least one bank account is required'),
  refundAccount: yup.string().required('Refund account must be selected'),
});

export default bankDetailsSchema;

