// =====================================================
// TAX CALCULATOR COMPONENT
// Real-time tax computation for ITR
// =====================================================

import React, { useEffect, useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import apiClient from '../../services/core/APIClient';

const TaxCalculator = ({ formData, selectedITR, onComputed, regime = 'old', assessmentYear = '2024-25' }) => {
  const [taxBreakdown, setTaxBreakdown] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    calculateTax();
  }, [formData, selectedITR, regime, assessmentYear]);

  const calculateTax = async () => {
    setIsCalculating(true);

    try {
      // Call backend tax computation API
      const response = await apiClient.post('/itr/compute-tax', {
        formData,
        regime,
        assessmentYear,
      });

      if (response.data.success) {
        const breakdown = response.data.data;
        setTaxBreakdown(breakdown);

        if (onComputed) {
          onComputed(breakdown);
        }
      } else {
        throw new Error(response.data.error || 'Tax calculation failed');
      }
    } catch (error) {
      // Fallback to client-side calculation if API fails
      const income = formData.income || {};
      const deductions = formData.deductions || {};
      const taxesPaid = formData.taxesPaid || {};

      // Calculate capital gains from structured data (ITR-2) or simple number
      let capitalGainsTotal = 0;
      if (income.capitalGains) {
        if (typeof income.capitalGains === 'object' && income.capitalGains.stcgDetails && income.capitalGains.ltcgDetails) {
          // ITR-2 structured format
          const stcgTotal = (income.capitalGains.stcgDetails || []).reduce(
            (sum, entry) => sum + (parseFloat(entry.gainAmount) || 0),
            0,
          );
          const ltcgTotal = (income.capitalGains.ltcgDetails || []).reduce(
            (sum, entry) => sum + (parseFloat(entry.gainAmount) || 0),
            0,
          );
          capitalGainsTotal = stcgTotal + ltcgTotal;
        } else {
          // Simple number format (ITR-1 fallback)
          capitalGainsTotal = parseFloat(income.capitalGains) || 0;
        }
      }

      // Calculate house property income from structured data (ITR-2) or simple number
      let housePropertyTotal = 0;
      if (income.houseProperty) {
        if (Array.isArray(income.houseProperty)) {
          // Array format
          housePropertyTotal = income.houseProperty.reduce((sum, prop) => {
            return sum + (parseFloat(prop.netRentalIncome) || 0);
          }, 0);
        } else if (income.houseProperty.properties && Array.isArray(income.houseProperty.properties)) {
          // ITR-2 structured format with properties array
          housePropertyTotal = income.houseProperty.properties.reduce((sum, prop) => {
            const rentalIncome = parseFloat(prop.annualRentalIncome) || 0;
            const municipalTaxes = parseFloat(prop.municipalTaxes) || 0;
            const interestOnLoan = parseFloat(prop.interestOnLoan) || 0;
            const netIncome = Math.max(0, rentalIncome - municipalTaxes - interestOnLoan);
            return sum + netIncome;
          }, 0);
        } else {
          // Simple number format
          housePropertyTotal = parseFloat(income.houseProperty) || 0;
        }
      }

      // Calculate foreign income total
      let foreignIncomeTotal = 0;
      if (income.foreignIncome && income.foreignIncome.foreignIncomeDetails) {
        foreignIncomeTotal = (income.foreignIncome.foreignIncomeDetails || []).reduce(
          (sum, entry) => sum + (parseFloat(entry.amountInr) || 0),
          0,
        );
      }

      // Calculate director/partner income
      const directorPartnerIncome = (income.directorPartner?.directorIncome || 0) +
                                    (income.directorPartner?.partnerIncome || 0);

      const grossTotalIncome =
        (income.salary || 0) +
        (income.businessIncome || 0) +
        (income.professionalIncome || 0) +
        capitalGainsTotal +
        housePropertyTotal +
        foreignIncomeTotal +
        directorPartnerIncome +
        (income.otherIncome || 0);

      const totalDeductions = regime === 'new'
        ? 50000 // Only standard deduction in new regime
        : Math.min(deductions.section80C || 0, 150000) +
          Math.min(deductions.section80D || 0, 25000) +
          (deductions.section80G || 0) +
          50000; // Standard deduction

      const taxableIncome = Math.max(0, grossTotalIncome - totalDeductions);

      // Simplified tax calculation (fallback)
      let taxLiability = 0;
      if (taxableIncome <= 250000) {
        taxLiability = 0;
      } else if (taxableIncome <= 500000) {
        taxLiability = (taxableIncome - 250000) * 0.05;
      } else if (taxableIncome <= 1000000) {
        taxLiability = 12500 + (taxableIncome - 500000) * 0.20;
      } else {
        taxLiability = 112500 + (taxableIncome - 1000000) * 0.30;
      }

      const cess = taxLiability * 0.04;
      const totalTaxLiability = taxLiability + cess;
      const totalTaxesPaid =
        (taxesPaid.tds || 0) +
        (taxesPaid.advanceTax || 0) +
        (taxesPaid.selfAssessmentTax || 0);
      const refundOrPayable = totalTaxesPaid - totalTaxLiability;

      const breakdown = {
        grossTotalIncome,
        totalDeductions,
        taxableIncome,
        taxLiability,
        cess,
        totalTaxLiability,
        totalTaxesPaid,
        refundOrPayable,
        isRefund: refundOrPayable > 0,
        regime,
      };

      setTaxBreakdown(breakdown);
      if (onComputed) {
        onComputed(breakdown);
      }
    } finally {
      setIsCalculating(false);
    }
  };

  if (isCalculating) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Calculator className="w-8 h-8 animate-pulse text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Calculating tax...</p>
        </div>
      </div>
    );
  }

  if (!taxBreakdown) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Enter income and deduction details to calculate tax</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Gross Total Income</span>
            <IndianRupee className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{taxBreakdown.grossTotalIncome.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Deductions</span>
            <TrendingDown className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{taxBreakdown.totalDeductions.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Taxable Income</span>
            <Calculator className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{taxBreakdown.taxableIncome.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Tax Breakdown */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-gray-900 mb-3">Tax Breakdown</h4>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax on Income</span>
          <span className="font-semibold text-gray-900">
            ₹{taxBreakdown.taxLiability.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Cess (4%)</span>
          <span className="font-semibold text-gray-900">
            ₹{taxBreakdown.cess.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="border-t border-gray-300 pt-2 flex justify-between">
          <span className="font-semibold text-gray-900">Total Tax Liability</span>
          <span className="font-bold text-gray-900">
            ₹{taxBreakdown.totalTaxLiability.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Taxes Already Paid</span>
          <span className="font-semibold text-gray-900">
            ₹{taxBreakdown.totalTaxesPaid.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Refund/Payable */}
      <div className={`rounded-lg p-4 border-2 ${
        taxBreakdown.isRefund
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {taxBreakdown.isRefund ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
            <span className="font-semibold text-gray-900">
              {taxBreakdown.isRefund ? 'Refund Due' : 'Tax Payable'}
            </span>
          </div>
          <span className={`text-2xl font-bold ${
            taxBreakdown.isRefund ? 'text-green-700' : 'text-red-700'
          }`}>
            {taxBreakdown.isRefund ? '+' : '-'}₹{Math.abs(taxBreakdown.refundOrPayable).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;
