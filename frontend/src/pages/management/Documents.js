import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Upload, FileText, Trash2, Eye, Download, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import DocumentPreview from '../../components/business/DocumentPreview';
import { 
  EnterpriseCard,
  EnterpriseButton,
  EnterpriseBadge,
  EnterpriseStatCard
} from '../../components/DesignSystem/EnterpriseComponents';

const Documents = () => {
  const { filingId } = useParams();
  const [dragActive, setDragActive] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);

  // Fetch documents for this filing
  const { data: documentsData, refetch } = useQuery(
    ['documents', filingId],
    () => api.get(`/api/upload/documents/${filingId}`).then(res => res.data.data),
    {
      enabled: !!filingId,
      onError: (error) => {
        toast.error('Failed to load documents');
        console.error('Documents fetch error:', error);
      }
    }
  );

  const documents = documentsData || [];

  // Upload document mutation
  const uploadMutation = useMutation(
    async (formData) => {
      const response = await api.post('/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Document uploaded successfully!');
        refetch();
        if (data.data.extracted_data) {
          toast.success('Document processed and data extracted!');
        }
      },
      onError: (error) => {
        toast.error('Failed to upload document');
        console.error('Upload error:', error);
      }
    }
  );

  // Removed unused processMutation

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Document types configuration (used in UI)
  // const documentTypes = [...]; // Removed unused variable

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filingId', filingId);
    formData.append('documentType', 'form16'); // Default document type

    uploadMutation.mutate(formData);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Removed unused functions: handleProcessDocument, getDocumentIcon, getStatusIcon, getStatusText


  const deleteDocumentMutation = useMutation(
    (id) => api.delete(`/api/upload/documents/${id}`),
    {
      onSuccess: () => {
        toast.success('Document deleted successfully');
        refetch(); // Refresh the documents list
      },
      onError: (error) => {
        toast.error('Failed to delete document');
        console.error('Delete error:', error);
      }
    }
  );

  const deleteDocument = (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteDocumentMutation.mutate(id);
    }
  };

  const handleDownload = (document) => {
    // Here you would typically call an API to download the document
    console.log('Downloading document:', document);
    toast.success('Download started');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document Management
          </h1>
          <p className="text-lg text-gray-600">
            Upload and manage your tax-related documents
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Upload className="w-6 h-6 mr-2 text-blue-600" />
                Upload Documents
              </h2>

              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop files here or click to upload
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  PDF, JPG, PNG up to 10MB each
                </p>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Choose Files
                </label>
              </div>

              {/* Document Types */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Required Documents</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-green-500" />
                    Form 16 (Salary Certificate)
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-green-500" />
                    Bank Statements
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-yellow-500" />
                    Investment Proofs (80C, 80D)
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-yellow-500" />
                    Property Documents
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-yellow-500" />
                    Business Income Documents
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-green-600" />
                Your Documents ({documents.length})
              </h2>

              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No documents uploaded yet</p>
                  <p className="text-sm text-gray-400">Upload your first document to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{doc.name}</h3>
                          <p className="text-sm text-gray-600">{doc.type} • {doc.size}</p>
                          <p className="text-xs text-gray-500">Uploaded on {doc.uploadedAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setPreviewDocument(doc)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors touch-target"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors touch-target"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors touch-target"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Guidelines */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Accepted Formats</h3>
              <ul className="space-y-1">
                <li>• PDF files (recommended)</li>
                <li>• JPG/JPEG images</li>
                <li>• PNG images</li>
                <li>• Maximum file size: 10MB</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Best Practices</h3>
              <ul className="space-y-1">
                <li>• Ensure documents are clear and readable</li>
                <li>• Upload complete documents</li>
                <li>• Keep file names descriptive</li>
                <li>• Verify document authenticity</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Document Preview Modal */}
        {previewDocument && (
          <DocumentPreview
            document={previewDocument}
            onClose={() => setPreviewDocument(null)}
            onDownload={handleDownload}
          />
        )}
      </div>
    </div>
  );
};

export default Documents;

