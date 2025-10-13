// =====================================================
// CAPITAL GAINS FORM - BROKER INTEGRATION
// Supports file uploads from multiple brokers and future API integration
// =====================================================

import React, { useState, useEffect } from 'react';
import Button from '../UI/Button';
import Card from '../common/Card';
import BrokerFileUpload from './BrokerFileUpload';
import { enterpriseLogger } from '../../utils/logger';
import '../../styles/itr-forms.css';

const CapitalGainsForm = ({ 
  data = {}, 
  onChange, 
  onNext, 
  onPrevious, 
  itrType = 'ITR1' 
}) => {
  const [formData, setFormData] = useState({
    shortTerm: data.shortTerm || '',
    longTerm: data.longTerm || '',
    exemptLongTerm: data.exemptLongTerm || '',
    brokerData: data.brokerData || [],
    manualEntries: data.manualEntries || []
  });

  const [brokerFiles, setBrokerFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const supportedBrokers = [
    { 
      id: 'zerodha', 
      name: 'Zerodha', 
      fileFormat: '.xls', 
      apiAvailable: true,
      description: 'Upload P&L statement from Zerodha Console'
    },
    { 
      id: 'angelone', 
      name: 'Angel One', 
      fileFormat: '.xls', 
      apiAvailable: true,
      description: 'Upload capital gains report from Angel One'
    },
    { 
      id: 'groww', 
      name: 'Groww', 
      fileFormat: '.xls', 
      apiAvailable: false,
      description: 'Upload transaction statement from Groww'
    },
    { 
      id: 'upstox', 
      name: 'Upstox', 
      fileFormat: '.xls', 
      apiAvailable: true,
      description: 'Upload P&L report from Upstox'
    },
    { 
      id: 'icici', 
      name: 'ICICI Direct', 
      fileFormat: '.xls', 
      apiAvailable: false,
      description: 'Upload capital gains statement from ICICI Direct'
    }
  ];

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const processBrokerFile = async (file, broker) => {
    try {
      setIsProcessing(true);
      setErrors({});

      // Import the broker file processor
      const { BrokerFileProcessor } = await import('../../services/BrokerFileProcessor');
      const processor = new BrokerFileProcessor(broker.id);
      
      const result = await processor.processFile(file);
      
      setFormData(prev => ({
        ...prev,
        brokerData: [...prev.brokerData, {
          id: Date.now(),
          broker: broker.id,
          fileName: file.name,
          processedAt: new Date().toISOString(),
          data: result,
          status: 'processed'
        }]
      }));

      // Auto-calculate totals from processed data
      calculateTotalsFromBrokerData(result);

      setSuccessMessage(`✅ ${broker.name} file processed successfully! Found ${result.transactions?.length || 0} transactions.`);
      setTimeout(() => setSuccessMessage(''), 5000);

      enterpriseLogger.info('Broker file processed successfully', {
        broker: broker.id,
        fileName: file.name,
        result
      });

    } catch (error) {
      enterpriseLogger.error('Broker file processing failed', {
        broker: broker.id,
        fileName: file.name,
        error: error.message
      });

      setErrors({
        brokerFile: `Failed to process ${broker.name} file: ${error.message}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchFromBrokerAPI = async (broker) => {
    try {
      setIsProcessing(true);
      setErrors({});

      // Import the broker API service
      const { BrokerAPIService } = await import('../../services/BrokerAPIService');
      const apiService = new BrokerAPIService(broker.id);
      
      const data = await apiService.fetchCapitalGains();
      
      setFormData(prev => ({
        ...prev,
        brokerData: [...prev.brokerData, {
          id: Date.now(),
          broker: broker.id,
          fileName: 'API_Fetch',
          processedAt: new Date().toISOString(),
          data: data,
          status: 'api_fetched'
        }]
      }));

      // Auto-calculate totals from API data
      calculateTotalsFromBrokerData(data);

      enterpriseLogger.info('Broker API data fetched successfully', {
        broker: broker.id,
        data
      });

    } catch (error) {
      enterpriseLogger.error('Broker API fetch failed', {
        broker: broker.id,
        error: error.message
      });

      setErrors({
        brokerAPI: `Failed to fetch data from ${broker.name} API: ${error.message}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotalsFromBrokerData = (brokerData) => {
    let shortTermTotal = 0;
    let longTermTotal = 0;
    let exemptLongTermTotal = 0;

    if (brokerData.transactions) {
      brokerData.transactions.forEach(transaction => {
        if (transaction.type === 'short_term') {
          shortTermTotal += transaction.profit || 0;
        } else if (transaction.type === 'long_term') {
          if (transaction.exempt) {
            exemptLongTermTotal += transaction.profit || 0;
          } else {
            longTermTotal += transaction.profit || 0;
        }
      }
    });
    }

    setFormData(prev => ({
      ...prev,
      shortTerm: (parseFloat(prev.shortTerm) || 0) + shortTermTotal,
      longTerm: (parseFloat(prev.longTerm) || 0) + longTermTotal,
      exemptLongTerm: (parseFloat(prev.exemptLongTerm) || 0) + exemptLongTermTotal
    }));
  };

  const addManualEntry = () => {
    setFormData(prev => ({
      ...prev,
      manualEntries: [...prev.manualEntries, {
        id: Date.now(),
        type: 'short_term',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      }]
    }));
  };

  const updateManualEntry = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      manualEntries: prev.manualEntries.map(entry =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const removeManualEntry = (id) => {
    setFormData(prev => ({
      ...prev,
      manualEntries: prev.manualEntries.filter(entry => entry.id !== id)
    }));
  };

  const removeBrokerData = (id) => {
    setFormData(prev => ({
      ...prev,
      brokerData: prev.brokerData.filter(data => data.id !== id)
    }));
  };

  const calculateTotalCapitalGains = () => {
    const shortTerm = parseFloat(formData.shortTerm) || 0;
    const longTerm = parseFloat(formData.longTerm) || 0;
    const exemptLongTerm = parseFloat(formData.exemptLongTerm) || 0;
    
    return {
      shortTerm,
      longTerm,
      exemptLongTerm,
      total: shortTerm + longTerm + exemptLongTerm
    };
  };

  const validateForm = () => {
    const newErrors = {};

    // ITR-1 validation: Capital gains not allowed
    if (itrType === 'ITR1') {
      const totals = calculateTotalCapitalGains();
      if (totals.total > 0) {
        newErrors.capitalGains = 'Capital gains not allowed in ITR-1. Please use ITR-2.';
      }
    }

    // Validate manual entries
    formData.manualEntries.forEach((entry, index) => {
      if (!entry.amount || parseFloat(entry.amount) <= 0) {
        newErrors[`manualEntry_${index}`] = 'Amount must be greater than 0';
      }
      if (!entry.description.trim()) {
        newErrors[`manualEntry_${index}_desc`] = 'Description is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const totals = calculateTotalCapitalGains();

  return (
    <div className="capital-gains-form">
      <Card>
        <div className="form-header">
          <h2>Capital Gains</h2>
          <p>Upload broker statements or enter manually</p>
        </div>
        
        {/* Broker File Upload Section */}
        <div className="broker-upload-section">
          <h3>Upload Broker Statements</h3>
          <div className="broker-grid">
            {supportedBrokers.map(broker => (
              <div key={broker.id} className="broker-card">
                <div className="broker-info">
                  <h4>{broker.name}</h4>
                  <p>{broker.description}</p>
                  <div className="broker-badges">
                    <span className="badge file-upload">File Upload</span>
                    {broker.apiAvailable && (
                      <span className="badge api-available">API Available</span>
                    )}
          </div>
        </div>
                <div className="broker-actions">
                  <BrokerFileUpload
                    broker={broker}
                    onFileUpload={(file) => processBrokerFile(file, broker)}
                    onAPIFetch={() => fetchFromBrokerAPI(broker)}
                    disabled={isProcessing}
                  />
      </div>
    </div>
            ))}
          </div>
        </div>
        
        {/* Processed Broker Data */}
        {formData.brokerData.length > 0 && (
          <div className="broker-data-section">
            <h3>Processed Broker Data</h3>
            <div className="broker-data-list">
              {formData.brokerData.map(data => (
                <div key={data.id} className="broker-data-item">
                  <div className="data-info">
                    <span className="broker-name">{data.broker}</span>
                    <span className="file-name">{data.fileName}</span>
                    <span className="processed-date">
                      {new Date(data.processedAt).toLocaleDateString()}
            </span>
          </div>
                  <div className="data-summary">
                    <span>ST: ₹{data.data.shortTerm || 0}</span>
                    <span>LT: ₹{data.data.longTerm || 0}</span>
                    <span>Exempt: ₹{data.data.exemptLongTerm || 0}</span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => removeBrokerData(data.id)}
                  >
                    Remove
                  </Button>
        </div>
              ))}
      </div>
    </div>
        )}

        {/* Manual Entry Section */}
        <div className="manual-entry-section">
          <div className="section-header">
            <h3>Manual Entries</h3>
            <Button variant="primary" size="sm" onClick={addManualEntry}>
              Add Entry
            </Button>
        </div>
        
          {formData.manualEntries.map(entry => (
            <div key={entry.id} className="manual-entry-item">
              <div className="entry-fields">
                <select
                  value={entry.type}
                  onChange={(e) => updateManualEntry(entry.id, 'type', e.target.value)}
                  className="form-select"
                >
                  <option value="short_term">Short Term</option>
                  <option value="long_term">Long Term</option>
                  <option value="exempt_long_term">Exempt Long Term</option>
                </select>
                
                <input
                  type="number"
                  value={entry.amount}
                  onChange={(e) => updateManualEntry(entry.id, 'amount', e.target.value)}
                  placeholder="Amount"
                  className="form-input"
                />
                
                <input
                  type="text"
                  value={entry.description}
                  onChange={(e) => updateManualEntry(entry.id, 'description', e.target.value)}
                  placeholder="Description"
                  className="form-input"
                />
                
                <input
                  type="date"
                  value={entry.date}
                  onChange={(e) => updateManualEntry(entry.id, 'date', e.target.value)}
                  className="form-input"
                />
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => removeManualEntry(entry.id)}
                >
                  Remove
                </Button>
          </div>
        </div>
          ))}
    </div>

        {/* Summary Section */}
        <div className="summary-section">
          <h3>Capital Gains Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <label>Short Term Capital Gains:</label>
              <span>₹{totals.shortTerm.toLocaleString()}</span>
          </div>
            <div className="summary-item">
              <label>Long Term Capital Gains:</label>
              <span>₹{totals.longTerm.toLocaleString()}</span>
          </div>
            <div className="summary-item">
              <label>Exempt Long Term Capital Gains:</label>
              <span>₹{totals.exemptLongTerm.toLocaleString()}</span>
        </div>
            <div className="summary-item total">
              <label>Total Capital Gains:</label>
              <span>₹{totals.total.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div className="error-section">
            {Object.entries(errors).map(([key, error]) => (
              <div key={key} className="error-message">
                <strong>⚠️ Error:</strong> {error}
              </div>
            ))}
            </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="success-message" style={{
            padding: '12px 16px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            color: '#166534',
            marginBottom: '20px'
          }}>
            {successMessage}
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="upload-progress">
            <span>🔄 Processing broker file...</span>
        </div>
      )}

        {/* Navigation */}
        <div className="form-navigation">
          <Button variant="secondary" onClick={onPrevious}>
            Previous
          </Button>
          <Button variant="primary" onClick={handleNext}>
            Next
          </Button>
              </div>
      </Card>
    </div>
  );
};

export default CapitalGainsForm;
