// =====================================================
// TAX COMPUTATION BAR COMPONENT
// Shows real-time tax computation with regime comparison
// Desktop: Sticky top (below header)
// Mobile: Fixed bottom
// Fully compliant with UI.md specifications
// =====================================================

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { CheckCircle, ChevronRight, Sparkles, X } from 'lucide-react';
import AnimatedNumber from '../UI/AnimatedNumber';
import { formatIndianCurrency } from '../../lib/format';

// FlowBlock component for flow indicator
const FlowBlock = ({ label, value, subtext }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-label-sm text-gray-500 uppercase mb-1 tracking-wide" style={{ fontSize: '11px', fontWeight: 500 }}>
        {label}
      </span>
      <span className="text-number-lg font-semibold text-black-950" style={{ fontSize: '24px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
        <AnimatedNumber value={value} format="currency" />
      </span>
      {subtext && (
        <span className="text-body-sm text-gray-400 mt-1" style={{ fontSize: '13px', lineHeight: '20px' }}>
          {subtext}
        </span>
      )}
    </div>
  );
};

// RegimeColumn component for regime comparison
const RegimeColumn = ({ title, taxAmount, result, maxTax, isRecommended, savings, color }) => {
  const percentage = maxTax > 0 ? (taxAmount / maxTax) * 100 : 0;
  const isRefund = result > 0;

  return (
    <div className="flex-1 flex flex-col items-center space-y-2">
      <div className="text-heading-sm font-semibold text-gray-800" style={{ fontSize: '16px', fontWeight: 600 }}>
        {title}
      </div>
      <div className="text-number-lg font-semibold text-gray-900" style={{ fontSize: '24px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
        <AnimatedNumber value={taxAmount} format="currency" />
      </div>
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded" style={{ height: '8px' }}>
        <motion.div
          className="rounded h-full"
          style={{
            backgroundColor: color === 'regime-old' ? '#6366F1' : '#8B5CF6',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      {isRefund ? (
        <div className="flex items-center space-x-1 text-success-600 text-heading-md font-semibold" style={{ fontSize: '18px', fontWeight: 600 }}>
          <CheckCircle className="w-4 h-4" />
          <span>REFUND: <AnimatedNumber value={Math.abs(result)} format="currency" /></span>
        </div>
      ) : result < 0 ? (
        <div className="text-error-600 text-heading-md font-semibold" style={{ fontSize: '18px', fontWeight: 600 }}>
          DUE: <AnimatedNumber value={Math.abs(result)} format="currency" />
        </div>
      ) : null}
      {isRecommended && (
        <div
          className="text-label-md font-semibold text-white uppercase px-3 py-1.5 rounded-md mt-1"
          style={{
            fontSize: '13px',
            fontWeight: 500,
            background: 'linear-gradient(135deg, #FF6B00 0%, #FFB800 100%)',
          }}
        >
          RECOMMENDED • Save <AnimatedNumber value={savings} format="currency" />
        </div>
      )}
    </div>
  );
};

// AI Tip component
const AITip = ({ tip, onDismiss }) => {
  if (!tip) return null;

  return (
    <motion.div
      className="bg-gold-50 rounded-lg p-3 flex items-start space-x-2 mb-4"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      style={{
        backgroundColor: '#FEF3C7',
        padding: '12px',
        borderRadius: '8px',
      }}
    >
      <Sparkles className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" style={{ width: '16px', height: '16px', color: '#F59E0B' }} />
      <p className="text-body-md text-gray-600 flex-1" style={{ fontSize: '14px', lineHeight: '22px', fontWeight: 400 }}>
        {tip}
      </p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded hover:bg-gold-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500"
          aria-label="Dismiss tip"
        >
          <X className="w-4 h-4 text-gray-500" style={{ width: '16px', height: '16px' }} />
        </button>
      )}
    </motion.div>
  );
};

const TaxComputationBar = ({
  grossIncome,
  deductions,
  taxableIncome,
  taxPayable,
  tdsPaid,
  aiTip,
  onDismissTip,
  onFileClick,
  // Legacy props for backward compatibility
  formData,
  taxComputation,
  regimeComparison,
  selectedRegime = 'old',
  onRegimeChange,
  className = '',
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate values - use new props if available, otherwise fall back to legacy props
  const computedValues = useMemo(() => {
    // If new props are provided, use them directly
    if (grossIncome !== undefined && deductions !== undefined && taxableIncome !== undefined && taxPayable !== undefined) {
      return {
        grossIncome,
        deductionsOld: deductions.old || 0,
        deductionsNew: deductions.new || 0,
        taxableIncomeOld: taxableIncome.old || 0,
        taxableIncomeNew: taxableIncome.new || 0,
        taxPayableOld: taxPayable.old || 0,
        taxPayableNew: taxPayable.new || 0,
        tdsPaid: tdsPaid || 0,
      };
    }

    // Legacy: Calculate totals from formData
    if (!formData) {
      return {
        grossIncome: 0,
        deductionsOld: 0,
        deductionsNew: 0,
        taxableIncomeOld: 0,
        taxableIncomeNew: 0,
        taxPayableOld: 0,
        taxPayableNew: 0,
        tdsPaid: 0,
      };
    }
    const income = formData?.income || {};
    const deductions = formData?.deductions || {};
    const taxesPaid = formData?.taxesPaid || {};

    // Calculate gross income
    const grossIncome =
      (parseFloat(income.salary) || 0) +
      (parseFloat(income.businessIncome) || 0) +
      (parseFloat(income.professionalIncome) || 0) +
      (parseFloat(income.otherIncome) || 0) +
      (typeof income.capitalGains === 'object' && income.capitalGains?.stcgDetails
        ? (income.capitalGains.stcgDetails || []).reduce((sum, e) => sum + (parseFloat(e.gainAmount) || 0), 0) +
          (income.capitalGains.ltcgDetails || []).reduce((sum, e) => sum + (parseFloat(e.gainAmount) || 0), 0)
        : parseFloat(income.capitalGains) || 0) +
      (typeof income.houseProperty === 'object' && income.houseProperty?.properties
        ? income.houseProperty.properties.reduce((sum, p) => {
            const rental = parseFloat(p.annualRentalIncome) || 0;
            const taxes = parseFloat(p.municipalTaxes) || 0;
            const interest = parseFloat(p.interestOnLoan) || 0;
            return sum + Math.max(0, rental - taxes - interest);
          }, 0)
        : parseFloat(income.houseProperty) || 0) +
      (income.foreignIncome?.foreignIncomeDetails || []).reduce((sum, e) => sum + (parseFloat(e.amountInr) || 0), 0) +
      (parseFloat(income.directorPartner?.directorIncome) || 0) +
      (parseFloat(income.directorPartner?.partnerIncome) || 0);

    // Calculate total deductions (old regime - includes all deductions)
    const totalDeductionsOld =
      (parseFloat(deductions.section80C) || 0) +
      (parseFloat(deductions.section80D) || 0) +
      (parseFloat(deductions.section80G) || 0) +
      (parseFloat(deductions.section80TTA) || 0) +
      (parseFloat(deductions.section80TTB) || 0) +
      Object.values(deductions.otherDeductions || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

    // New regime deductions (limited - typically only standard deduction)
    const totalDeductionsNew = 50000; // Standard deduction for new regime

    // Calculate taxable income
    const taxableIncomeOld = Math.max(0, grossIncome - totalDeductionsOld);
    const taxableIncomeNew = Math.max(0, grossIncome - totalDeductionsNew);

    // Calculate total taxes paid
    const totalTaxesPaid =
      (parseFloat(taxesPaid.tds) || 0) +
      (parseFloat(taxesPaid.advanceTax) || 0) +
      (parseFloat(taxesPaid.selfAssessmentTax) || 0);

    // Get regime comparison data
    const oldRegimeTax = regimeComparison?.oldRegime?.totalTax || taxComputation?.totalTax || 0;
    const newRegimeTax = regimeComparison?.newRegime?.totalTax || 0;

    return {
      grossIncome,
      deductionsOld: totalDeductionsOld,
      deductionsNew: totalDeductionsNew,
      taxableIncomeOld,
      taxableIncomeNew,
      taxPayableOld: oldRegimeTax,
      taxPayableNew: newRegimeTax,
      tdsPaid: totalTaxesPaid,
    };
  }, [formData, grossIncome, deductions, taxableIncome, taxPayable, tdsPaid, regimeComparison, taxComputation]);

  // Calculate refunds and dues
  const oldRegimeRefund = Math.max(0, computedValues.tdsPaid - computedValues.taxPayableOld);
  const newRegimeRefund = Math.max(0, computedValues.tdsPaid - computedValues.taxPayableNew);
  const oldRegimeDue = Math.max(0, computedValues.taxPayableOld - computedValues.tdsPaid);
  const newRegimeDue = Math.max(0, computedValues.taxPayableNew - computedValues.tdsPaid);

  // Determine recommended regime
  const recommendedRegime = computedValues.taxPayableOld <= computedValues.taxPayableNew ? 'old' : 'new';
  const savings = Math.abs(computedValues.taxPayableOld - computedValues.taxPayableNew);
  const maxTax = Math.max(computedValues.taxPayableOld, computedValues.taxPayableNew, 1);

  const formatCurrency = (amount) => {
    return formatIndianCurrency(Math.abs(amount));
  };

  // Desktop layout: Sticky top (below header at 64px)
  if (!isMobile) {
    return (
      <div
        className={`tax-computation-bar-desktop sticky z-40 bg-white border-b border-gray-200 shadow-floating ${className}`}
        style={{
          top: '64px',
          padding: '20px 24px',
        }}
        role="region"
        aria-label="Tax computation summary"
      >
        <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
          {/* Flow Indicator */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <FlowBlock
              label="Gross Income"
              value={computedValues.grossIncome}
            />
            <ChevronRight className="w-5 h-5 text-gray-300" style={{ width: '20px', height: '20px' }} />
            <FlowBlock
              label="Deductions"
              value={computedValues.deductionsOld}
              subtext={`Old: ${formatCurrency(computedValues.deductionsOld)} | New: ${formatCurrency(computedValues.deductionsNew)}`}
            />
            <ChevronRight className="w-5 h-5 text-gray-300" style={{ width: '20px', height: '20px' }} />
            <FlowBlock
              label="Taxable Income"
              value={computedValues.taxableIncomeOld}
              subtext="(Old Regime)"
            />
          </div>

          {/* Regime Comparison */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 relative">
            <div className="grid grid-cols-2 gap-6">
              {/* Old Regime */}
              <RegimeColumn
                title="Old Regime"
                taxAmount={computedValues.taxPayableOld}
                result={oldRegimeRefund || -oldRegimeDue}
                maxTax={maxTax}
                isRecommended={recommendedRegime === 'old'}
                savings={recommendedRegime === 'old' ? savings : 0}
                color="regime-old"
              />

              {/* Divider */}
              <div className="absolute left-1/2 top-4 bottom-4 w-px bg-gray-200 transform -translate-x-1/2" />

              {/* New Regime */}
              <RegimeColumn
                title="New Regime"
                taxAmount={computedValues.taxPayableNew}
                result={newRegimeRefund || -newRegimeDue}
                maxTax={maxTax}
                isRecommended={recommendedRegime === 'new'}
                savings={recommendedRegime === 'new' ? savings : 0}
                color="regime-new"
              />
            </div>
          </div>

          {/* AI Tip */}
          <AITip tip={aiTip} onDismiss={onDismissTip} />

          {/* CTA */}
          <div className="flex justify-end">
            <button
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-card-hover focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              onClick={onFileClick || (() => {
                console.log('File ITR clicked');
              })}
              aria-label="Review and file ITR"
            >
              Review & File
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout: Fixed bottom with swipe to expand (using framer-motion)
  const [isExpanded, setIsExpanded] = useState(false);
  const y = useMotionValue(0);
  const height = useTransform(y, [0, -200], [80, 280]);
  const constraintsRef = useRef(null);

  const handleDragEnd = (event, info) => {
    const shouldExpand = info.offset.y < -50 || (isExpanded && info.offset.y < -100);
    const shouldCollapse = info.offset.y > 50 || (!isExpanded && info.offset.y > 100);

    if (shouldExpand) {
      setIsExpanded(true);
      y.set(0);
    } else if (shouldCollapse) {
      setIsExpanded(false);
      y.set(0);
    } else {
      y.set(0);
    }
  };

  return (
    <motion.div
      ref={constraintsRef}
      className={`tax-computation-bar-mobile fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-floating ${className}`}
      style={{
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
        height: isExpanded ? 280 : 80,
        y,
      }}
      role="region"
      aria-label="Tax computation summary"
      drag="y"
      dragConstraints={{ top: -200, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      animate={{
        height: isExpanded ? 280 : 80,
      }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300,
      }}
    >
      {/* Drag Handle */}
      <div className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing">
        <div className="w-10 bg-gray-300 rounded" style={{ width: '40px', height: '4px', borderRadius: '2px' }} />
      </div>

      {!isExpanded ? (
        // Collapsed State
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-body-md text-gray-700 font-semibold" style={{ fontSize: '14px' }}>
                {oldRegimeRefund > 0 ? `Refund: ${formatCurrency(oldRegimeRefund)}` : `Due: ${formatCurrency(oldRegimeDue)}`}
              </div>
              {recommendedRegime && savings > 0 && (
                <div className="text-label-sm text-gold-600 font-semibold mt-1" style={{ fontSize: '13px' }}>
                  {recommendedRegime.toUpperCase()} ✓ SAVES {formatCurrency(savings)}
                </div>
              )}
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full mb-3" style={{ height: '8px' }}>
            <div
              className="bg-orange-500 rounded-full h-full transition-all duration-600 ease-out"
              style={{
                width: `${Math.min(((oldRegimeRefund || oldRegimeDue) / Math.max(computedValues.taxPayableOld, computedValues.taxPayableNew, 1)) * 100, 100)}%`,
              }}
            />
          </div>
          {/* File ITR Button */}
          <button
            className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            onClick={() => {
              // TODO: Navigate to file ITR
              console.log('File ITR clicked');
            }}
            aria-label="Review and file ITR"
          >
            Review & File →
          </button>
        </div>
      ) : (
        // Expanded State
        <div className="px-4 py-3 overflow-y-auto" style={{ maxHeight: '240px' }}>
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-heading-sm font-semibold text-gray-800" style={{ fontSize: '16px', fontWeight: 600 }}>TAX COMPUTATION</h3>
              <span className="text-body-sm text-gray-500">AY 2024-25</span>
            </div>
            <div className="border-t border-gray-200 my-2" />
          </div>

          {/* Comparison Table */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-label-sm text-gray-500 uppercase" style={{ fontSize: '11px', fontWeight: 500, padding: '0 16px' }}>
              <span></span>
              <span>OLD</span>
              <span>NEW</span>
            </div>
            <div className="flex justify-between text-body-md text-gray-700" style={{ fontSize: '14px', padding: '8px 16px' }}>
              <span>Gross</span>
              <span className="text-number-sm font-medium" style={{ fontSize: '14px', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                <AnimatedNumber value={computedValues.grossIncome} format="currency" />
              </span>
              <span className="text-number-sm font-medium" style={{ fontSize: '14px', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                <AnimatedNumber value={computedValues.grossIncome} format="currency" />
              </span>
            </div>
            <div className="flex justify-between text-body-md text-gray-700" style={{ fontSize: '14px', padding: '8px 16px' }}>
              <span>Deductions</span>
              <span className="text-number-sm font-medium" style={{ fontSize: '14px', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                <AnimatedNumber value={computedValues.deductionsOld} format="currency" />
              </span>
              <span className="text-number-sm font-medium" style={{ fontSize: '14px', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                <AnimatedNumber value={computedValues.deductionsNew} format="currency" />
              </span>
            </div>
            <div className="flex justify-between text-body-md text-gray-700" style={{ fontSize: '14px', padding: '8px 16px' }}>
              <span>Taxable</span>
              <span className="text-number-sm font-medium" style={{ fontSize: '14px', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                <AnimatedNumber value={computedValues.taxableIncomeOld} format="currency" />
              </span>
              <span className="text-number-sm font-medium" style={{ fontSize: '14px', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                <AnimatedNumber value={computedValues.taxableIncomeNew} format="currency" />
              </span>
            </div>
            <div className="flex justify-between text-body-md text-gray-700" style={{ fontSize: '14px', padding: '8px 16px' }}>
              <span>Tax</span>
              <span className="text-number-sm font-medium" style={{ fontSize: '14px', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                <AnimatedNumber value={computedValues.taxPayableOld} format="currency" />
              </span>
              <span className="text-number-sm font-medium" style={{ fontSize: '14px', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                <AnimatedNumber value={computedValues.taxPayableNew} format="currency" />
              </span>
            </div>
            <div className="flex justify-between text-body-md text-gray-700" style={{ fontSize: '14px', padding: '8px 16px' }}>
              <span>TDS</span>
              <span className="text-number-sm font-medium" style={{ fontSize: '14px', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                <AnimatedNumber value={computedValues.tdsPaid} format="currency" />
              </span>
              <span className="text-number-sm font-medium" style={{ fontSize: '14px', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                <AnimatedNumber value={computedValues.tdsPaid} format="currency" />
              </span>
            </div>
            <div className="border-t border-gray-200 my-2" />
            <div className="flex justify-between text-heading-sm font-semibold" style={{ fontSize: '16px', fontWeight: 600, padding: '8px 16px' }}>
              <span>RESULT</span>
              <span className={`text-number-sm font-semibold ${recommendedRegime === 'old' ? 'text-success-500' : 'text-gray-700'}`} style={{ fontSize: '14px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {oldRegimeRefund > 0 ? (
                  <>
                    <AnimatedNumber value={oldRegimeRefund} format="currency" />✓
                  </>
                ) : (
                  <AnimatedNumber value={oldRegimeDue} format="currency" />
                )}
              </span>
              <span className={`text-number-sm font-semibold ${recommendedRegime === 'new' ? 'text-success-500' : 'text-gray-700'}`} style={{ fontSize: '14px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {newRegimeRefund > 0 ? (
                  <>
                    <AnimatedNumber value={newRegimeRefund} format="currency" />✓
                  </>
                ) : (
                  <AnimatedNumber value={newRegimeDue} format="currency" />
                )}
              </span>
            </div>
            <div className="flex justify-between text-body-sm text-gray-500" style={{ fontSize: '13px', padding: '0 16px' }}>
              <span></span>
              <span>REFUND</span>
              <span>REFUND</span>
            </div>
          </div>

          {recommendedRegime && savings > 0 && (
            <div className="flex items-center space-x-1 text-success-600 text-body-md font-semibold mb-3" style={{ fontSize: '14px', fontWeight: 600 }}>
              <CheckCircle className="w-4 h-4" />
              <span>{recommendedRegime.toUpperCase()} REGIME SAVES <AnimatedNumber value={savings} format="currency" /></span>
            </div>
          )}

          {/* File ITR Button */}
          <button
            className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            onClick={onFileClick || (() => {
              console.log('File ITR clicked');
            })}
            aria-label="Review and file ITR"
          >
            Review & File →
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default TaxComputationBar;

