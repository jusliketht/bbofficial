// =====================================================
// BROKER FILE UPLOAD COMPONENT
// Handles file uploads and API fetching for brokers
// =====================================================

import React, { useState } from 'react';
import Button from '../UI/Button';
import { Upload, Download } from 'lucide-react';
import '../../styles/itr-forms.css';

const BrokerFileUpload = ({ broker, onFileUpload, onAPIFetch, disabled }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    try {
      setIsUploading(true);
      await onFileUpload(file);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAPIFetch = async () => {
    try {
      setIsUploading(true);
      await onAPIFetch();
    } catch (error) {
      console.error('API fetch failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="broker-file-upload">
      <div className="upload-actions">
        <label className="upload-button">
          <input
            type="file"
            accept=".xls,.xlsx,.csv"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            style={{ display: 'none' }}
          />
          <Button
            variant="secondary"
            size="sm"
            disabled={disabled || isUploading}
            as="span"
          >
            <Upload className="w-4 h-4" />
            Upload File
          </Button>
        </label>

        {broker.apiAvailable && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleAPIFetch}
            disabled={disabled || isUploading}
          >
            <Download className="w-4 h-4" />
            Fetch via API
          </Button>
        )}
      </div>

      {isUploading && (
        <div className="upload-progress">
          Processing...
        </div>
      )}
    </div>
  );
};

export default BrokerFileUpload;

