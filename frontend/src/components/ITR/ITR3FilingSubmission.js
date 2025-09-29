// =====================================================
// ITR-3 FILING SUBMISSION COMPONENT - FINAL SUBMISSION
// Enterprise-grade ITR-3 submission with acknowledgment
// =====================================================

import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Download,
  Send,
  RefreshCw,
  Eye,
  Shield
} from 'lucide-react';

const ITR3FilingSubmission = ({ 
  filingData, 
  updateFilingData, 
  validationResults, 
  aiSuggestions, 
  onValidate, 
  isValidating 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [acknowledgmentNumber, setAcknowledgmentNumber] = useState(null);
  
  // Steps for submission process
  const steps = [
    { id: 1, title: 'Review', description: 'Final review of your ITR-3 filing' },
    { id: 2, title: 'Submit', description: 'Submit your ITR-3 to the Income Tax Department' },
    { id: 3, title: 'Acknowledgment', description: 'Receive acknowledgment and next steps' }
  ];
  
  // Calculate validation summary
  const getValidationSummary = () => {
    const errors = validationResults.filter(r => r.severity === 'error').length;
    const warnings = validationResults.filter(r => r.severity === 'warning').length;
    return { errors, warnings };
  };
  
  const validationSummary = getValidationSummary();
  
  // Handle submission
  const handleSubmission = async () => {
    if (validationSummary.errors > 0) {
      alert('Please fix all errors before submitting');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Mock submission - in real implementation, call API
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock acknowledgment number
      const ackNumber = `ACK${Date.now()}`;
      setAcknowledgmentNumber(ackNumber);
      
      // Update filing data
      updateFilingData({
        submission: {
          status: 'submitted',
          acknowledgmentNumber: ackNumber,
          submissionDate: new Date().toISOString()
        }
      });
      
      setSubmissionResult({
        success: true,
        message: 'ITR-3 filed successfully!',
        acknowledgmentNumber: ackNumber
      });
      
      setCurrentStep(3);
      
    } catch (error) {
      setSubmissionResult({
        success: false,
        message: 'Submission failed. Please try again.',
        error: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render review step
  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <h3 className="text-lg font-semibold text-burnblack-black mb-4">Final Review</h3>
        
        {/* Filing Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-neutral-50 rounded-lg">
            <div className="text-sm text-neutral-600">Total Income</div>
            <div className="text-xl font-bold text-burnblack-black">
              ₹{filingData.taxComputation?.totalIncome?.toLocaleString() || '0'}
            </div>
          </div>
          
          <div className="p-4 bg-neutral-50 rounded-lg">
            <div className="text-sm text-neutral-600">Taxable Income</div>
            <div className="text-xl font-bold text-burnblack-black">
              ₹{filingData.taxComputation?.taxableIncome?.toLocaleString() || '0'}
            </div>
          </div>
          
          <div className="p-4 bg-neutral-50 rounded-lg">
            <div className="text-sm text-neutral-600">Total Tax</div>
            <div className="text-xl font-bold text-burnblack-gold">
              ₹{filingData.taxComputation?.totalTax?.toLocaleString() || '0'}
            </div>
          </div>
          
          <div className="p-4 bg-neutral-50 rounded-lg">
            <div className="text-sm text-neutral-600">
              {filingData.taxComputation?.netRefund > 0 ? 'Refund Due' : 'Tax Payable'}
            </div>
            <div className={`text-xl font-bold ${
              filingData.taxComputation?.netRefund > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ₹{Math.abs(filingData.taxComputation?.netRefund || filingData.taxComputation?.netPayable || 0).toLocaleString()}
            </div>
          </div>
        </div>
        
        {/* Validation Status */}
        <div className="p-4 bg-neutral-50 rounded-lg">
          <h4 className="font-semibold text-burnblack-black mb-3">Validation Status</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {validationSummary.errors === 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-neutral-600">
                {validationSummary.errors === 0 ? 'No errors found' : `${validationSummary.errors} errors need attention`}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {validationSummary.warnings === 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm text-neutral-600">
                {validationSummary.warnings === 0 ? 'No warnings' : `${validationSummary.warnings} warnings to review`}
              </span>
            </div>
          </div>
        </div>
        
        {/* Business Details Summary */}
        <div className="p-4 bg-neutral-50 rounded-lg">
          <h4 className="font-semibold text-burnblack-black mb-3">Business Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-neutral-600">Business Name</div>
              <div className="text-sm font-medium text-burnblack-black">
                {filingData.businessIncome?.businessDetails?.businessName || 'Not provided'}
              </div>
            </div>
            <div>
              <div className="text-sm text-neutral-600">Business Type</div>
              <div className="text-sm font-medium text-burnblack-black">
                {filingData.businessIncome?.businessDetails?.businessType || 'Not provided'}
              </div>
            </div>
            <div>
              <div className="text-sm text-neutral-600">GST Number</div>
              <div className="text-sm font-medium text-burnblack-black">
                {filingData.businessIncome?.businessDetails?.gstNumber || 'Not provided'}
              </div>
            </div>
            <div>
              <div className="text-sm text-neutral-600">Accounting Method</div>
              <div className="text-sm font-medium text-burnblack-black">
                {filingData.businessIncome?.businessDetails?.accountingMethod || 'Not provided'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render submission step
  const renderSubmissionStep = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <h3 className="text-lg font-semibold text-burnblack-black mb-4">Submit ITR-3</h3>
        
        <div className="p-4 bg-burnblack-gold bg-opacity-10 rounded-lg mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-burnblack-gold" />
            <div>
              <h4 className="font-semibold text-burnblack-black">Secure Submission</h4>
              <p className="text-sm text-neutral-600">
                Your ITR-3 will be submitted securely to the Income Tax Department
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-neutral-600">Data validated and ready for submission</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-neutral-600">All required fields completed</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-neutral-600">Tax computation verified</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm text-neutral-600">Business details confirmed</span>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleSubmission}
            disabled={isSubmitting || validationSummary.errors > 0}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-burnblack-gold text-burnblack-black rounded-lg hover:bg-burnblack-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span>{isSubmitting ? 'Submitting...' : 'Submit ITR-3'}</span>
          </button>
        </div>
      </div>
    </div>
  );
  
  // Render acknowledgment step
  const renderAcknowledgmentStep = () => (
    <div className="space-y-6">
      <div className="dashboard-card-burnblack p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-burnblack-black mb-2">
            ITR-3 Filed Successfully!
          </h3>
          
          <p className="text-sm text-neutral-600 mb-6">
            Your ITR-3 has been submitted to the Income Tax Department
          </p>
          
          <div className="p-4 bg-burnblack-gold bg-opacity-10 rounded-lg mb-6">
            <div className="text-sm text-neutral-600">Acknowledgment Number</div>
            <div className="text-2xl font-bold text-burnblack-gold">
              {acknowledgmentNumber}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-sm text-neutral-600">Submission Date</div>
              <div className="text-sm font-medium text-burnblack-black">
                {new Date().toLocaleDateString()}
              </div>
            </div>
            
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="text-sm text-neutral-600">Submission Time</div>
              <div className="text-sm font-medium text-burnblack-black">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-burnblack-gold text-burnblack-black rounded-lg hover:bg-burnblack-gold-dark transition-colors">
              <Download className="h-5 w-5" />
              <span>Download Acknowledgment</span>
            </button>
            
            <button className="w-full flex items-center justify-center space-x-2 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">
              <Eye className="h-5 w-5" />
              <span>View Filed ITR-3</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Next Steps */}
      <div className="dashboard-card-burnblack p-4">
        <h3 className="text-lg font-semibold text-burnblack-black mb-4">Next Steps</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-burnblack-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-burnblack-black">1</span>
            </div>
            <div>
              <h4 className="font-medium text-burnblack-black">Keep Acknowledgment Safe</h4>
              <p className="text-sm text-neutral-600">
                Save the acknowledgment number for future reference and tax records
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-burnblack-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-burnblack-black">2</span>
            </div>
            <div>
              <h4 className="font-medium text-burnblack-black">Processing Time</h4>
              <p className="text-sm text-neutral-600">
                ITR processing typically takes 2-4 weeks. You'll receive updates via email
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-burnblack-gold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-burnblack-black">3</span>
            </div>
            <div>
              <h4 className="font-medium text-burnblack-black">Refund Status</h4>
              <p className="text-sm text-neutral-600">
                If you're due a refund, it will be processed after ITR verification
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Render current step content
  const renderCurrentStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderReviewStep();
      case 2:
        return renderSubmissionStep();
      case 3:
        return renderAcknowledgmentStep();
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="dashboard-card-burnblack p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-burnblack-gold bg-opacity-20">
            <FileText className="h-6 w-6 text-burnblack-gold" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-burnblack-black">File & Submit</h2>
            <p className="text-sm text-neutral-500">
              Final review and submission of your ITR-3
            </p>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step.id
                  ? 'bg-burnblack-gold text-burnblack-black'
                  : 'bg-neutral-200 text-neutral-600'
              }`}>
                {step.id}
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-burnblack-black">{step.title}</div>
                <div className="text-xs text-neutral-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-neutral-200 mx-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Step Content */}
      {renderCurrentStepContent()}
      
      {/* Navigation */}
      {currentStep < 3 && (
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={currentStep === 2 || validationSummary.errors > 0}
            className="px-6 py-3 bg-burnblack-gold text-burnblack-black rounded-lg hover:bg-burnblack-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === 1 ? 'Proceed to Submit' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ITR3FilingSubmission;
