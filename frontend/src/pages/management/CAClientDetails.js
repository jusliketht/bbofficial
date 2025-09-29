// =====================================================
// CA CLIENT DETAILS PAGE
// Enterprise-grade client management and details view
// =====================================================

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  FileText,
  Edit,
  Trash2,
  Plus,
  Eye,
  Download,
  Upload,
  Shield,
  Building2,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CAClientDetails = () => {
  const { clientId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddDocument, setShowAddDocument] = useState(false);

  // Fetch client details
  const { data: clientData, isLoading, error } = useQuery({
    queryKey: ['caClient', clientId],
    queryFn: async () => {
      const response = await api.get(`/api/ca/clients/${clientId}`);
      return response.data;
    },
    enabled: !!clientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch client filings
  const { data: filingsData } = useQuery({
    queryKey: ['caClientFilings', clientId],
    queryFn: async () => {
      const response = await api.get(`/api/ca/clients/${clientId}/filings`);
      return response.data;
    },
    enabled: !!clientId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Fetch client documents
  const { data: documentsData } = useQuery({
    queryKey: ['caClientDocuments', clientId],
    queryFn: async () => {
      const response = await api.get(`/api/ca/clients/${clientId}/documents`);
      return response.data;
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const client = clientData?.client;
  const filings = filingsData?.filings || [];
  const documents = documentsData?.documents || [];

  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    if (client) {
      setEditFormData({
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        email: client.email || '',
        mobile: client.mobile || '',
        alternate_mobile: client.alternate_mobile || '',
        date_of_birth: client.date_of_birth || '',
        gender: client.gender || '',
        address_line_1: client.address_line_1 || '',
        address_line_2: client.address_line_2 || '',
        city: client.city || '',
        state: client.state || '',
        pincode: client.pincode || '',
        occupation: client.occupation || '',
        employer_name: client.employer_name || '',
        pan_number: client.pan_number || '',
        aadhaar_number: client.aadhaar_number || '',
        gst_number: client.gst_number || '',
        annual_income_range: client.annual_income_range || '',
        preferred_communication: client.preferred_communication || 'email',
        notes: client.notes || ''
      });
    }
  }, [client]);

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async (updateData) => {
      const response = await api.put(`/api/ca/clients/${clientId}`, updateData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['caClient', clientId]);
      setIsEditing(false);
      toast.success('Client updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update client: ${error.message}`);
    }
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/api/ca/clients/${clientId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['caClients']);
      toast.success('Client deleted successfully!');
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(`Failed to delete client: ${error.message}`);
    }
  });

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    await updateClientMutation.mutateAsync(editFormData);
  };

  const handleDeleteClient = () => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      deleteClientMutation.mutate();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Client Not Found</h2>
          <p className="text-gray-600 mb-4">The client you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'filings', name: 'Filings', icon: FileText },
    { id: 'documents', name: 'Documents', icon: Upload },
    { id: 'communication', name: 'Communication', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {client.first_name} {client.last_name}
                </h1>
                <p className="text-sm text-gray-500">Client ID: {client.client_id}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDeleteClient}
                    disabled={deleteClientMutation.isLoading}
                    className="flex items-center space-x-2 px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateClient}
                    disabled={updateClientMutation.isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{updateClientMutation.isLoading ? 'Saving...' : 'Save'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Client Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
              
              {isEditing ? (
                <form onSubmit={handleUpdateClient} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        value={editFormData.first_name}
                        onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={editFormData.last_name}
                        onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                      <input
                        type="tel"
                        value={editFormData.mobile}
                        onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-500">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Mobile</p>
                        <p className="text-sm text-gray-500">{client.mobile}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Date of Birth</p>
                        <p className="text-sm text-gray-500">
                          {client.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString() : 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Address</p>
                        <p className="text-sm text-gray-500">
                          {client.address_line_1 && client.city && client.state 
                            ? `${client.address_line_1}, ${client.city}, ${client.state} - ${client.pincode}`
                            : 'Not provided'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Occupation</p>
                        <p className="text-sm text-gray-500">{client.occupation || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">PAN Number</p>
                        <p className="text-sm text-gray-500">{client.pan_number}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Filings</p>
                    <p className="text-2xl font-semibold text-gray-900">{filings.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {filings.filter(f => f.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {filings.filter(f => f.status === 'in_progress').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center">
                  <Upload className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Documents</p>
                    <p className="text-2xl font-semibold text-gray-900">{documents.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filings Tab */}
        {activeTab === 'filings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Client Filings</h2>
              <button
                onClick={() => navigate(`/filing/start?client_id=${clientId}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Filing</span>
              </button>
            </div>
            
            {filings.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No filings found</h3>
                <p className="text-gray-500 mb-6">This client hasn't filed any ITR yet.</p>
                <button
                  onClick={() => navigate(`/filing/start?client_id=${clientId}`)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start First Filing
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {filings.length} Filing{filings.length !== 1 ? 's' : ''}
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {filings.map((filing) => (
                    <div key={filing.filing_id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(filing.status)}
                          <div>
                            <h4 className="font-medium text-gray-900">{filing.itr_type}</h4>
                            <p className="text-sm text-gray-500">
                              Assessment Year: {filing.assessment_year}
                            </p>
                            <p className="text-sm text-gray-500">
                              Created: {new Date(filing.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(filing.status)}`}>
                            {filing.status.replace('_', ' ')}
                          </span>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => navigate(`/filing/${filing.filing_id}`)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            {filing.status === 'completed' && filing.acknowledgment_number && (
                              <button
                                onClick={() => navigate(`/filing/${filing.filing_id}/acknowledgment`)}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                                title="Download Acknowledgment"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Client Documents</h2>
              <button
                onClick={() => setShowAddDocument(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Upload Document</span>
              </button>
            </div>
            
            {documents.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Upload className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                <p className="text-gray-500 mb-6">Upload documents for this client.</p>
                <button
                  onClick={() => setShowAddDocument(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload First Document
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {documents.length} Document{documents.length !== 1 ? 's' : ''}
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {documents.map((document) => (
                    <div key={document.document_id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900">{document.document_name}</h4>
                            <p className="text-sm text-gray-500">
                              Type: {document.document_type}
                            </p>
                            <p className="text-sm text-gray-500">
                              Uploaded: {new Date(document.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(document.download_url, '_blank')}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => window.open(document.view_url, '_blank')}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Communication Tab */}
        {activeTab === 'communication' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Communication</h2>
              <button
                onClick={() => navigate(`/messages?client_id=${clientId}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Send Message</span>
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Communication Center</h3>
                <p className="text-gray-500 mb-6">
                  Send messages, schedule calls, and manage communication with this client.
                </p>
                <button
                  onClick={() => navigate(`/messages?client_id=${clientId}`)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open Communication
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CAClientDetails;
