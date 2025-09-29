// =====================================================
// ITR-3 REVIEW VALIDATION COMPONENT - COMPREHENSIVE VALIDATION
// Enterprise-grade ITR-3 validation with AI assistance
// =====================================================

import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Info,
  X,
  Eye,
  Home,
  Building,
  FileText,
  TrendingUp,
  Calculator
} from 'lucide-react';

const ITR3ReviewValidation = ({ 
  filingData, 
  updateFilingData, 
  validationResults, 
  aiSuggestions, 
  onValidate, 
  isValidating 
}) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [showAITooltip, setShowAITooltip] = useState(null);
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Get validation results for current field
  const getValidationResults = (field) => {
    return validationResults.filter(result => result.field === field);
  };
  
  // Get AI suggestions for current field
  const getAISuggestions = (field) => {
    return aiSuggestions.filter(suggestion => suggestion.field === field);
  };
  
  // Calculate validation summary
  const getValidationSummary = () => {
    const errors = validationResults.filter(r => r.severity === 'error').length;
    const warnings = validationResults.filter(r => r.severity === 'warning').length;
    const total = validationResults.length;
    
    return { errors, warnings, total };
  };
  
  const validationSummary = getValidationSummary();
  
  // Render business details section
  const renderBusinessDetailsSection = () => {
    const isExpanded = expandedSections.businessDetails;
    const businessDetails = filingData.businessIncome?.businessDetails || {};
    
    return (
      <div className="border border-neutral-200 rounded-lg">
        <button
          onClick={() => toggleSection('businessDetails')}
          className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Building className="h-5 w-5 text-burnblack-gold" />
            <div className="text-left">
              <h3 className="font-semibold text-burnblack-black">Business Details</h3>
              <p className="text-sm text-neutral-500">Business information and registration</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getValidationResults('businessName').length === 0 && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {getValidationResults('businessName').some(r => r.severity === 'error') && (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm text-neutral-500">
              {isExpanded ? 'Hide' : 'Show'}
            </span>
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-4 border-t border-neutral-200 bg-neutral-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-600">Business Name</label>
                <p className="text-sm text-burnblack-black">{businessDetails.businessName || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Business Type</label>
                <p className="text-sm text-burnblack-black">{businessDetails.businessType || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">GST Number</label>
                <p className="text-sm text-burnblack-black">{businessDetails.gstNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">PAN Number</label>
                <p className="text-sm text-burnblack-black">{businessDetails.panNumber || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Commencement Date</label>
                <p className="text-sm text-burnblack-black">{businessDetails.businessCommencementDate || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Accounting Method</label>
                <p className="text-sm text-burnblack-black">{businessDetails.accountingMethod || 'Not provided'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render P&L statement section
  const renderProfitLossSection = () => {
    const isExpanded = expandedSections.profitLoss;
    const profitLoss = filingData.businessIncome?.profitLoss || {};
    
    return (
      <div className="border border-neutral-200 rounded-lg">
        <button
          onClick={() => toggleSection('profitLoss')}
          className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-5 w-5 text-burnblack-gold" />
            <div className="text-left">
              <h3 className="font-semibold text-burnblack-black">Profit & Loss Statement</h3>
              <p className="text-sm text-neutral-500">Business income and expenses</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getValidationResults('revenue').length === 0 && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {getValidationResults('revenue').some(r => r.severity === 'error') && (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm text-neutral-500">
              {isExpanded ? 'Hide' : 'Show'}
            </span>
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-4 border-t border-neutral-200 bg-neutral-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-600">Revenue/Sales</label>
                <p className="text-sm text-burnblack-black">₹{profitLoss.revenue?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Other Income</label>
                <p className="text-sm text-burnblack-black">₹{profitLoss.otherIncome?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Purchases</label>
                <p className="text-sm text-burnblack-black">₹{profitLoss.purchases?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Direct Expenses</label>
                <p className="text-sm text-burnblack-black">₹{profitLoss.directExpenses?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Indirect Expenses</label>
                <p className="text-sm text-burnblack-black">₹{profitLoss.indirectExpenses?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Net Profit/Loss</label>
                <p className="text-sm text-burnblack-black">
                  ₹{(() => {
                    const revenue = profitLoss.revenue || 0;
                    const otherIncome = profitLoss.otherIncome || 0;
                    const purchases = profitLoss.purchases || 0;
                    const directExpenses = profitLoss.directExpenses || 0;
                    const indirectExpenses = profitLoss.indirectExpenses || 0;
                    return (revenue + otherIncome - purchases - directExpenses - indirectExpenses).toLocaleString();
                  })()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render balance sheet section
  const renderBalanceSheetSection = () => {
    const isExpanded = expandedSections.balanceSheet;
    const balanceSheet = filingData.businessIncome?.balanceSheet || {};
    
    return (
      <div className="border border-neutral-200 rounded-lg">
        <button
          onClick={() => toggleSection('balanceSheet')}
          className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-burnblack-gold" />
            <div className="text-left">
              <h3 className="font-semibold text-burnblack-black">Balance Sheet</h3>
              <p className="text-sm text-neutral-500">Assets, liabilities, and capital</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getValidationResults('currentAssets').length === 0 && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {getValidationResults('currentAssets').some(r => r.severity === 'error') && (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm text-neutral-500">
              {isExpanded ? 'Hide' : 'Show'}
            </span>
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-4 border-t border-neutral-200 bg-neutral-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-600">Current Assets</label>
                <p className="text-sm text-burnblack-black">₹{balanceSheet.currentAssets?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Fixed Assets</label>
                <p className="text-sm text-burnblack-black">₹{balanceSheet.fixedAssets?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Investments</label>
                <p className="text-sm text-burnblack-black">₹{balanceSheet.investments?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Current Liabilities</label>
                <p className="text-sm text-burnblack-black">₹{balanceSheet.currentLiabilities?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Long-term Liabilities</label>
                <p className="text-sm text-burnblack-black">₹{balanceSheet.longTermLiabilities?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Opening Capital</label>
                <p className="text-sm text-burnblack-black">₹{balanceSheet.openingCapital?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render other income section
  const renderOtherIncomeSection = () => {
    const isExpanded = expandedSections.otherIncome;
    const otherIncome = filingData.otherIncome || {};
    
    return (
      <div className="border border-neutral-200 rounded-lg">
        <button
          onClick={() => toggleSection('otherIncome')}
          className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Home className="h-5 w-5 text-burnblack-gold" />
            <div className="text-left">
              <h3 className="font-semibold text-burnblack-black">Other Income</h3>
              <p className="text-sm text-neutral-500">Income from other sources</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getValidationResults('salary').length === 0 && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {getValidationResults('salary').some(r => r.severity === 'error') && (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm text-neutral-500">
              {isExpanded ? 'Hide' : 'Show'}
            </span>
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-4 border-t border-neutral-200 bg-neutral-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-600">Salary Income</label>
                <p className="text-sm text-burnblack-black">₹{otherIncome.salary?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">House Property</label>
                <p className="text-sm text-burnblack-black">₹{otherIncome.houseProperty?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Capital Gains</label>
                <p className="text-sm text-burnblack-black">₹{otherIncome.capitalGains?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Other Sources</label>
                <p className="text-sm text-burnblack-black">₹{otherIncome.otherSources?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render deductions section
  const renderDeductionsSection = () => {
    const isExpanded = expandedSections.deductions;
    const deductions = filingData.deductions || {};
    
    return (
      <div className="border border-neutral-200 rounded-lg">
        <button
          onClick={() => toggleSection('deductions')}
          className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Calculator className="h-5 w-5 text-burnblack-gold" />
            <div className="text-left">
              <h3 className="font-semibold text-burnblack-black">Deductions</h3>
              <p className="text-sm text-neutral-500">Tax-saving deductions</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getValidationResults('section80C').length === 0 && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {getValidationResults('section80C').some(r => r.severity === 'error') && (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm text-neutral-500">
              {isExpanded ? 'Hide' : 'Show'}
            </span>
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-4 border-t border-neutral-200 bg-neutral-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-600">Section 80C</label>
                <p className="text-sm text-burnblack-black">
                  ₹{Math.min(Object.values(deductions.section80C || {}).reduce((sum, value) => sum + (value || 0), 0), 150000).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Section 80D</label>
                <p className="text-sm text-burnblack-black">
                  ₹{Object.values(deductions.section80D || {}).reduce((sum, value) => sum + (value || 0), 0).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Section 80G</label>
                <p className="text-sm text-burnblack-black">
                  ₹{Object.values(deductions.section80G || {}).reduce((sum, value) => sum + (value || 0), 0).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-600">Business Deductions</label>
                <p className="text-sm text-burnblack-black">
                  ₹{Object.values(deductions.businessDeductions || {}).reduce((sum, value) => sum + (value || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <CheckCircle className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-burnblack-black">Review & Validation</h2>
            <p className="text-sm text-neutral-500">
              Review your ITR-3 filing data and validate before submission
            </p>
          </div>
        </div>
        
        {/* Validation Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="text-sm text-red-600">Errors</div>
            <div className="text-2xl font-bold text-red-600">{validationSummary.errors}</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="text-sm text-yellow-600">Warnings</div>
            <div className="text-2xl font-bold text-yellow-600">{validationSummary.warnings}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600">Total Issues</div>
            <div className="text-2xl font-bold text-green-600">{validationSummary.total}</div>
          </div>
        </div>
      </div>
      
      {/* Data Sections */}
      <div className="space-y-4">
        {renderBusinessDetailsSection()}
        {renderProfitLossSection()}
        {renderBalanceSheetSection()}
        {renderOtherIncomeSection()}
        {renderDeductionsSection()}
      </div>
      
      {/* Validation Results */}
      {validationResults.length > 0 && (
        <div className="dashboard-card-burnblack p-4">
          <h3 className="text-lg font-semibold text-burnblack-black mb-4">Validation Results</h3>
          <div className="space-y-3">
            {validationResults.map((result, index) => (
              <div key={index} className={`flex items-center space-x-2 text-sm ${
                result.severity === 'error' ? 'text-error-600' : 'text-warning-600'
              }`}>
                {result.severity === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
                <span>{result.error}</span>
                {result.suggestion && (
                  <span className="text-neutral-500">- {result.suggestion}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="dashboard-card-burnblack p-4">
          <h3 className="text-lg font-semibold text-burnblack-black mb-4">AI Suggestions</h3>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="p-3 bg-burnblack-gold bg-opacity-10 rounded-lg">
                <p className="text-sm text-burnblack-black">{suggestion.message}</p>
                {suggestion.suggestion && (
                  <p className="text-xs text-neutral-600 mt-1">{suggestion.suggestion}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Final Readiness Check */}
      <div className="dashboard-card-burnblack p-4">
        <h3 className="text-lg font-semibold text-burnblack-black mb-4">Final Readiness Check</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            {validationSummary.errors === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm text-neutral-600">
              {validationSummary.errors === 0 ? 'No critical errors found' : `${validationSummary.errors} critical errors need attention`}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {validationSummary.warnings === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Info className="h-5 w-5 text-yellow-500" />
            )}
            <span className="text-sm text-neutral-600">
              {validationSummary.warnings === 0 ? 'No warnings' : `${validationSummary.warnings} warnings to review`}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-neutral-600">All required fields completed</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-burnblack-gold bg-opacity-10 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-burnblack-black">Ready to Submit</span>
            <span className={`text-sm font-semibold ${
              validationSummary.errors === 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {validationSummary.errors === 0 ? 'Yes' : 'No - Fix errors first'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ITR3ReviewValidation;
