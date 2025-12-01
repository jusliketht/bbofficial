// =====================================================
// DEDUCTION TYPES
// TypeScript types for Chapter VI-A deductions
// =====================================================

export interface DeductionBase {
  id?: string;
  filingId: string;
  section: string;
  amount: number;
  financialYear: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Section80G extends DeductionBase {
  section: '80G';
  donationType: '100%' | '50%';
  doneeName: string;
  doneePan?: string;
  doneeAddress: string;
  registrationNumber?: string;
  donationAmount: number;
  receiptNumber?: string;
  receiptDate?: string;
  proofDocumentId?: string;
}

export interface Section80GG extends DeductionBase {
  section: '80GG';
  rentPaid: number;
  landlordName: string;
  landlordPan?: string;
  propertyAddress: string;
  rentReceiptDocumentId?: string;
}

export interface Section80GGA extends DeductionBase {
  section: '80GGA';
  institutionName: string;
  institutionAddress: string;
  registrationNumber: string;
  donationAmount: number;
  receiptNumber?: string;
  receiptDate?: string;
  proofDocumentId?: string;
}

export interface Section80GGC extends DeductionBase {
  section: '80GGC';
  partyName: string;
  partyRegistrationNumber: string;
  donationAmount: number;
  paymentMode: 'cash' | 'cheque' | 'online';
  receiptNumber?: string;
  receiptDate?: string;
  proofDocumentId?: string;
}

export interface Section80TTA extends DeductionBase {
  section: '80TTA' | '80TTB';
  bankName: string;
  accountNumber: string;
  interestAmount: number;
  certificateDocumentId?: string;
}

export interface Section80U extends DeductionBase {
  section: '80U';
  disabilityPercentage: '40-80%' | '80-100%';
  certificateNumber: string;
  certificateDate: string;
  certificateIssuingAuthority: string;
  certificateDocumentId?: string;
}

export type Deduction =
  | Section80G
  | Section80GG
  | Section80GGA
  | Section80GGC
  | Section80TTA
  | Section80U;

export interface DeductionLimits {
  section: string;
  limit: number;
  claimed: number;
  remaining: number;
  percentage: number;
}

export interface DeductionUtilization {
  sections: DeductionLimits[];
  totalClaimed: number;
  totalAvailable: number;
  overallPercentage: number;
}

export interface AISuggestion {
  id: string;
  section: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedSavings: number;
  currentAmount?: number;
  suggestedAmount?: number;
  actionable: boolean;
  actionUrl?: string;
}

