// =====================================================
// DOCUMENT UPLOAD COMPONENT
// =====================================================

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '../Common/Button';
import { Card } from '../Common/Card';
import Tooltip from '../Common/Tooltip';
import { enterpriseLogger } from '../../utils/logger';

const DocumentUpload = ({ 
  documentType = 'general',
  onUpload,
  onRemove,
  uploadedFiles = [],
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  disabled = false,
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  // Document type configurations
  const documentConfigs = {
    pan: {
      title: 'PAN Card',
      description: 'Upload your PAN card image or PDF',
      acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxFiles: 1,
      required: true
    },
    aadhaar: {
      title: 'Aadhaar Card',
      description: 'Upload your Aadhaar card image or PDF',
      acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxFiles: 1,
      required: true
    },
    form16: {
      title: 'Form 16',
      description: 'Upload your Form 16 from employer',
      acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxFiles: 2,
      required: false
    },
    bankStatement: {
      title: 'Bank Statements',
      description: 'Upload bank statements for interest income',
      acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxFiles: 5,
      required: false
    },
    investmentProof: {
      title: 'Investment Proofs',
      description: 'Upload proofs for investments (ELSS, PPF, etc.)',
      acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
      maxFiles: 10,
      required: false
    },
    houseProperty: {
      title: 'House Property Documents',
      description: 'Upload rent receipts, loan statements, etc.',
      acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
      maxFiles: 5,
      required: false
    },
    businessIncome: {
      title: 'Business Income Documents',
      description: 'Upload business receipts, invoices, etc.',
      acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.xlsx', '.xls'],
      maxFiles: 10,
      required: false
    },
    general: {
      title: 'Documents',
      description: 'Upload supporting documents',
      acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
      maxFiles: maxFiles,
      required: false
    }
  };

  const config = documentConfigs[documentType] || documentConfigs.general;
  const currentMaxFiles = config.maxFiles || maxFiles;
  const currentAcceptedTypes = config.acceptedTypes || acceptedTypes;

  const validateFile = (file) => {
    const errors = [];

    // Check file size
    if (file.size > maxFileSize) {
      errors.push(`File size must be less than ${(maxFileSize / (1024 * 1024)).toFixed(1)}MB`);
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!currentAcceptedTypes.includes(fileExtension)) {
      errors.push(`File type ${fileExtension} is not supported. Allowed types: ${currentAcceptedTypes.join(', ')}`);
    }

    // Check if file already exists
    if (uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
      errors.push('File with the same name and size already exists');
    }

    // Check max files limit
    if (uploadedFiles.length >= currentMaxFiles) {
      errors.push(`Maximum ${currentMaxFiles} files allowed`);
    }

    return errors;
  };

  const handleFileSelect = useCallback(async (files) => {
    if (disabled) return;

    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    // Validate each file
    fileArray.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push(file);
      } else {
        errors.push(...fileErrors.map(error => `${file.name}: ${error}`));
      }
    });

    if (errors.length > 0) {
      enterpriseLogger.warn('File validation failed', { errors });
      // You might want to show these errors to the user
      return;
    }

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      // Upload files one by one
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', documentType);
        formData.append('fileName', file.name);

        // Simulate upload progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        // Here you would call your actual upload API
        // const response = await uploadFile(formData, (progress) => {
        //   setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        // });

        // For now, simulate successful upload
        setTimeout(() => {
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          
          const uploadedFile = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            documentType: documentType,
            uploadedAt: new Date().toISOString(),
            url: URL.createObjectURL(file) // Temporary URL for preview
          };

          onUpload && onUpload(uploadedFile);
          enterpriseLogger.info('File uploaded successfully', { fileName: file.name, documentType });
        }, 1000);
      }
    } catch (error) {
      enterpriseLogger.error('File upload failed', { error: error.message });
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [documentType, uploadedFiles, maxFileSize, currentAcceptedTypes, currentMaxFiles, disabled, onUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [disabled, handleFileSelect]);

  const handleFileInputChange = useCallback((e) => {
    const files = e.target.files;
    handleFileSelect(files);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  const handleRemoveFile = useCallback((fileId) => {
    onRemove && onRemove(fileId);
    enterpriseLogger.info('File removed', { fileId });
  }, [onRemove]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    return '📁';
  };

  return (
    <div className={`document-upload ${className}`}>
      <Card className="upload-card">
        <div className="upload-header">
          <h3>
            {config.title}
            {config.required && <span className="required">*</span>}
            <Tooltip content={config.description}>
              <span className="help-icon">?</span>
            </Tooltip>
          </h3>
          <p className="upload-description">{config.description}</p>
        </div>

        <div
          className={`upload-area ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={currentMaxFiles > 1}
            accept={currentAcceptedTypes.join(',')}
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
            disabled={disabled}
          />

          <div className="upload-content">
            <div className="upload-icon">📁</div>
            <h4>Drop files here or click to browse</h4>
            <p className="upload-hint">
              Supported formats: {currentAcceptedTypes.join(', ')}
            </p>
            <p className="upload-hint">
              Max file size: {(maxFileSize / (1024 * 1024)).toFixed(1)}MB
            </p>
            <p className="upload-hint">
              Max files: {currentMaxFiles}
            </p>
          </div>
        </div>

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="upload-progress">
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="progress-item">
                <div className="progress-info">
                  <span className="file-name">{fileName}</span>
                  <span className="progress-percentage">{progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="uploaded-files">
            <h4>Uploaded Files ({uploadedFiles.length}/{currentMaxFiles})</h4>
            <div className="files-list">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <span className="file-icon">{getFileIcon(file.type)}</span>
                    <div className="file-details">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                      <span className="file-date">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => window.open(file.url, '_blank')}
                      disabled={disabled}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => handleRemoveFile(file.id)}
                      disabled={disabled}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="upload-actions">
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading || uploadedFiles.length >= currentMaxFiles}
            loading={uploading}
          >
            {uploading ? 'Uploading...' : 'Choose Files'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DocumentUpload;
