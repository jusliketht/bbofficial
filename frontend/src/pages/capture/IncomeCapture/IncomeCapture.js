import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Plus,
  Trash2,
  Building,
  Home,
  TrendingUp,
  DollarSign,
  FileText,
  CheckCircle,
  Edit,
  Save,
  X,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';
import { useTaxComputation } from '../../../hooks/useTaxComputation';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync';
import { useAuth } from '../../../contexts/AuthContext';
import './IncomeCapture.css';

// Validation schemas for different income types
const salarySchema = yup.object({
  employerName: yup.string().required('Employer name is required'),
  employerPan: yup.string().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
  basicSalary: yup.number().min(0, 'Amount must be positive').required('Basic salary is required'),
  hra: yup.number().min(0, 'Amount must be positive'),
  specialAllowance: yup.number().min(0, 'Amount must be positive'),
  bonus: yup.number().min(0, 'Amount must be positive'),
  tdsDeducted: yup.number().min(0, 'Amount must be positive'),
});

const housePropertySchema = yup.object({
  propertyAddress: yup.string().required('Property address is required'),
  propertyType: yup.string().required('Property type is required'),
  ownershipType: yup.string().required('Ownership type is required'),
  annualValue: yup.number().min(0, 'Amount must be positive'),
  municipalTaxes: yup.number().min(0, 'Amount must be positive'),
  interestOnHousingLoan: yup.number().min(0, 'Amount must be positive'),
});

const businessSchema = yup.object({
  businessName: yup.string().required('Business name is required'),
  businessType: yup.string().required('Business type is required'),
  grossReceipts: yup.number().min(0, 'Amount must be positive').required('Gross receipts is required'),
  totalExpenses: yup.number().min(0, 'Amount must be positive'),
  netProfit: yup.number().min(0, 'Amount must be positive'),
});

const capitalGainsSchema = yup.object({
  assetType: yup.string().required('Asset type is required'),
  assetCategory: yup.string().required('Asset category is required'),
  dateOfPurchase: yup.date().required('Purchase date is required'),
  dateOfSale: yup.date().required('Sale date is required'),
  costOfAcquisition: yup.number().min(0, 'Amount must be positive').required('Cost of acquisition is required'),
  saleConsideration: yup.number().min(0, 'Amount must be positive').required('Sale consideration is required'),
});

const IncomeCapture = () => {
  const { user } = useAuth();
  const { addIncomeSource, updateIncomeSource, deleteIncomeSource, incomeSources } = useTaxComputation();
  const { syncData } = useRealtimeSync();
  
  const [activeTab, setActiveTab] = useState('salary');
  const [deviceType, setDeviceType] = useState('desktop');
  const [isEditing, setIsEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

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

  // Income type tabs
  const incomeTabs = [
    { id: 'salary', label: 'Salary', icon: Building, color: '#3b82f6' },
    { id: 'house_property', label: 'House Property', icon: Home, color: '#10b981' },
    { id: 'business', label: 'Business/Profession', icon: TrendingUp, color: '#f59e0b' },
    { id: 'capital_gains', label: 'Capital Gains', icon: DollarSign, color: '#8b5cf6' },
    { id: 'other', label: 'Other Income', icon: FileText, color: '#ef4444' },
  ];

  // Form schemas based on active tab
  const getSchema = () => {
    switch (activeTab) {
      case 'salary': return salarySchema;
      case 'house_property': return housePropertySchema;
      case 'business': return businessSchema;
      case 'capital_gains': return capitalGainsSchema;
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
    switch (activeTab) {
      case 'salary':
        return {
          employerName: '',
          employerPan: '',
          basicSalary: 0,
          hra: 0,
          specialAllowance: 0,
          bonus: 0,
          tdsDeducted: 0,
        };
      case 'house_property':
        return {
          propertyAddress: '',
          propertyType: 'residential',
          ownershipType: 'self_occupied',
          annualValue: 0,
          municipalTaxes: 0,
          interestOnHousingLoan: 0,
        };
      case 'business':
        return {
          businessName: '',
          businessType: 'business',
          grossReceipts: 0,
          totalExpenses: 0,
          netProfit: 0,
        };
      case 'capital_gains':
        return {
          assetType: 'equity_shares',
          assetCategory: 'long_term',
          dateOfPurchase: '',
          dateOfSale: '',
          costOfAcquisition: 0,
          saleConsideration: 0,
        };
      default:
        return {};
    }
  }

  // Watch form values for real-time validation
  const watchedValues = watch();

  // Real-time validation
  useEffect(() => {
    const validateForm = async () => {
      try {
        const schema = getSchema();
        await schema.validate(watchedValues, { abortEarly: false });
        setValidationErrors({});
      } catch (error) {
        const newErrors = {};
        error.inner.forEach(err => {
          newErrors[err.path] = err.message;
        });
        setValidationErrors(newErrors);
      }
    };

    if (Object.keys(watchedValues).length > 0) {
      validateForm();
    }
  }, [watchedValues, activeTab]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const incomeData = {
        ...data,
        type: activeTab,
        userId: user.id,
        dataSource: 'manual',
        confidenceScore: 1.0,
        createdAt: new Date().toISOString(),
      };

      if (isEditing) {
        await updateIncomeSource(isEditing, incomeData);
        setIsEditing(null);
      } else {
        await addIncomeSource(incomeData);
      }

      reset();
      setShowForm(false);
      
      // Trigger real-time sync
      await syncData('income', incomeData);
      
    } catch (error) {
      console.error('Error saving income source:', error);
    }
  };

  // Handle edit
  const handleEdit = (incomeSource) => {
    setIsEditing(incomeSource.id);
    reset(incomeSource);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income source?')) {
      await deleteIncomeSource(id);
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

  return (
    <div className={`income-capture ${deviceType}`}>
      {/* Header */}
      <div className="income-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Income Sources</h1>
            <div className="device-indicator">
              <DeviceIcon size={16} />
              <span>{deviceType}</span>
            </div>
          </div>
          
          <div className="header-right">
            <div className="income-summary">
              <span className="summary-label">Total Income:</span>
              <span className="summary-value">
                ₹{incomeSources.reduce((sum, source) => sum + (source.grossAmount || 0), 0).toLocaleString()}
              </span>
            </div>
            
            <button 
              className="add-income-btn"
              onClick={() => setShowForm(true)}
            >
              <Plus size={20} />
              <span>Add Income</span>
            </button>
          </div>
        </div>
      </div>

      {/* Income Type Tabs */}
      <div className="income-tabs">
        <div className="tabs-container">
          {incomeTabs.map((tab) => {
            const Icon = tab.icon;
            const count = incomeSources.filter(source => source.type === tab.id).length;
            
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ '--tab-color': tab.color }}
              >
                <Icon size={20} />
                <span className="tab-label">{tab.label}</span>
                {count > 0 && (
                  <span className="tab-count">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Income Sources List */}
      <div className="income-sources">
        <AnimatePresence>
          {incomeSources
            .filter(source => source.type === activeTab)
            .map((source, index) => (
              <motion.div
                key={source.id}
                className="income-source-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="card-header">
                  <div className="source-info">
                    <h3 className="source-title">{source.name || `${activeTab} Income`}</h3>
                    <div className="source-meta">
                      <span className="source-type">{source.type}</span>
                      <span className="source-date">
                        {new Date(source.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className="action-btn edit"
                      onClick={() => handleEdit(source)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDelete(source.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="amount-display">
                    <span className="amount-label">Gross Amount:</span>
                    <span className="amount-value">
                      ₹{source.grossAmount?.toLocaleString() || '0'}
                    </span>
                  </div>
                  
                  {source.taxableAmount && (
                    <div className="amount-display">
                      <span className="amount-label">Taxable Amount:</span>
                      <span className="amount-value">
                        ₹{source.taxableAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="source-details">
                    {Object.entries(source).map(([key, value]) => {
                      if (typeof value === 'object' || key === 'id' || key === 'type' || key === 'createdAt') {
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
                      Confidence: {(source.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
        
        {incomeSources.filter(source => source.type === activeTab).length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <DollarSign size={48} />
            </div>
            <h3>No {activeTab} income sources</h3>
            <p>Add your first {activeTab} income source to get started</p>
            <button 
              className="add-first-btn"
              onClick={() => setShowForm(true)}
            >
              <Plus size={20} />
              Add {activeTab} Income
            </button>
          </div>
        )}
      </div>

      {/* Income Form Modal */}
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
                <h2>Add {activeTab} Income</h2>
                <button 
                  className="close-btn"
                  onClick={() => setShowForm(false)}
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="income-form">
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
                    Save Income Source
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
      case 'salary':
        return (
          <>
            <div className="form-group">
              <label>Employer Name *</label>
              <Controller
                name="employerName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter employer name"
                    className={validationErrors.employerName ? 'error' : ''}
                  />
                )}
              />
              {validationErrors.employerName && (
                <span className="error-message">{validationErrors.employerName}</span>
              )}
            </div>

            <div className="form-group">
              <label>Employer PAN</label>
              <Controller
                name="employerPan"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="ABCDE1234F"
                    className={validationErrors.employerPan ? 'error' : ''}
                  />
                )}
              />
              {validationErrors.employerPan && (
                <span className="error-message">{validationErrors.employerPan}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Basic Salary *</label>
                <Controller
                  name="basicSalary"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      placeholder="0"
                      className={validationErrors.basicSalary ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.basicSalary && (
                  <span className="error-message">{validationErrors.basicSalary}</span>
                )}
              </div>

              <div className="form-group">
                <label>HRA</label>
                <Controller
                  name="hra"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      placeholder="0"
                      className={validationErrors.hra ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.hra && (
                  <span className="error-message">{validationErrors.hra}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Special Allowance</label>
                <Controller
                  name="specialAllowance"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      placeholder="0"
                      className={validationErrors.specialAllowance ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.specialAllowance && (
                  <span className="error-message">{validationErrors.specialAllowance}</span>
                )}
              </div>

              <div className="form-group">
                <label>Bonus</label>
                <Controller
                  name="bonus"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      placeholder="0"
                      className={validationErrors.bonus ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.bonus && (
                  <span className="error-message">{validationErrors.bonus}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>TDS Deducted</label>
              <Controller
                name="tdsDeducted"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    placeholder="0"
                    className={validationErrors.tdsDeducted ? 'error' : ''}
                  />
                )}
              />
              {validationErrors.tdsDeducted && (
                <span className="error-message">{validationErrors.tdsDeducted}</span>
              )}
            </div>
          </>
        );

      case 'house_property':
        return (
          <>
            <div className="form-group">
              <label>Property Address *</label>
              <Controller
                name="propertyAddress"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    placeholder="Enter property address"
                    className={validationErrors.propertyAddress ? 'error' : ''}
                    rows={3}
                  />
                )}
              />
              {validationErrors.propertyAddress && (
                <span className="error-message">{validationErrors.propertyAddress}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Property Type *</label>
                <Controller
                  name="propertyType"
                  control={control}
                  render={({ field }) => (
                    <select {...field} className={validationErrors.propertyType ? 'error' : ''}>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  )}
                />
                {validationErrors.propertyType && (
                  <span className="error-message">{validationErrors.propertyType}</span>
                )}
              </div>

              <div className="form-group">
                <label>Ownership Type *</label>
                <Controller
                  name="ownershipType"
                  control={control}
                  render={({ field }) => (
                    <select {...field} className={validationErrors.ownershipType ? 'error' : ''}>
                      <option value="self_occupied">Self Occupied</option>
                      <option value="let_out">Let Out</option>
                      <option value="deemed_let_out">Deemed Let Out</option>
                    </select>
                  )}
                />
                {validationErrors.ownershipType && (
                  <span className="error-message">{validationErrors.ownershipType}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Annual Value</label>
                <Controller
                  name="annualValue"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      placeholder="0"
                      className={validationErrors.annualValue ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.annualValue && (
                  <span className="error-message">{validationErrors.annualValue}</span>
                )}
              </div>

              <div className="form-group">
                <label>Municipal Taxes</label>
                <Controller
                  name="municipalTaxes"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      placeholder="0"
                      className={validationErrors.municipalTaxes ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.municipalTaxes && (
                  <span className="error-message">{validationErrors.municipalTaxes}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Interest on Housing Loan</label>
              <Controller
                name="interestOnHousingLoan"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    placeholder="0"
                    className={validationErrors.interestOnHousingLoan ? 'error' : ''}
                  />
                )}
              />
              {validationErrors.interestOnHousingLoan && (
                <span className="error-message">{validationErrors.interestOnHousingLoan}</span>
              )}
            </div>
          </>
        );

      case 'business':
        return (
          <>
            <div className="form-group">
              <label>Business Name *</label>
              <Controller
                name="businessName"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter business name"
                    className={validationErrors.businessName ? 'error' : ''}
                  />
                )}
              />
              {validationErrors.businessName && (
                <span className="error-message">{validationErrors.businessName}</span>
              )}
            </div>

            <div className="form-group">
              <label>Business Type *</label>
              <Controller
                name="businessType"
                control={control}
                render={({ field }) => (
                  <select {...field} className={validationErrors.businessType ? 'error' : ''}>
                    <option value="business">Business</option>
                    <option value="profession">Profession</option>
                  </select>
                )}
              />
              {validationErrors.businessType && (
                <span className="error-message">{validationErrors.businessType}</span>
              )}
            </div>

            <div className="form-group">
              <label>Gross Receipts *</label>
              <Controller
                name="grossReceipts"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    placeholder="0"
                    className={validationErrors.grossReceipts ? 'error' : ''}
                  />
                )}
              />
              {validationErrors.grossReceipts && (
                <span className="error-message">{validationErrors.grossReceipts}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Total Expenses</label>
                <Controller
                  name="totalExpenses"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      placeholder="0"
                      className={validationErrors.totalExpenses ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.totalExpenses && (
                  <span className="error-message">{validationErrors.totalExpenses}</span>
                )}
              </div>

              <div className="form-group">
                <label>Net Profit</label>
                <Controller
                  name="netProfit"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      placeholder="0"
                      className={validationErrors.netProfit ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.netProfit && (
                  <span className="error-message">{validationErrors.netProfit}</span>
                )}
              </div>
            </div>
          </>
        );

      case 'capital_gains':
        return (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Asset Type *</label>
                <Controller
                  name="assetType"
                  control={control}
                  render={({ field }) => (
                    <select {...field} className={validationErrors.assetType ? 'error' : ''}>
                      <option value="equity_shares">Equity Shares</option>
                      <option value="mutual_funds">Mutual Funds</option>
                      <option value="property">Property</option>
                      <option value="bonds">Bonds</option>
                      <option value="crypto">Cryptocurrency</option>
                    </select>
                  )}
                />
                {validationErrors.assetType && (
                  <span className="error-message">{validationErrors.assetType}</span>
                )}
              </div>

              <div className="form-group">
                <label>Asset Category *</label>
                <Controller
                  name="assetCategory"
                  control={control}
                  render={({ field }) => (
                    <select {...field} className={validationErrors.assetCategory ? 'error' : ''}>
                      <option value="long_term">Long Term</option>
                      <option value="short_term">Short Term</option>
                    </select>
                  )}
                />
                {validationErrors.assetCategory && (
                  <span className="error-message">{validationErrors.assetCategory}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Purchase Date *</label>
                <Controller
                  name="dateOfPurchase"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className={validationErrors.dateOfPurchase ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.dateOfPurchase && (
                  <span className="error-message">{validationErrors.dateOfPurchase}</span>
                )}
              </div>

              <div className="form-group">
                <label>Sale Date *</label>
                <Controller
                  name="dateOfSale"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className={validationErrors.dateOfSale ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.dateOfSale && (
                  <span className="error-message">{validationErrors.dateOfSale}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cost of Acquisition *</label>
                <Controller
                  name="costOfAcquisition"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      placeholder="0"
                      className={validationErrors.costOfAcquisition ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.costOfAcquisition && (
                  <span className="error-message">{validationErrors.costOfAcquisition}</span>
                )}
              </div>

              <div className="form-group">
                <label>Sale Consideration *</label>
                <Controller
                  name="saleConsideration"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      placeholder="0"
                      className={validationErrors.saleConsideration ? 'error' : ''}
                    />
                  )}
                />
                {validationErrors.saleConsideration && (
                  <span className="error-message">{validationErrors.saleConsideration}</span>
                )}
              </div>
            </div>
          </>
        );

      default:
        return (
          <div className="form-group">
            <label>Income Description</label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  placeholder="Enter income description"
                  rows={4}
                />
              )}
            />
          </div>
        );
    }
  }
};

export default IncomeCapture;
