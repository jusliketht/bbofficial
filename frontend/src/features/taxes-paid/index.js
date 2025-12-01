// =====================================================
// TAXES PAID FEATURE - BARREL EXPORTS
// =====================================================

// Components
export { default as TaxesPaidForm } from './components/TaxesPaidForm';
export { default as AdvanceTaxForm } from './components/advance-tax-form';
export { default as ChallanGenerator } from './components/challan-generator';
export { default as TaxPaymentModal } from './components/tax-payment-modal';
export { default as PaymentStatus } from './components/payment-status';
export { default as PaymentHistory } from './components/payment-history';
export { default as PaymentProofUpload } from './components/payment-proof-upload';

// Hooks
export * from './hooks/use-taxes-paid';
export * from './hooks/use-tax-payment';

// Services
export { taxesPaidService } from './services/taxes-paid.service';
export { default as taxPaymentService } from './services/tax-payment.service';

// Schemas
export * from './schema/taxes-paid.schema';

