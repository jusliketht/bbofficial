// =====================================================
// COMPUTATION SECTION COMPONENT
// Reusable expandable section for ITR computation
// =====================================================

import React from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import TaxCalculator from './TaxCalculator';
import DeductionBreakdown from './DeductionBreakdown';
import { DeductionsManager } from '../../features/deductions';
import BalanceSheetForm from '../../features/income/business/components/balance-sheet-form';
import AuditInformationForm from '../../features/income/business/components/audit-information-form';
// Import from feature-first structure
import {
  SalaryForm,
  HousePropertyForm,
  CapitalGainsForm,
  BusinessIncomeForm,
  ProfessionalIncomeForm,
  ForeignIncomeForm,
  DirectorPartnerIncomeForm,
  ITR4IncomeForm,
  PresumptiveIncomeForm,
} from '../../features/income';
import { PersonalInfoForm } from '../../features/personal-info';
import { TaxesPaidForm } from '../../features/taxes-paid';
import { BankDetailsForm } from '../../features/bank-details';

const ComputationSection = ({
  id,
  title,
  icon: Icon,
  description,
  isExpanded,
  onToggle,
  formData,
  fullFormData,
  onUpdate,
  selectedITR,
  taxComputation,
  onTaxComputed,
  regime,
  assessmentYear,
  onDataUploaded,
  renderContentOnly = false, // When true, only render content (no card wrapper)
  readOnly = false, // When true, disable all editing
}) => {
  const renderSectionContent = () => {
    switch (id) {
      case 'personalInfo':
        return (
          <PersonalInfoForm
            data={formData}
            onUpdate={onUpdate}
          />
        );
      case 'income':
        // For ITR-2, use specialized components
        if (selectedITR === 'ITR-2' || selectedITR === 'ITR2') {
          return (
            <ITR2IncomeForm
              data={formData}
              onUpdate={onUpdate}
              selectedITR={selectedITR}
              fullFormData={fullFormData}
              formData={formData}
              onDataUploaded={onDataUploaded}
            />
          );
        }
        // For ITR-3, use ITR3IncomeForm (includes business/professional income)
        if (selectedITR === 'ITR-3' || selectedITR === 'ITR3') {
          return (
            <ITR3IncomeForm
              data={formData}
              onUpdate={onUpdate}
              selectedITR={selectedITR}
              fullFormData={fullFormData}
              formData={formData}
              onDataUploaded={onDataUploaded}
            />
          );
        }
        // For ITR-4, use ITR4IncomeForm (includes presumptive taxation)
        if (selectedITR === 'ITR-4' || selectedITR === 'ITR4') {
          return (
            <ITR4IncomeForm
              data={formData}
              onUpdate={onUpdate}
              selectedITR={selectedITR}
              fullFormData={fullFormData}
              onDataUploaded={onDataUploaded}
            />
          );
        }
        // For other ITR types (ITR-1), use SalaryForm
        return (
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Salary Income</h4>
              <SalaryForm
                data={formData}
                onUpdate={onUpdate}
                selectedITR={selectedITR}
                onForm16Extracted={onDataUploaded}
              />
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Other Income</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Other Income (₹)</label>
                <input
                  type="number"
                  value={formData.otherIncome || 0}
                  onChange={(e) => onUpdate({ otherIncome: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">Interest, dividends, winnings, etc.</p>
              </div>
            </div>
          </div>
        );
      case 'businessIncome':
        // ITR-3 specific: Business Income section
        if (selectedITR === 'ITR-3' || selectedITR === 'ITR3') {
          return (
            <BusinessIncomeForm
              data={formData}
              onUpdate={onUpdate}
              selectedITR={selectedITR}
            />
          );
        }
        return null;
      case 'professionalIncome':
        // ITR-3 specific: Professional Income section
        if (selectedITR === 'ITR-3' || selectedITR === 'ITR3') {
          return (
            <ProfessionalIncomeForm
              data={formData}
              onUpdate={onUpdate}
              selectedITR={selectedITR}
            />
          );
        }
        return null;
      case 'balanceSheet':
        // ITR-3 specific: Balance Sheet section
        if (selectedITR === 'ITR-3' || selectedITR === 'ITR3') {
          return (
            <BalanceSheetForm
              filingId={fullFormData?.filingId || fullFormData?.id || formData?.filingId || formData?.id}
              selectedITR={selectedITR}
              onUpdate={onUpdate}
            />
          );
        }
        return null;
      case 'auditInfo':
        // ITR-3 specific: Audit Information section
        if (selectedITR === 'ITR-3' || selectedITR === 'ITR3') {
          return (
            <AuditInformationForm
              filingId={fullFormData?.filingId || fullFormData?.id || formData?.filingId || formData?.id}
              selectedITR={selectedITR}
              onUpdate={onUpdate}
            />
          );
        }
        return null;
      case 'deductions':
        return (
          <>
            <DeductionsManager
              filingId={fullFormData?.filingId || fullFormData?.id || formData?.filingId || formData?.id}
              formData={formData}
              onUpdate={onUpdate}
            />
            <DeductionBreakdown
              formData={{ deductions: formData }}
              onUpdate={onUpdate}
            />
          </>
        );
      case 'taxesPaid':
        return (
          <TaxesPaidForm
            data={formData}
            onUpdate={onUpdate}
          />
        );
      case 'taxComputation':
        return (
          <TaxCalculator
            formData={fullFormData || formData}
            selectedITR={selectedITR}
            onComputed={onTaxComputed}
            regime={regime}
            assessmentYear={assessmentYear}
          />
        );
      case 'bankDetails':
        return (
          <BankDetailsForm
            data={formData}
            onUpdate={onUpdate}
          />
        );
      default:
        return null;
    }
  };

  const isComplete = () => {
    // Basic validation - can be enhanced
    if (!formData) return false;
    if (id === 'personalInfo') {
      return formData.pan && formData.name;
    }
    return true;
  };

  // If renderContentOnly is true, just render the content (used within SectionCard)
  if (renderContentOnly) {
    return <div className="section-card-content">{renderSectionContent()}</div>;
  }

  // Otherwise, render the full card with header (legacy mode)
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isComplete() ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-orange-600" />
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4">
          {renderSectionContent()}
        </div>
      )}
    </div>
  );
};

// PersonalInfoForm is now imported from features/personal-info
// Inline component removed - see features/personal-info/components/PersonalInfoForm.js

// ITR-2 Income Form Component (uses specialized forms)
const ITR2IncomeForm = ({ data, onUpdate, selectedITR, fullFormData, formData, onDataUploaded }) => {
  // Handle updates - data structure matches income object
  const handleSalaryUpdate = (value) => {
    onUpdate({ salary: parseFloat(value) || 0 });
  };

  const handleHousePropertyUpdate = (updates) => {
    onUpdate({
      houseProperty: {
        ...data.houseProperty,
        ...updates,
      },
    });
  };

  const handleCapitalGainsUpdate = (updates) => {
    onUpdate({
      capitalGains: {
        ...data.capitalGains,
        ...updates,
      },
    });
  };

  const handleForeignIncomeUpdate = (updates) => {
    onUpdate({
      foreignIncome: {
        ...data.foreignIncome,
        ...updates,
      },
    });
  };

  const handleDirectorPartnerUpdate = (updates) => {
    onUpdate({
      directorPartner: {
        ...data.directorPartner,
        ...updates,
      },
    });
  };

  const handleOtherIncomeUpdate = (value) => {
    onUpdate({ otherIncome: parseFloat(value) || 0 });
  };

  return (
    <div className="space-y-6">
      {/* Salary Income Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Salary Income</h4>
        <SalaryForm
          data={data}
          onUpdate={onUpdate}
          selectedITR={selectedITR}
          onForm16Extracted={onDataUploaded}
        />
      </div>

      {/* House Property Form - Multiple Properties */}
      <div className="border border-gray-200 rounded-lg p-4">
        <HousePropertyForm
          filingId={fullFormData?.filingId || fullFormData?.id || formData?.filingId || formData?.id}
          data={data.houseProperty || { properties: data.properties || [] }}
          onUpdate={handleHousePropertyUpdate}
          selectedITR={selectedITR}
          onDataUploaded={onDataUploaded}
        />
      </div>

      {/* Capital Gains Form */}
      <div className="border border-gray-200 rounded-lg p-4">
        <CapitalGainsForm
          filingId={fullFormData?.filingId || fullFormData?.id || formData?.filingId || formData?.id}
          data={data.capitalGains || {}}
          onUpdate={handleCapitalGainsUpdate}
          selectedITR={selectedITR}
          onDataUploaded={onDataUploaded}
        />
      </div>

      {/* Foreign Income Form */}
      <div className="border border-gray-200 rounded-lg p-4">
        <ForeignIncomeForm
          data={data.foreignIncome || {}}
          onUpdate={handleForeignIncomeUpdate}
          selectedITR={selectedITR}
        />
      </div>

      {/* Director/Partner Income Form */}
      <div className="border border-gray-200 rounded-lg p-4">
        <DirectorPartnerIncomeForm
          data={data.directorPartner || {}}
          onUpdate={handleDirectorPartnerUpdate}
          selectedITR={selectedITR}
        />
      </div>

      {/* Other Income Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Other Income</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Other Income (₹)</label>
          <input
            type="number"
            value={data.otherIncome || 0}
            onChange={(e) => handleOtherIncomeUpdate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-xs text-gray-500 mt-1">Interest, dividends, winnings, etc.</p>
        </div>
      </div>
    </div>
  );
};

// ITR-3 Income Form Component (includes all income sources)
const ITR3IncomeForm = ({ data, onUpdate, selectedITR, fullFormData, formData, onDataUploaded }) => {
  const handleSalaryUpdate = (value) => {
    onUpdate({ salary: parseFloat(value) || 0 });
  };

  const handleHousePropertyUpdate = (updates) => {
    onUpdate({
      houseProperty: {
        ...data.houseProperty,
        ...updates,
      },
    });
  };

  const handleCapitalGainsUpdate = (updates) => {
    onUpdate({
      capitalGains: {
        ...data.capitalGains,
        ...updates,
      },
    });
  };

  const handleForeignIncomeUpdate = (updates) => {
    onUpdate({
      foreignIncome: {
        ...data.foreignIncome,
        ...updates,
      },
    });
  };

  const handleDirectorPartnerUpdate = (updates) => {
    onUpdate({
      directorPartner: {
        ...data.directorPartner,
        ...updates,
      },
    });
  };

  const handleOtherIncomeUpdate = (value) => {
    onUpdate({ otherIncome: parseFloat(value) || 0 });
  };

  const handleBusinessIncomeUpdate = (updates) => {
    onUpdate({
      businessIncome: {
        ...data.businessIncome,
        ...updates,
      },
    });
  };

  const handleProfessionalIncomeUpdate = (updates) => {
    onUpdate({
      professionalIncome: {
        ...data.professionalIncome,
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Salary Income Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Salary Income</h4>
        <SalaryForm
          data={data}
          onUpdate={onUpdate}
          selectedITR={selectedITR}
          onForm16Extracted={onDataUploaded}
        />
      </div>

      {/* Business Income Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <BusinessIncomeForm
          filingId={fullFormData?.filingId || fullFormData?.id || formData?.filingId || formData?.id}
          data={data.businessIncome || {}}
          onUpdate={handleBusinessIncomeUpdate}
          selectedITR={selectedITR}
          onDataUploaded={onDataUploaded}
        />
      </div>

      {/* Professional Income Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <ProfessionalIncomeForm
          filingId={fullFormData?.filingId || fullFormData?.id || formData?.filingId || formData?.id}
          data={data.professionalIncome || {}}
          onUpdate={handleProfessionalIncomeUpdate}
          selectedITR={selectedITR}
          onDataUploaded={onDataUploaded}
        />
      </div>

      {/* House Property Form - Multiple Properties */}
      <div className="border border-gray-200 rounded-lg p-4">
        <HousePropertyForm
          filingId={fullFormData?.filingId || fullFormData?.id || formData?.filingId || formData?.id}
          data={data.houseProperty || { properties: data.properties || [] }}
          onUpdate={handleHousePropertyUpdate}
          selectedITR={selectedITR}
          onDataUploaded={onDataUploaded}
        />
      </div>

      {/* Capital Gains Form */}
      <div className="border border-gray-200 rounded-lg p-4">
        <CapitalGainsForm
          filingId={fullFormData?.filingId || fullFormData?.id || formData?.filingId || formData?.id}
          data={data.capitalGains || {}}
          onUpdate={handleCapitalGainsUpdate}
          selectedITR={selectedITR}
          onDataUploaded={onDataUploaded}
        />
      </div>

      {/* Foreign Income Form */}
      <div className="border border-gray-200 rounded-lg p-4">
        <ForeignIncomeForm
          data={data.foreignIncome || {}}
          onUpdate={handleForeignIncomeUpdate}
          selectedITR={selectedITR}
        />
      </div>

      {/* Director/Partner Income Form */}
      <div className="border border-gray-200 rounded-lg p-4">
        <DirectorPartnerIncomeForm
          data={data.directorPartner || {}}
          onUpdate={handleDirectorPartnerUpdate}
          selectedITR={selectedITR}
        />
      </div>

      {/* Other Income Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Other Income</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Other Income (₹)</label>
          <input
            type="number"
            value={data.otherIncome || 0}
            onChange={(e) => handleOtherIncomeUpdate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-xs text-gray-500 mt-1">Interest, dividends, winnings, etc.</p>
        </div>
      </div>
    </div>
  );
};

// IncomeForm is now replaced with SalaryForm and other specialized components
// For ITR-1, use SalaryForm component from features/income

// Deductions Form Component
const DeductionsForm = ({ data, onUpdate }) => {
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section 80C (₹)</label>
          <input
            type="number"
            value={data.section80C || 0}
            onChange={(e) => handleChange('section80C', parseFloat(e.target.value) || 0)}
            max={150000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-xs text-gray-500 mt-1">Max: ₹1,50,000</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section 80D (₹)</label>
          <input
            type="number"
            value={data.section80D || 0}
            onChange={(e) => handleChange('section80D', parseFloat(e.target.value) || 0)}
            max={25000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <p className="text-xs text-gray-500 mt-1">Max: ₹25,000</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section 80G (₹)</label>
          <input
            type="number"
            value={data.section80G || 0}
            onChange={(e) => handleChange('section80G', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
    </div>
  );
};

// TaxesPaidForm is now imported from features/taxes-paid
// Inline component removed - see features/taxes-paid/components/TaxesPaidForm.js

// BankDetailsForm is now imported from features/bank-details
// Inline component removed - see features/bank-details/components/BankDetailsForm.js

export default ComputationSection;

