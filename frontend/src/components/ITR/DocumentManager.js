// =====================================================
// DOCUMENT MANAGER COMPONENT
// =====================================================

import React, { useState, useEffect } from 'react';
import Button from '../Common/Button';
import Card from '../Common/Card';
import Tooltip from '../Common/Tooltip';
import DocumentUpload from './DocumentUpload';
import { enterpriseLogger } from '../../utils/logger';

const DocumentManager = ({ 
  itrType = 'ITR1',
  onDocumentsChange,
  initialDocuments = {},
  disabled = false 
}) => {
  const [documents, setDocuments] = useState(initialDocuments);
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    onDocumentsChange && onDocumentsChange(documents);
  }, [documents, onDocumentsChange]);

  // Document requirements based on ITR type
  const getDocumentRequirements = (itrType) => {
    const baseRequirements = {
      personal: {
        title: 'Personal Documents',
        documents: [
          { type: 'pan', required: true, description: 'PAN Card' },
          { type: 'aadhaar', required: true, description: 'Aadhaar Card' }
        ]
      },
      income: {
        title: 'Income Documents',
        documents: [
          { type: 'form16', required: true, description: 'Form 16 from employer' },
          { type: 'bankStatement', required: false, description: 'Bank statements for interest income' }
        ]
      },
      deductions: {
        title: 'Deduction Documents',
        documents: [
          { type: 'investmentProof', required: false, description: 'Investment proofs (ELSS, PPF, etc.)' },
          { type: 'houseProperty', required: false, description: 'House property documents' }
        ]
      }
    };

    // ITR-specific requirements
    if (itrType === 'ITR2') {
      baseRequirements.income.documents.push(
        { type: 'capitalGains', required: false, description: 'Capital gains statements' }
      );
    }

    if (itrType === 'ITR3') {
      baseRequirements.income.documents.push(
        { type: 'businessIncome', required: true, description: 'Business income documents' }
      );
    }

    if (itrType === 'ITR4') {
      baseRequirements.income.documents.push(
        { type: 'presumptiveIncome', required: true, description: 'Presumptive income documents' }
      );
    }

    return baseRequirements;
  };

  const documentRequirements = getDocumentRequirements(itrType);

  const handleDocumentUpload = (documentType, file) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: [...(prev[documentType] || []), file]
    }));
    
    enterpriseLogger.info('Document uploaded', { documentType, fileName: file.name });
  };

  const handleDocumentRemove = (documentType, fileId) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: (prev[documentType] || []).filter(file => file.id !== fileId)
    }));
    
    enterpriseLogger.info('Document removed', { documentType, fileId });
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const getCompletionStatus = () => {
    let totalRequired = 0;
    let completedRequired = 0;

    Object.values(documentRequirements).forEach(section => {
      section.documents.forEach(doc => {
        if (doc.required) {
          totalRequired++;
          if (documents[doc.type] && documents[doc.type].length > 0) {
            completedRequired++;
          }
        }
      });
    });

    return {
      completed: completedRequired,
      total: totalRequired,
      percentage: totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 100
    };
  };

  const completionStatus = getCompletionStatus();

  const renderDocumentSection = (sectionKey, section) => {
    const isExpanded = expandedSections[sectionKey];
    const sectionDocuments = section.documents.map(doc => ({
      ...doc,
      files: documents[doc.type] || []
    }));

    return (
      <Card key={sectionKey} className="document-section">
        <div 
          className="section-header"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="section-title">
            <h3>{section.title}</h3>
            <span className="section-count">
              {sectionDocuments.reduce((sum, doc) => sum + doc.files.length, 0)} files
            </span>
          </div>
          <div className="section-toggle">
            {isExpanded ? '▼' : '▶'}
          </div>
        </div>

        {isExpanded && (
          <div className="section-content">
            {sectionDocuments.map(doc => (
              <div key={doc.type} className="document-type">
                <div className="document-type-header">
                  <h4>
                    {doc.description}
                    {doc.required && <span className="required">*</span>}
                    <Tooltip content={`Upload ${doc.description.toLowerCase()}`}>
                      <span className="help-icon">?</span>
                    </Tooltip>
                  </h4>
                  <span className="file-count">
                    {doc.files.length} file{doc.files.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <DocumentUpload
                  documentType={doc.type}
                  onUpload={(file) => handleDocumentUpload(doc.type, file)}
                  onRemove={(fileId) => handleDocumentRemove(doc.type, fileId)}
                  uploadedFiles={doc.files}
                  disabled={disabled}
                  className="document-upload-inline"
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="document-manager">
      <div className="document-manager-header">
        <h2>Document Upload</h2>
        <div className="completion-status">
          <div className="completion-info">
            <span className="completion-text">
              Required Documents: {completionStatus.completed}/{completionStatus.total}
            </span>
            <span className="completion-percentage">
              {completionStatus.percentage}%
            </span>
          </div>
          <div className="completion-bar">
            <div 
              className="completion-fill"
              style={{ width: `${completionStatus.percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="document-sections">
        {Object.entries(documentRequirements).map(([sectionKey, section]) =>
          renderDocumentSection(sectionKey, section)
        )}
      </div>

      <div className="document-manager-footer">
        <div className="document-summary">
          <h3>Document Summary</h3>
          <div className="summary-stats">
            {Object.entries(documentRequirements).map(([sectionKey, section]) => {
              const sectionFileCount = section.documents.reduce(
                (sum, doc) => sum + (documents[doc.type]?.length || 0), 
                0
              );
              return (
                <div key={sectionKey} className="summary-item">
                  <span className="summary-label">{section.title}:</span>
                  <span className="summary-count">{sectionFileCount} files</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="document-actions">
          <Button
            variant="secondary"
            disabled={disabled}
            onClick={() => {
              // Collapse all sections
              setExpandedSections({});
            }}
          >
            Collapse All
          </Button>
          <Button
            variant="primary"
            disabled={disabled}
            onClick={() => {
              // Expand all sections
              const allExpanded = {};
              Object.keys(documentRequirements).forEach(key => {
                allExpanded[key] = true;
              });
              setExpandedSections(allExpanded);
            }}
          >
            Expand All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;
