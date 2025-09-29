import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Plus,
  Trash2,
  Shield,
  Building,
  FileText,
  CheckCircle,
  Edit,
  Save,
  X,
  Smartphone,
  Tablet,
  Monitor,
  TrendingUp,
  Target,
  Zap,
  GraduationCap,
  Heart
} from 'lucide-react';
import { useTaxComputation } from '../../../hooks/useTaxComputation';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync';
import { useAuth } from '../../../contexts/AuthContext';
import './DeductionCapture.css';

// Validation schemas for different deduction types
const section80CSchema = yup.object({
  investmentType: yup.string().required('Investment type is required'),
  amount: yup.number().min(0, 'Amount must be positive').max(150000, 'Maximum limit is ₹1,50,000').required('Amount is required'),
  financialYear: yup.string().required('Financial year is required'),
  institutionName: yup.string().required('Institution name is required'),
  policyNumber: yup.string(),
  maturityDate: yup.date(),
});

const section80DSchema = yup.object({
  insuranceType: yup.string().required('Insurance type is required'),
  amount: yup.number().min(0, 'Amount must be positive').required('Amount is required'),
  financialYear: yup.string().required('Financial year is required'),
  policyNumber: yup.string().required('Policy number is required'),
  insurerName: yup.string().required('Insurer name is required'),
  premiumAmount: yup.number().min(0, 'Amount must be positive'),
});

const section80GSchema = yup.object({
  donationType: yup.string().required('Donation type is required'),
  amount: yup.number().min(0, 'Amount must be positive').required('Amount is required'),
  financialYear: yup.string().required('Financial year is required'),
  doneeName: yup.string().required('Donee name is required'),
  doneePan: yup.string().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
  donationDate: yup.date().required('Donation date is required'),
});

const section80ESchema = yup.object({
  loanType: yup.string().required('Loan type is required'),
  amount: yup.number().min(0, 'Amount must be positive').required('Amount is required'),
  financialYear: yup.string().required('Financial year is required'),
  lenderName: yup.string().required('Lender name is required'),
  loanAccountNumber: yup.string().required('Loan account number is required'),
  interestPaid: yup.number().min(0, 'Amount must be positive'),
});

const DeductionCapture = () => {
  const { user } = useAuth();
  const { addDeduction, updateDeduction, deleteDeduction, deductions, taxComputation } = useTaxComputation();
  const { syncData } = useRealtimeSync();
  
  const [activeTab, setActiveTab] = useState('section_80c');
  const [deviceType, setDeviceType] = useState('desktop');
  const [isEditing, setIsEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [optimizationSuggestions, setOptimizationSuggestions] = useState([]);

  // Detect device type
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  // Deduction type tabs with limits and benefits
  const deductionTabs = [
    { 
      id: 'section_80c', 
      label: 'Section 80C', 
      icon: Shield, 
      color: '#3b82f6',
      limit: 150000,
      description: 'Life Insurance, PPF, ELSS, NSC, etc.',
      benefits: ['Tax savings up to ₹1,50,000', 'Multiple investment options', 'Long-term wealth creation']
    },
    { 
      id: 'section_80d', 
      label: 'Section 80D', 
      icon: Heart, 
      color: '#10b981',
      limit: 25000,
      description: 'Health Insurance Premium',
      benefits: ['Tax savings up to ₹25,000', 'Additional ₹25,000 for parents', 'Critical illness coverage']
    },
    { 
      id: 'section_80g', 
      label: 'Section 80G', 
      icon: GraduationCap, 
      color: '#f59e0b',
      limit: 'No limit',
      description: 'Donations to Charitable Institutions',
      benefits: ['100% deduction for some donations', '50% deduction for others', 'Social impact']
    },
    { 
      id: 'section_80e', 
      label: 'Section 80E', 
      icon: Building, 
      color: '#8b5cf6',
      limit: 'No limit',
      description: 'Interest on Education Loan',
      benefits: ['Full interest deduction', 'No upper limit', 'Education support']
    },
    { 
      id: 'other', 
      label: 'Other Deductions', 
      icon: FileText, 
      color: '#ef4444',
      limit: 'Varies',
      description: 'HRA, LTA, Medical, etc.',
      benefits: ['Various exemptions', 'Conditional benefits', 'Multiple categories']
    },
  ];

  // Form schemas based on active tab
  const getSchema = () => {
    switch (activeTab) {
      case 'section_80c': return section80CSchema;
      case 'section_80d': return section80DSchema;
      case 'section_80g': return section80GSchema;
      case 'section_80e': return section80ESchema;
      default: return yup.object({});
    }
  };

  // Initialize form
  const { control, handleSubmit, reset, formState: { errors, isValid }, watch } = useForm({
    resolver: yupResolver(getSchema()),
    mode: 'onChange',
    defaultValues: getDefaultValues()
  });

  function getDefaultValues() {
    const currentYear = new Date().getFullYear();
    const financialYear = `${currentYear}-${currentYear + 1}`;
    
    switch (activeTab) {
      case 'section_80c':
        return {
          investmentType: '',
          amount: 0,
          financialYear: financialYear,
          institutionName: '',
          policyNumber: '',
          maturityDate: '',
        };
      case 'section_80d':
        return {
          insuranceType: '',
          amount: 0,
          financialYear: financialYear,
          policyNumber: '',
          insurerName: '',
          premiumAmount: 0,
        };
      case 'section_80g':
        return {
          donationType: '',
          amount: 0,
          financialYear: financialYear,
          doneeName: '',
          doneePan: '',
          donationDate: '',
        };
      case 'section_80e':
        return {
          loanType: '',
          amount: 0,
          financialYear: financialYear,
          lenderName: '',
          loanAccountNumber: '',
          interestPaid: 0,
        };
      default:
        return {};
    }
  }

  // Watch form values for real-time validation and optimization
  const watchedValues = watch();

  // Real-time validation and optimization suggestions
  useEffect(() => {
    const validateAndOptimize = async () => {
      try {
        const schema = getSchema();
        await schema.validate(watchedValues, { abortEarly: false });
        setValidationErrors({});
        
        // Generate optimization suggestions
        generateOptimizationSuggestions(watchedValues);
      } catch (error) {
        const newErrors = {};
        error.inner.forEach(err => {
          newErrors[err.path] = err.message;
        });
        setValidationErrors(newErrors);
      }
    };

    if (Object.keys(watchedValues).length > 0) {
      validateAndOptimize();
    }
  }, [watchedValues, activeTab]);

  // Generate optimization suggestions
  const generateOptimizationSuggestions = (values) => {
    const suggestions = [];
    const currentTab = deductionTabs.find(tab => tab.id === activeTab);
    
    if (currentTab) {
      // Check if user is maximizing the deduction
      if (values.amount && currentTab.limit !== 'No limit' && values.amount < currentTab.limit * 0.8) {
        suggestions.push({
          type: 'optimization',
          message: `You can save more tax by increasing your ${currentTab.label} investment to ₹${currentTab.limit.toLocaleString()}`,
          potentialSavings: ((currentTab.limit - values.amount) * 0.3).toFixed(0),
          icon: TrendingUp
        });
      }
      
      // Check for missing opportunities
      if (activeTab === 'section_80c' && values.amount < 150000) {
        suggestions.push({
          type: 'opportunity',
          message: 'Consider ELSS funds for better returns and tax savings',
          icon: Target
        });
      }
      
      if (activeTab === 'section_80d' && values.amount < 25000) {
        suggestions.push({
          type: 'opportunity',
          message: 'Add health insurance for parents to maximize Section 80D benefits',
          icon: Heart
        });
      }
    }
    
    setOptimizationSuggestions(suggestions);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const deductionData = {
        ...data,
        section: activeTab,
        userId: user.id,
        dataSource: 'manual',
        confidenceScore: 1.0,
        createdAt: new Date().toISOString(),
        taxSavings: calculateTaxSavings(data.amount),
      };

      if (isEditing) {
        await updateDeduction(isEditing, deductionData);
        setIsEditing(null);
      } else {
        await addDeduction(deductionData);
      }

      reset();
      setShowForm(false);
      
      // Trigger real-time sync
      await syncData('deductions', deductionData);
      
    } catch (error) {
      console.error('Error saving deduction:', error);
    }
  };

  // Calculate tax savings
  const calculateTaxSavings = (amount) => {
    if (!amount) return 0;
    
    // Assuming 30% tax bracket for calculation
    const taxRate = 0.30;
    return amount * taxRate;
  };

  // Handle edit
  const handleEdit = (deduction) => {
    setIsEditing(deduction.id);
    reset(deduction);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this deduction?')) {
      await deleteDeduction(id);
    }
  };

  // Get device icon
  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  const DeviceIcon = getDeviceIcon();

  // Calculate total deductions by section
  const getTotalDeductionsBySection = (section) => {
    return deductions
      .filter(deduction => deduction.section === section)
      .reduce((sum, deduction) => sum + (deduction.amount || 0), 0);
  };

  return (
    <div className={`deduction-capture ${deviceType}`}>
      {/* Header */}
      <div className="deduction-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Tax Deductions</h1>
            <div className="device-indicator">
              <DeviceIcon size={16} />
              <span>{deviceType}</span>
            </div>
          </div>
          
          <div className="header-right">
            <div className="deduction-summary">
              <span className="summary-label">Total Deductions:</span>
              <span className="summary-value">
                ₹{deductions.reduce((sum, deduction) => sum + (deduction.amount || 0), 0).toLocaleString()}
              </span>
              <span className="tax-savings">
                Tax Savings: ₹{deductions.reduce((sum, deduction) => sum + (deduction.taxSavings || 0), 0).toLocaleString()}
              </span>
            </div>
            
            <button 
              className="add-deduction-btn"
              onClick={() => setShowForm(true)}
            >
              <Plus size={20} />
              <span>Add Deduction</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deduction Type Tabs */}
      <div className="deduction-tabs">
        <div className="tabs-container">
          {deductionTabs.map((tab) => {
            const Icon = tab.icon;
            const count = deductions.filter(deduction => deduction.section === tab.id).length;
            const totalAmount = getTotalDeductionsBySection(tab.id);
            const isMaximized = tab.limit !== 'No limit' && totalAmount >= tab.limit * 0.9;
            
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''} ${isMaximized ? 'maximized' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ '--tab-color': tab.color }}
              >
                <Icon size={20} />
                <div className="tab-content">
                  <span className="tab-label">{tab.label}</span>
                  <div className="tab-details">
                    <span className="tab-limit">Limit: ₹{tab.limit === 'No limit' ? '∞' : tab.limit.toLocaleString()}</span>
                    <span className="tab-used">Used: ₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                {count > 0 && (
                  <span className="tab-count">{count}</span>
                )}
                {isMaximized && (
                  <div className="maximized-indicator">
                    <CheckCircle size={16} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optimization Suggestions */}
      {optimizationSuggestions.length > 0 && (
        <div className="optimization-suggestions">
          <div className="suggestions-header">
            <Zap size={20} />
            <h3>Optimization Suggestions</h3>
          </div>
          <div className="suggestions-list">
            {optimizationSuggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <motion.div
                  key={index}
                  className={`suggestion-item ${suggestion.type}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Icon size={16} />
                  <span className="suggestion-message">{suggestion.message}</span>
                  {suggestion.potentialSavings && (
                    <span className="potential-savings">
                      Save ₹{suggestion.potentialSavings}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Deductions List */}
      <div className="deductions-list">
        <AnimatePresence>
          {deductions
            .filter(deduction => deduction.section === activeTab)
            .map((deduction, index) => (
              <motion.div
                key={deduction.id}
                className="deduction-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="card-header">
                  <div className="deduction-info">
                    <h3 className="deduction-title">{deduction.name || `${activeTab} Deduction`}</h3>
                    <div className="deduction-meta">
                      <span className="deduction-section">{deduction.section}</span>
                      <span className="deduction-date">
                        {new Date(deduction.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className="action-btn edit"
                      onClick={() => handleEdit(deduction)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDelete(deduction.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="amount-display">
                    <span className="amount-label">Deduction Amount:</span>
                    <span className="amount-value">
                      ₹{deduction.amount?.toLocaleString() || '0'}
                    </span>
                  </div>
                  
                  <div className="amount-display">
                    <span className="amount-label">Tax Savings:</span>
                    <span className="tax-savings-value">
                      ₹{deduction.taxSavings?.toLocaleString() || '0'}
                    </span>
                  </div>
                  
                  <div className="deduction-details">
                    {Object.entries(deduction).map(([key, value]) => {
                      if (typeof value === 'object' || key === 'id' || key === 'section' || key === 'createdAt' || key === 'amount' || key === 'taxSavings') {
                        return null;
                      }
                      return (
                        <div key={key} className="detail-item">
                          <span className="detail-label">{key}:</span>
                          <span className="detail-value">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="card-footer">
                  <div className="data-source">
                    <span className="source-badge manual">Manual Entry</span>
                    <span className="confidence-score">
                      Confidence: {(deduction.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
        
        {deductions.filter(deduction => deduction.section === activeTab).length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <Shield size={48} />
            </div>
            <h3>No {activeTab} deductions</h3>
            <p>Add your first {activeTab} deduction to maximize tax savings</p>
            <button 
              className="add-first-btn"
              onClick={() => setShowForm(true)}
            >
              <Plus size={20} />
              Add {activeTab} Deduction
            </button>
          </div>
        )}
      </div>

      {/* Deduction Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            className="form-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal-backdrop" onClick={() => setShowForm(false)} />
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h2>Add {activeTab} Deduction</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowForm(false)}
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="deduction-form">
                <div className="form-content">
                  {renderFormFields()}
                </div>
                
                <div className="form-footer">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="save-btn"
                    disabled={!isValid}
                  >
                    <Save size={20} />
                    Save Deduction
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Render form fields based on active tab
  function renderFormFields() {
    switch (activeTab) {
      case 'section_80c':
        return (
          <>
            <div className="form-group">
              <label>Investment Type *</label>
              <Controller
                name="investmentType"
                control={control}
                render={({ field }) => (
                  <select {...field} className={validationErrors.investmentType ? 'error' : ''}>
                    <option value="">Select investment type</option>
                    <option value="life_insurance">Life Insurance Premium</option>
                    <option value="ppf">Public Provident Fund (PPF)</option>
                    <option value="elss">Equity Linked Savings Scheme (ELSS)</option>
                    <option value="nsc">National Savings Certificate (NSC)</option>
                    <option value="sukanya_samriddhi">Sukanya Samriddhi Yojana</option>
                    <option value="epf">Employee Provident Fund (EPF)</option>
                    <option value="home_loan_principal">Home Loan Principal</option>
                  </select>
                )}
              />
              {validationErrors.investmentType && (
                <span className="error-message">{validationErrors.investmentType}</span>
              )}
            </div>

            <div className="form-group">
              <label>Amount * (Max: ₹1,50,000)</label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    placeholder="0"
                    max="150000"
                    className={validationErrors.amount ? 'error' : ''}
                  />
                )}
              />
              {validationErrors.amount && (
                <span className="error-message">{validationErrors.amount}</span>
              )}
            </div>

            <div className="form-group">
              <label>Financial Year *</label>
              <Controller
                name="financialYear"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="2024-2025"
                    className={validationErrors.financialYear ? 'error' : ''}
                  />
                )}
              />
              {validationErrors.financialYear && (
                <span className="error-message">{validationErrors.financialYear}</span>
              )}
            </div>

            <div className="form-group">
              <label>Institution Name *</label>
              <Controller
                name="institutionName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter institution name"
                    className={validationErrors.institutionName ? 'error' : ''}
                  />
                )}
              />
              {validationErrors.institutionName && (
                <span className="error-message">{validationErrors.institutionName}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Policy Number</label>
                <Controller
                  name="policyNumber"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Policy number"
                      className={validationErrors.policyNumber ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.policyNumber && (
                  <span className="error-message">{validationErrors.policyNumber}</span>
                )}
              </div>

              <div className="form-group">
                <label>Maturity Date</label>
                <Controller
                  name="maturityDate"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className={validationErrors.maturityDate ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.maturityDate && (
                  <span className="error-message">{validationErrors.maturityDate}</span>
                )}
              </div>
            </div>
          </>
        );

      case 'section_80d':
        return (
          <>
            <div className="form-group">
              <label>Insurance Type *</label>
              <Controller
                name="insuranceType"
                control={control}
                render={({ field }) => (
                  <select {...field} className={validationErrors.insuranceType ? 'error' : ''}>
                    <option value="">Select insurance type</option>
                    <option value="self_health">Self Health Insurance</option>
                    <option value="family_health">Family Health Insurance</option>
                    <option value="parents_health">Parents Health Insurance</option>
                    <option value="senior_citizen_health">Senior Citizen Health Insurance</option>
                    <option value="critical_illness">Critical Illness Insurance</option>
                  </select>
                )}
              />
              {validationErrors.insuranceType && (
                <span className="error-message">{validationErrors.insuranceType}</span>
              )}
            </div>

            <div className="form-group">
              <label>Premium Amount *</label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    placeholder="0"
                    className={validationErrors.amount ? 'error' : ''}
                  />
                )}
              />
              {validationErrors.amount && (
                <span className="error-message">{validationErrors.amount}</span>
              )}
            </div>

            <div className="form-group">
              <label>Financial Year *</label>
              <Controller
                name="financialYear"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="2024-2025"
                    className={validationErrors.financialYear ? 'error' : ''}
                  />
                )}
              />
              {validationErrors.financialYear && (
                <span className="error-message">{validationErrors.financialYear}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Policy Number *</label>
                <Controller
                  name="policyNumber"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Policy number"
                      className={validationErrors.policyNumber ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.policyNumber && (
                  <span className="error-message">{validationErrors.policyNumber}</span>
                )}
              </div>

              <div className="form-group">
                <label>Insurer Name *</label>
                <Controller
                  name="insurerName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Insurance company name"
                      className={validationErrors.insurerName ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.insurerName && (
                  <span className="error-message">{validationErrors.insurerName}</span>
                )}
              </div>
            </div>
          </>
        );

      case 'section_80g':
        return (
          <>
            <div className="form-group">
              <label>Donation Type *</label>
              <Controller
                name="donationType"
                control={control}
                render={({ field }) => (
                  <select {...field} className={validationErrors.donationType ? 'error' : ''}>
                    <option value="">Select donation type</option>
                    <option value="100_percent">100% Deduction (PM Relief Fund, etc.)</option>
                    <option value="50_percent">50% Deduction (Registered NGOs)</option>
                    <option value="50_percent_no_limit">50% Deduction No Limit</option>
                    <option value="100_percent_no_limit">100% Deduction No Limit</option>
                  </select>
                )}
              />
              {validationErrors.donationType && (
                <span className="error-message">{validationErrors.donationType}</span>
              )}
            </div>

            <div className="form-group">
              <label>Donation Amount *</label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    placeholder="0"
                    className={validationErrors.amount ? 'error' : ''}
                  />
                )}
              />
              {validationErrors.amount && (
                <span className="error-message">{validationErrors.amount}</span>
              )}
            </div>

            <div className="form-group">
              <label>Financial Year *</label>
              <Controller
                name="financialYear"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="2024-2025"
                    className={validationErrors.financialYear ? 'error' : ''}
                  />
                )}
              />
              {validationErrors.financialYear && (
                <span className="error-message">{validationErrors.financialYear}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Donee Name *</label>
                <Controller
                  name="doneeName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Organization name"
                      className={validationErrors.doneeName ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.doneeName && (
                  <span className="error-message">{validationErrors.doneeName}</span>
                )}
              </div>

              <div className="form-group">
                <label>Donee PAN</label>
                <Controller
                  name="doneePan"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="ABCDE1234F"
                      className={validationErrors.doneePan ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.doneePan && (
                  <span className="error-message">{validationErrors.doneePan}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Donation Date *</label>
              <Controller
                name="donationDate"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="date"
                    className={validationErrors.donationDate ? 'error' : ''}
                  />
                )}
              />
              {validationErrors.donationDate && (
                <span className="error-message">{validationErrors.donationDate}</span>
              )}
            </div>
          </>
        );

      case 'section_80e':
        return (
          <>
            <div className="form-group">
              <label>Loan Type *</label>
              <Controller
                name="loanType"
                control={control}
                render={({ field }) => (
                  <select {...field} className={validationErrors.loanType ? 'error' : ''}>
                    <option value="">Select loan type</option>
                    <option value="education_loan">Education Loan</option>
                    <option value="higher_education_loan">Higher Education Loan</option>
                  </select>
                )}
              />
              {validationErrors.loanType && (
                <span className="error-message">{validationErrors.loanType}</span>
              )}
            </div>

            <div className="form-group">
              <label>Interest Paid *</label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    placeholder="0"
                    className={validationErrors.amount ? 'error' : ''}
                  />
                )}
              />
              {validationErrors.amount && (
                <span className="error-message">{validationErrors.amount}</span>
              )}
            </div>

            <div className="form-group">
              <label>Financial Year *</label>
              <Controller
                name="financialYear"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="2024-2025"
                    className={validationErrors.financialYear ? 'error' : ''}
                  />
                )}
              />
              {validationErrors.financialYear && (
                <span className="error-message">{validationErrors.financialYear}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Lender Name *</label>
                <Controller
                  name="lenderName"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Bank or financial institution"
                      className={validationErrors.lenderName ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.lenderName && (
                  <span className="error-message">{validationErrors.lenderName}</span>
                )}
              </div>

              <div className="form-group">
                <label>Loan Account Number *</label>
                <Controller
                  name="loanAccountNumber"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Loan account number"
                      className={validationErrors.loanAccountNumber ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.loanAccountNumber && (
                  <span className="error-message">{validationErrors.loanAccountNumber}</span>
                )}
              </div>
            </div>
          </>
        );

      default:
        return (
          <div className="form-group">
            <label>Deduction Description</label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  placeholder="Enter deduction description"
                  rows={4}
                />
              )}
            />
          </div>
        );
    }
  }
};

export default DeductionCapture;
