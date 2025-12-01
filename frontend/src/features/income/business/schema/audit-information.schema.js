// =====================================================
// AUDIT INFORMATION SCHEMA
// Yup validation schema for audit information
// =====================================================

import * as yup from 'yup';

const caDetailsSchema = yup.object({
  caName: yup.string().required('CA name is required'),
  membershipNumber: yup.string().required('CA membership number is required'),
  firmName: yup.string(),
  firmAddress: yup.string(),
});

export const auditInformationSchema = yup.object({
  isAuditApplicable: yup.boolean().required(),
  auditReason: yup.string(),
  auditReportNumber: yup.string().when('isAuditApplicable', {
    is: true,
    then: () => yup.string().required('Audit report number is required'),
    otherwise: () => yup.string().optional(),
  }),
  auditReportDate: yup.string().when('isAuditApplicable', {
    is: true,
    then: () => yup.string().required('Audit report date is required'),
    otherwise: () => yup.string().optional(),
  }),
  caDetails: yup.object().when('isAuditApplicable', {
    is: true,
    then: () => caDetailsSchema.required(),
    otherwise: () => yup.object().optional(),
  }),
  bookOfAccountsMaintained: yup.boolean(),
  form3CDFiled: yup.boolean(),
});

export default auditInformationSchema;

