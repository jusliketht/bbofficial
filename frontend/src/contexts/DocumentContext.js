// =====================================================
// DOCUMENT CONTEXT (STATE MANAGEMENT)
// =====================================================

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { enterpriseLogger } from '../utils/logger';

const DocumentContext = createContext();

// Action types
const DOCUMENT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_DOCUMENTS: 'SET_DOCUMENTS',
  ADD_DOCUMENT: 'ADD_DOCUMENT',
  UPDATE_DOCUMENT: 'UPDATE_DOCUMENT',
  REMOVE_DOCUMENT: 'REMOVE_DOCUMENT',
  SET_ERROR: 'SET_ERROR',
  SET_STATS: 'SET_STATS',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_UPLOADING: 'SET_UPLOADING',
  SET_UPLOAD_PROGRESS: 'SET_UPLOAD_PROGRESS',
  SET_UPLOAD_RESULTS: 'SET_UPLOAD_RESULTS'
};

// Initial state
const initialState = {
  documents: [],
  stats: null,
  categories: [],
  loading: false,
  uploading: false,
  uploadProgress: 0,
  uploadResults: [],
  error: null,
  selectedCategory: 'ALL',
  selectedFiling: null,
  selectedMember: null
};

// Reducer
const documentReducer = (state, action) => {
  switch (action.type) {
    case DOCUMENT_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null
      };

    case DOCUMENT_ACTIONS.SET_DOCUMENTS:
      return {
        ...state,
        documents: action.payload,
        loading: false,
        error: null
      };

    case DOCUMENT_ACTIONS.ADD_DOCUMENT:
      return {
        ...state,
        documents: [action.payload, ...state.documents],
        error: null
      };

    case DOCUMENT_ACTIONS.UPDATE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id ? { ...doc, ...action.payload } : doc
        ),
        error: null
      };

    case DOCUMENT_ACTIONS.REMOVE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload),
        error: null
      };

    case DOCUMENT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        uploading: false
      };

    case DOCUMENT_ACTIONS.SET_STATS:
      return {
        ...state,
        stats: action.payload
      };

    case DOCUMENT_ACTIONS.SET_CATEGORIES:
      return {
        ...state,
        categories: action.payload
      };

    case DOCUMENT_ACTIONS.SET_UPLOADING:
      return {
        ...state,
        uploading: action.payload,
        error: null
      };

    case DOCUMENT_ACTIONS.SET_UPLOAD_PROGRESS:
      return {
        ...state,
        uploadProgress: action.payload
      };

    case DOCUMENT_ACTIONS.SET_UPLOAD_RESULTS:
      return {
        ...state,
        uploadResults: action.payload,
        uploading: false,
        uploadProgress: 0
      };

    default:
      return state;
  }
};

// Provider component
export const DocumentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(documentReducer, initialState);

  // Load documents
  const loadDocuments = async (filters = {}) => {
    try {
      dispatch({ type: DOCUMENT_ACTIONS.SET_LOADING, payload: true });

      const params = new URLSearchParams();
      if (filters.filingId) params.append('filingId', filters.filingId);
      if (filters.memberId) params.append('memberId', filters.memberId);
      if (filters.category) params.append('category', filters.category);
      if (filters.verificationStatus) params.append('verificationStatus', filters.verificationStatus);

      const response = await fetch(`/api/documents?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load documents');
      }

      const data = await response.json();
      dispatch({ type: DOCUMENT_ACTIONS.SET_DOCUMENTS, payload: data.data.documents });

      enterpriseLogger.info('Documents loaded via context', {
        count: data.data.documents.length,
        filters
      });

    } catch (error) {
      enterpriseLogger.error('Failed to load documents via context', { error: error.message });
      dispatch({ type: DOCUMENT_ACTIONS.SET_ERROR, payload: error.message });
    }
  };

  // Load document statistics
  const loadStats = async () => {
    try {
      const response = await fetch('/api/documents/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load stats');
      }

      const data = await response.json();
      dispatch({ type: DOCUMENT_ACTIONS.SET_STATS, payload: data.data });

    } catch (error) {
      enterpriseLogger.error('Failed to load document stats via context', { error: error.message });
    }
  };

  // Load document categories
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/documents/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load categories');
      }

      const data = await response.json();
      dispatch({ type: DOCUMENT_ACTIONS.SET_CATEGORIES, payload: data.data });

    } catch (error) {
      enterpriseLogger.error('Failed to load document categories via context', { error: error.message });
    }
  };

  // Upload file
  const uploadFile = async (file, category, filingId = null, memberId = null) => {
    try {
      dispatch({ type: DOCUMENT_ACTIONS.SET_UPLOADING, payload: true });
      dispatch({ type: DOCUMENT_ACTIONS.SET_UPLOAD_PROGRESS, payload: 0 });

      // Step 1: Get presigned URL
      const presignResponse = await fetch('/api/documents/presign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          sizeBytes: file.size,
          category,
          filingId,
          memberId
        })
      });

      if (!presignResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const presignData = await presignResponse.json();
      dispatch({ type: DOCUMENT_ACTIONS.SET_UPLOAD_PROGRESS, payload: 25 });

      // Step 2: Upload file
      const uploadResponse = await fetch(presignData.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
          ...presignData.data.fields
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      dispatch({ type: DOCUMENT_ACTIONS.SET_UPLOAD_PROGRESS, payload: 75 });

      // Step 3: Complete upload
      const completeResponse = await fetch('/api/documents/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          s3Key: presignData.data.s3Key,
          localPath: presignData.data.localPath,
          fileName: file.name,
          fileType: file.type,
          sizeBytes: file.size,
          category,
          filingId,
          memberId
        })
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to complete upload');
      }

      const completeData = await completeResponse.json();
      dispatch({ type: DOCUMENT_ACTIONS.SET_UPLOAD_PROGRESS, payload: 100 });

      // Add document to state
      dispatch({ type: DOCUMENT_ACTIONS.ADD_DOCUMENT, payload: completeData.data });

      // Update stats
      await loadStats();

      enterpriseLogger.info('File uploaded via context', {
        documentId: completeData.data.id,
        filename: file.name,
        category
      });

      return completeData.data;

    } catch (error) {
      enterpriseLogger.error('Failed to upload file via context', { error: error.message });
      dispatch({ type: DOCUMENT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Upload multiple files
  const uploadFiles = async (files, category, filingId = null, memberId = null) => {
    const results = [];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await uploadFile(files[i], category, filingId, memberId);
        results.push({ file: files[i], result, success: true });
      } catch (error) {
        results.push({ file: files[i], error: error.message, success: false });
      }
    }

    dispatch({ type: DOCUMENT_ACTIONS.SET_UPLOAD_RESULTS, payload: results });
    return results;
  };

  // Delete document
  const deleteDocument = async (documentId) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      // Remove from state
      dispatch({ type: DOCUMENT_ACTIONS.REMOVE_DOCUMENT, payload: documentId });

      // Update stats
      await loadStats();

      enterpriseLogger.info('Document deleted via context', { documentId });

    } catch (error) {
      enterpriseLogger.error('Failed to delete document via context', { error: error.message });
      dispatch({ type: DOCUMENT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Download document
  const downloadDocument = async (documentId) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const data = await response.json();
      
      // Open download URL in new tab
      window.open(data.data.downloadUrl, '_blank');

      enterpriseLogger.info('Document download initiated via context', { documentId });

    } catch (error) {
      enterpriseLogger.error('Failed to download document via context', { error: error.message });
      dispatch({ type: DOCUMENT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Filter documents by category
  const filterByCategory = (category) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category });
  };

  // Clear upload results
  const clearUploadResults = () => {
    dispatch({ type: DOCUMENT_ACTIONS.SET_UPLOAD_RESULTS, payload: [] });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: DOCUMENT_ACTIONS.SET_ERROR, payload: null });
  };

  // Get filtered documents
  const getFilteredDocuments = () => {
    if (state.selectedCategory === 'ALL') {
      return state.documents;
    }
    return state.documents.filter(doc => doc.category === state.selectedCategory);
  };

  // Get documents by filing
  const getDocumentsByFiling = (filingId) => {
    return state.documents.filter(doc => doc.filingId === filingId);
  };

  // Get documents by member
  const getDocumentsByMember = (memberId) => {
    return state.documents.filter(doc => doc.memberId === memberId);
  };

  // Get documents by category
  const getDocumentsByCategory = (category) => {
    return state.documents.filter(doc => doc.category === category);
  };

  // Get document by ID
  const getDocumentById = (documentId) => {
    return state.documents.find(doc => doc.id === documentId);
  };

  // Check if user has documents in category
  const hasDocumentsInCategory = (category) => {
    return state.documents.some(doc => doc.category === category);
  };

  // Get storage usage percentage
  const getStorageUsagePercentage = () => {
    if (!state.stats) return 0;
    return state.stats.storageUsedPercentage;
  };

  // Check if storage quota is exceeded
  const isStorageQuotaExceeded = () => {
    if (!state.stats) return false;
    return state.stats.storageUsedPercentage >= 90;
  };

  // Get upload progress
  const getUploadProgress = () => {
    return state.uploadProgress;
  };

  // Check if uploading
  const isUploading = () => {
    return state.uploading;
  };

  // Get upload results
  const getUploadResults = () => {
    return state.uploadResults;
  };

  // Get successful uploads
  const getSuccessfulUploads = () => {
    return state.uploadResults.filter(result => result.success);
  };

  // Get failed uploads
  const getFailedUploads = () => {
    return state.uploadResults.filter(result => !result.success);
  };

  const value = {
    // State
    ...state,
    
    // Actions
    loadDocuments,
    loadStats,
    loadCategories,
    uploadFile,
    uploadFiles,
    deleteDocument,
    downloadDocument,
    filterByCategory,
    clearUploadResults,
    clearError,
    
    // Getters
    getFilteredDocuments,
    getDocumentsByFiling,
    getDocumentsByMember,
    getDocumentsByCategory,
    getDocumentById,
    hasDocumentsInCategory,
    getStorageUsagePercentage,
    isStorageQuotaExceeded,
    getUploadProgress,
    isUploading,
    getUploadResults,
    getSuccessfulUploads,
    getFailedUploads
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

// Hook to use document context
export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  
  if (!context) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  
  return context;
};

export default DocumentContext;
