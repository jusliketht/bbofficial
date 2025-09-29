// =====================================================
// COMPACT ITR FORM - MOBILE-FIRST DENSE FORM LAYOUT
// Efficient ITR filing with maximum information density
// =====================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  User, 
  Building2, 
  DollarSign, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  CompactInput, 
  CompactSelect, 
  CompactFormGroup, 
  CompactFormLayout, 
  CompactFormActions, 
  CompactButton 
} from './CompactForm';
import CompactCard from './CompactCard';

const CompactITRForm = ({ 
  formType = 'ITR-1',
  initialData = {},
  onSave,
  onSubmit,
  onCancel
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const totalSteps = 4;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.personalInfo?.name) newErrors['personalInfo.name'] = 'Name is required';
        if (!formData.personalInfo?.pan) newErrors['personalInfo.pan'] = 'PAN is required';
        if (!formData.personalInfo?.dob) newErrors['personalInfo.dob'] = 'Date of birth is required';
        break;
      case 2:
        if (!formData.incomeInfo?.salary) newErrors['incomeInfo.salary'] = 'Salary income is required';
        break;
      case 3:
        if (!formData.deductions?.section80C) newErrors['deductions.section80C'] = 'Section 80C deduction is required';
        break;
      case 4:
        if (!formData.bankInfo?.accountNumber) newErrors['bankInfo.accountNumber'] = 'Bank account number is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave(formData);
    }
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      setIsSubmitting(true);
      try {
        if (onSubmit) {
          await onSubmit(formData);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CompactFormGroup title="Personal Information" subtitle="Basic details for ITR filing">
            <CompactFormLayout columns={{ sm: 1, md: 2 }}>
              <CompactInput
                label="Full Name"
                value={formData.personalInfo?.name || ''}
                onChange={(e) => handleInputChange('personalInfo.name', e.target.value)}
                error={errors['personalInfo.name']}
                required
                icon={User}
              />
              <CompactInput
                label="PAN Number"
                value={formData.personalInfo?.pan || ''}
                onChange={(e) => handleInputChange('personalInfo.pan', e.target.value)}
                error={errors['personalInfo.pan']}
                required
                placeholder="ABCDE1234F"
              />
              <CompactInput
                label="Date of Birth"
                type="date"
                value={formData.personalInfo?.dob || ''}
                onChange={(e) => handleInputChange('personalInfo.dob', e.target.value)}
                error={errors['personalInfo.dob']}
                required
                icon={Calendar}
              />
              <CompactSelect
                label="Gender"
                value={formData.personalInfo?.gender || ''}
                onChange={(value) => handleInputChange('personalInfo.gender', value)}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' }
                ]}
                required
              />
              <CompactInput
                label="Mobile Number"
                type="tel"
                value={formData.personalInfo?.mobile || ''}
                onChange={(e) => handleInputChange('personalInfo.mobile', e.target.value)}
                placeholder="+91 98765 43210"
              />
              <CompactInput
                label="Email Address"
                type="email"
                value={formData.personalInfo?.email || ''}
                onChange={(e) => handleInputChange('personalInfo.email', e.target.value)}
                placeholder="user@example.com"
              />
            </CompactFormLayout>
          </CompactFormGroup>
        );

      case 2:
        return (
          <CompactFormGroup title="Income Information" subtitle="Details of your income sources">
            <CompactFormLayout columns={{ sm: 1, md: 2 }}>
              <CompactInput
                label="Salary Income"
                type="number"
                value={formData.incomeInfo?.salary || ''}
                onChange={(e) => handleInputChange('incomeInfo.salary', e.target.value)}
                error={errors['incomeInfo.salary']}
                required
                icon={DollarSign}
                helpText="Gross salary before deductions"
              />
              <CompactInput
                label="House Property Income"
                type="number"
                value={formData.incomeInfo?.houseProperty || ''}
                onChange={(e) => handleInputChange('incomeInfo.houseProperty', e.target.value)}
                icon={Building2}
                helpText="Rental income from house property"
              />
              <CompactInput
                label="Other Sources Income"
                type="number"
                value={formData.incomeInfo?.otherSources || ''}
                onChange={(e) => handleInputChange('incomeInfo.otherSources', e.target.value)}
                helpText="Interest, dividends, etc."
              />
              <CompactInput
                label="Capital Gains"
                type="number"
                value={formData.incomeInfo?.capitalGains || ''}
                onChange={(e) => handleInputChange('incomeInfo.capitalGains', e.target.value)}
                helpText="Short-term and long-term capital gains"
              />
            </CompactFormLayout>
          </CompactFormGroup>
        );

      case 3:
        return (
          <CompactFormGroup title="Deductions" subtitle="Tax-saving investments and expenses">
            <CompactFormLayout columns={{ sm: 1, md: 2 }}>
              <CompactInput
                label="Section 80C"
                type="number"
                value={formData.deductions?.section80C || ''}
                onChange={(e) => handleInputChange('deductions.section80C', e.target.value)}
                error={errors['deductions.section80C']}
                required
                helpText="Max ₹1,50,000 (PPF, ELSS, etc.)"
              />
              <CompactInput
                label="Section 80D"
                type="number"
                value={formData.deductions?.section80D || ''}
                onChange={(e) => handleInputChange('deductions.section80D', e.target.value)}
                helpText="Health insurance premium"
              />
              <CompactInput
                label="Section 80G"
                type="number"
                value={formData.deductions?.section80G || ''}
                onChange={(e) => handleInputChange('deductions.section80G', e.target.value)}
                helpText="Donations to charitable institutions"
              />
              <CompactInput
                label="Section 80TTA"
                type="number"
                value={formData.deductions?.section80TTA || ''}
                onChange={(e) => handleInputChange('deductions.section80TTA', e.target.value)}
                helpText="Interest on savings account (Max ₹10,000)"
              />
            </CompactFormLayout>
          </CompactFormGroup>
        );

      case 4:
        return (
          <CompactFormGroup title="Bank Details" subtitle="For refund processing">
            <CompactFormLayout columns={{ sm: 1, md: 2 }}>
              <CompactInput
                label="Bank Account Number"
                value={formData.bankInfo?.accountNumber || ''}
                onChange={(e) => handleInputChange('bankInfo.accountNumber', e.target.value)}
                error={errors['bankInfo.accountNumber']}
                required
                helpText="Account number for refund"
              />
              <CompactInput
                label="IFSC Code"
                value={formData.bankInfo?.ifsc || ''}
                onChange={(e) => handleInputChange('bankInfo.ifsc', e.target.value)}
                placeholder="SBIN0001234"
                helpText="Bank IFSC code"
              />
              <CompactInput
                label="Account Holder Name"
                value={formData.bankInfo?.accountHolderName || ''}
                onChange={(e) => handleInputChange('bankInfo.accountHolderName', e.target.value)}
                helpText="Name as per bank records"
              />
              <CompactSelect
                label="Account Type"
                value={formData.bankInfo?.accountType || ''}
                onChange={(value) => handleInputChange('bankInfo.accountType', value)}
                options={[
                  { value: 'savings', label: 'Savings' },
                  { value: 'current', label: 'Current' }
                ]}
              />
            </CompactFormLayout>
          </CompactFormGroup>
        );

      default:
        return null;
    }
  };

  const renderProgressBar = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-neutral-700">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-neutral-500">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div
          className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderStepNavigation = () => (
    <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
      <div className="flex items-center space-x-3">
        {currentStep > 1 && (
          <CompactButton
            variant="outline"
            onClick={handlePrevious}
            icon={ArrowLeft}
          >
            Previous
          </CompactButton>
        )}
        
        <CompactButton
          variant="ghost"
          onClick={handleSave}
          icon={Save}
        >
          Save Draft
        </CompactButton>
      </div>

      <div className="flex items-center space-x-3">
        <CompactButton
          variant="ghost"
          onClick={() => setShowPreview(!showPreview)}
          icon={showPreview ? EyeOff : Eye}
        >
          {showPreview ? 'Hide Preview' : 'Preview'}
        </CompactButton>

        {currentStep < totalSteps ? (
          <CompactButton
            onClick={handleNext}
            icon={ArrowRight}
            iconPosition="right"
          >
            Next
          </CompactButton>
        ) : (
          <CompactButton
            onClick={handleSubmit}
            loading={isSubmitting}
            variant="primary"
          >
            Submit ITR
          </CompactButton>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {formType} Filing
            </h1>
            <p className="text-neutral-600 mt-1">
              Complete your income tax return filing
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {formType}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <CompactCard className="p-6">
            {renderStepContent()}
            {renderStepNavigation()}
          </CompactCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Form Summary */}
          <CompactCard className="p-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Form Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Form Type</span>
                <span className="text-sm font-medium text-neutral-900">{formType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Assessment Year</span>
                <span className="text-sm font-medium text-neutral-900">2024-25</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Status</span>
                <span className="text-sm font-medium text-warning-600">Draft</span>
              </div>
            </div>
          </CompactCard>

          {/* Quick Tips */}
          <CompactCard className="p-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Tips</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Info className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-neutral-600">
                  Keep your PAN card and bank details handy
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Info className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-neutral-600">
                  Ensure all income details are accurate
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Info className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-neutral-600">
                  Save your progress regularly
                </p>
              </div>
            </div>
          </CompactCard>

          {/* Help & Support */}
          <CompactCard className="p-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Need Help?</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="text-sm font-medium text-neutral-900">Live Chat</div>
                <div className="text-xs text-neutral-500">Get instant help</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="text-sm font-medium text-neutral-900">Video Guide</div>
                <div className="text-xs text-neutral-500">Step-by-step tutorial</div>
              </button>
            </div>
          </CompactCard>
        </div>
      </div>
    </div>
  );
};

export default CompactITRForm;
