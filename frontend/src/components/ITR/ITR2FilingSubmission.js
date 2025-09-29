// =====================================================
// ITR-2 FILING SUBMISSION COMPONENT - FINAL SUBMISSION
// Enterprise-grade ITR-2 submission with acknowledgment
// =====================================================

import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Download, 
  Send, 
  Eye,
  RefreshCw,
  ArrowRight,
  Shield,
  DollarSign,
  TrendingUp,
  Globe
} from 'lucide-react';

const ITR2FilingSubmission = ({ 
  filingData, 
  updateFilingData, 
  validationResults, 
  aiSuggestions, 
  onValidate, 
  isValidating 
}) => {
  const [submissionStep, setSubmissionStep] = useState('review'); // review, submit, acknowledgment
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  
  // Calculate final summary
  const calculateFinalSummary = () => {
    let totalIncome = 0;
    let totalDeductions = 0;
    let totalCapitalGains = 0;
    let totalForeignIncome = 0;
    
    // Income calculations
    if (filingData.income.salary) {
      const { basicSalary = 0, hra = 0, allowances = 0 } = filingData.income.salary;
      totalIncome += basicSalary + hra + allowances;
    }
    
    if (filingData.income.houseProperty) {
      const { annualValue = 0, municipalTaxes = 0, interestOnLoan = 0, isSelfOccupied = false } = filingData.income.houseProperty;
      const netAnnualValue = annualValue - municipalTaxes;
      
      if (isSelfOccupied) {
        totalIncome += Math.max(-200000, -interestOnLoan);
      } else {
        totalIncome += netAnnualValue - interestOnLoan;
      }
    }
    
    if (filingData.income.otherIncome) {
      const { bankInterest = 0, fdInterest = 0, dividendIncome = 0, otherSources = 0 } = filingData.income.otherIncome;
      totalIncome += bankInterest + fdInterest + dividendIncome + otherSources;
    }
    
    // Capital gains calculations
    if (filingData.income.capitalGains) {
      Object.values(filingData.income.capitalGains).forEach(asset => {
        if (asset) {
          const stcg = asset.stcg || 0;
          const ltcg = asset.ltcg || 0;
          const stcl = asset.stcl || 0;
          const ltcl = asset.ltcl || 0;
          
          if (asset.salePrice && asset.indexedCost) {
            // Real estate calculation
            totalCapitalGains += (asset.salePrice - asset.indexedCost);
          } else {
            // Other assets calculation
            totalCapitalGains += (stcg + ltcg - stcl - ltcl);
          }
        }
      });
    }
    
    // Foreign income calculations
    if (filingData.income.foreignIncome) {
      // Foreign salary
      if (filingData.income.foreignIncome.salary) {
        const { grossSalary = 0, exchangeRate = 1 } = filingData.income.foreignIncome.salary;
        totalForeignIncome += grossSalary * exchangeRate;
      }
      
      // Foreign business
      if (filingData.income.foreignIncome.business) {
        const { grossReceipts = 0, expenses = 0 } = filingData.income.foreignIncome.business;
        totalForeignIncome += grossReceipts - expenses;
      }
      
      // Other foreign income
      if (filingData.income.foreignIncome.other) {
        const { interest = 0, dividend = 0, royalty = 0, other = 0 } = filingData.income.foreignIncome.other;
        totalForeignIncome += interest + dividend + royalty + other;
      }
    }
    
    // Deduction calculations
    if (filingData.deductions.section80C) {
      const section80C = filingData.deductions.section80C;
      const total80C = (section80C.licPremium || 0) + 
                       (section80C.ppfContribution || 0) + 
                       (section80C.pfContribution || 0) + 
                       (section80C.elssInvestment || 0) + 
                       (section80C.tuitionFees || 0) + 
                       (section80C.homeLoanPrincipal || 0);
      totalDeductions += Math.min(150000, total80C);
    }
    
    if (filingData.deductions.section80D) {
      const section80D = filingData.deductions.section80D;
      const total80D = (section80D.medicalInsurance || 0) + (section80D.preventiveHealth || 0);
      totalDeductions += Math.min(25000, total80D);
    }
    
    if (filingData.deductions.hra) {
      totalDeductions += filingData.deductions.hra.claimedExemption || 0;
    }
    
    if (filingData.deductions.section80G) {
      totalDeductions += filingData.deductions.section80G.donations || 0;
    }
    
    if (filingData.deductions.section80E) {
      totalDeductions += filingData.deductions.section80E.educationLoanInterest || 0;
    }
    
    if (filingData.deductions.section80TTA) {
      const savingsInterest = filingData.deductions.section80TTA.savingsInterest || 0;
      totalDeductions += Math.min(10000, savingsInterest);
    }
    
    const taxableIncome = Math.max(0, totalIncome + totalCapitalGains + totalForeignIncome - totalDeductions);
    
    return { totalIncome, totalCapitalGains, totalForeignIncome, totalDeductions, taxableIncome };
  };
  
  const { totalIncome, totalCapitalGains, totalForeignIncome, totalDeductions, taxableIncome } = calculateFinalSummary();
  
  // Check if ready for submission
  const isReadyForSubmission = validationResults.filter(r => r.severity === 'error').length === 0;
  
  // Handle submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock successful submission
      const result = {
        success: true,
        acknowledgmentNumber: `ITR2${Date.now()}`,
        submissionDate: new Date().toISOString(),
        status: 'submitted',
        message: 'Your ITR-2 has been successfully submitted to the Income Tax Department.'
      };
      
      setSubmissionResult(result);
      setSubmissionStep('acknowledgment');
      
      // Update filing data with submission info
      updateFilingData({
        submission: {
          status: 'submitted',
          acknowledgmentNumber: result.acknowledgmentNumber,
          submissionDate: result.submissionDate
        }
      });
      
    } catch (error) {
      setSubmissionResult({
        success: false,
        error: 'Submission failed. Please try again.',
        message: 'There was an error submitting your ITR-2. Please contact support if the issue persists.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render review step
  const renderReviewStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <Eye className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-burnblack-black">Final Review (ITR-2)</h2>
            <p className="text-sm text-neutral-500">
              Review your ITR-2 details before submission
            </p>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dashboard-card-burnblack p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
              <DollarSign className="h-5 w-5 text-burnblack-gold" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Regular Income</p>
              <p className="text-lg font-semibold text-burnblack-black">
                ₹{totalIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card-burnblack p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
              <TrendingUp className="h-5 w-5 text-burnblack-gold" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Capital Gains</p>
              <p className="text-lg font-semibold text-burnblack-black">
                ₹{totalCapitalGains.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card-burnblack p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
              <Globe className="h-5 w-5 text-burnblack-gold" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Foreign Income</p>
              <p className="text-lg font-semibold text-burnblack-black">
                ₹{totalForeignIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="dashboard-card-burnblack p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
              <Shield className="h-5 w-5 text-burnblack-gold" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Deductions</p>
              <p className="text-lg font-semibold text-burnblack-black">
                ₹{totalDeductions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Taxable Income */}
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
              <FileText className="h-6 w-6 text-burnblack-gold" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-burnblack-black">Taxable Income</h3>
              <p className="text-sm text-neutral-500">Total income after deductions</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-burnblack-gold">
            ₹{taxableIncome.toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Tax Summary */}
      {filingData.taxComputation && (
        <div className="dashboard-card-burnblack p-4">
          <h3 className="text-lg font-semibold text-burnblack-black mb-4">Tax Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Total Tax</span>
              <span className="text-sm font-semibold text-burnblack-black">
                ₹{(filingData.taxComputation.totalTax || 0).toLocaleString()}
              </span>
            </div>
            
            {filingData.taxComputation.capitalGainsTax > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Capital Gains Tax</span>
                <span className="text-sm font-semibold text-burnblack-black">
                  ₹{(filingData.taxComputation.capitalGainsTax || 0).toLocaleString()}
                </span>
              </div>
            )}
            
            {filingData.taxComputation.foreignTaxCredit > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Foreign Tax Credit</span>
                <span className="text-sm font-semibold text-burnblack-black">
                  ₹{(filingData.taxComputation.foreignTaxCredit || 0).toLocaleString()}
                </span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">TDS Deducted</span>
              <span className="text-sm font-semibold text-burnblack-black">
                ₹{(filingData.taxComputation.tdsDeducted || 0).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Advance Tax</span>
              <span className="text-sm font-semibold text-burnblack-black">
                ₹{(filingData.taxComputation.advanceTax || 0).toLocaleString()}
              </span>
            </div>
            
            <div className="border-t border-neutral-200 pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-burnblack-black">
                  {filingData.taxComputation.netRefund > 0 ? 'Refund Due' : 'Tax Payable'}
                </span>
                <span className={`text-xl font-bold ${
                  filingData.taxComputation.netRefund > 0 ? 'text-success-600' : 'text-error-600'
                }`}>
                  ₹{Math.abs(filingData.taxComputation.netRefund || filingData.taxComputation.netPayable || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Validation Status */}
      <div className="dashboard-card-burnblack p-4">
        <h3 className="text-lg font-semibold text-burnblack-black mb-4">Validation Status</h3>
        {isReadyForSubmission ? (
          <div className="flex items-center space-x-3 p-3 bg-success-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-success-600" />
            <div>
              <p className="text-sm font-medium text-success-800">Ready for Submission</p>
              <p className="text-xs text-success-600">All validations passed successfully</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-3 bg-error-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-error-600" />
            <div>
              <p className="text-sm font-medium text-error-800">Action Required</p>
              <p className="text-xs text-error-600">
                Please fix {validationResults.filter(r => r.severity === 'error').length} error(s) before submission
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Submit Button */}
      <div className="dashboard-card-burnblack p-4">
        <button
          onClick={handleSubmit}
          disabled={!isReadyForSubmission || isSubmitting}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-burnblack-gold text-white rounded-lg hover:bg-burnblack-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Submit ITR-2</span>
            </>
          )}
        </button>
        
        {!isReadyForSubmission && (
          <p className="text-sm text-error-600 mt-2 text-center">
            Please resolve all validation errors before submitting
          </p>
        )}
      </div>
    </div>
  );
  
  // Render submit step
  const renderSubmitStep = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-burnblack-gold bg-opacity-20">
            <RefreshCw className="h-8 w-8 text-burnblack-gold animate-spin" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-burnblack-black mb-2">Submitting Your ITR-2</h2>
        <p className="text-sm text-neutral-500">
          Please wait while we submit your return to the Income Tax Department...
        </p>
      </div>
    </div>
  );
  
  // Render acknowledgment step
  const renderAcknowledgmentStep = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-success-100">
            <CheckCircle className="h-8 w-8 text-success-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-burnblack-black mb-2">Submission Successful!</h2>
        <p className="text-sm text-neutral-500 mb-6">
          Your ITR-2 has been successfully submitted to the Income Tax Department.
        </p>
        
        {submissionResult && (
          <div className="space-y-4">
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-neutral-600">Acknowledgment Number</span>
                <span className="text-sm font-semibold text-burnblack-black">
                  {submissionResult.acknowledgmentNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-600">Submission Date</span>
                <span className="text-sm font-semibold text-burnblack-black">
                  {new Date(submissionResult.submissionDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-burnblack-gold text-white rounded-lg hover:bg-burnblack-gold-dark transition-colors">
                <Download className="h-4 w-4" />
                <span>Download Acknowledgment</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">
                <FileText className="h-4 w-4" />
                <span>View Return</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Next Steps */}
      <div className="dashboard-card-burnblack p-4">
        <h3 className="text-lg font-semibold text-burnblack-black mb-4">What's Next?</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="p-1 rounded-full bg-burnblack-gold bg-opacity-20">
              <CheckCircle className="h-4 w-4 text-burnblack-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-burnblack-black">Processing</p>
              <p className="text-xs text-neutral-500">
                Your return will be processed within 15-30 days
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="p-1 rounded-full bg-burnblack-gold bg-opacity-20">
              <Clock className="h-4 w-4 text-burnblack-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-burnblack-black">Refund (if applicable)</p>
              <p className="text-xs text-neutral-500">
                Refund will be credited to your bank account within 30-45 days
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="p-1 rounded-full bg-burnblack-gold bg-opacity-20">
              <Shield className="h-4 w-4 text-burnblack-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-burnblack-black">Keep Records</p>
              <p className="text-xs text-neutral-500">
                Maintain all supporting documents for 6 years
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render current step
  const renderCurrentStep = () => {
    switch (submissionStep) {
      case 'review':
        return renderReviewStep();
      case 'submit':
        return renderSubmitStep();
      case 'acknowledgment':
        return renderAcknowledgmentStep();
      default:
        return renderReviewStep();
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${
              submissionStep === 'review' ? 'bg-burnblack-gold bg-opacity-20' : 'bg-neutral-100'
            }`}>
              <Eye className={`h-4 w-4 ${
                submissionStep === 'review' ? 'text-burnblack-gold' : 'text-neutral-400'
              }`} />
            </div>
            <span className={`text-sm font-medium ${
              submissionStep === 'review' ? 'text-burnblack-gold' : 'text-neutral-400'
            }`}>
              Review
            </span>
          </div>
          
          <ArrowRight className="h-4 w-4 text-neutral-400" />
          
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${
              submissionStep === 'submit' ? 'bg-burnblack-gold bg-opacity-20' : 'bg-neutral-100'
            }`}>
              <Send className={`h-4 w-4 ${
                submissionStep === 'submit' ? 'text-burnblack-gold' : 'text-neutral-400'
              }`} />
            </div>
            <span className={`text-sm font-medium ${
              submissionStep === 'submit' ? 'text-burnblack-gold' : 'text-neutral-400'
            }`}>
              Submit
            </span>
          </div>
          
          <ArrowRight className="h-4 w-4 text-neutral-400" />
          
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${
              submissionStep === 'acknowledgment' ? 'bg-burnblack-gold bg-opacity-20' : 'bg-neutral-100'
            }`}>
              <CheckCircle className={`h-4 w-4 ${
                submissionStep === 'acknowledgment' ? 'text-burnblack-gold' : 'text-neutral-400'
              }`} />
            </div>
            <span className={`text-sm font-medium ${
              submissionStep === 'acknowledgment' ? 'text-burnblack-gold' : 'text-neutral-400'
            }`}>
              Acknowledgment
            </span>
          </div>
        </div>
      </div>
      
      {/* Current Step Content */}
      {renderCurrentStep()}
    </div>
  );
};

export default ITR2FilingSubmission;
