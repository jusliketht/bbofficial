// Justification: Delegation Manager Frontend Component - Comprehensive delegation interface
// Provides complete delegation management interface for CA and Admin users
// Implements role-based delegation with journey completion capabilities
// Essential for enabling professional assistance workflows with proper UX
// Follows ultra-deep design principles with psychology-driven user experience

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  ArrowRightLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Shield,
  Eye,
  UserCheck,
  MessageSquare,
  Calendar,
  Filter,
  Search,
  Plus,
  MoreVertical,
  Download,
  Upload,
  Send
} from 'lucide-react';

const DelegationManager = () => {
  const [selectedTab, setSelectedTab] = useState('requests');
  const [selectedDelegation, setSelectedDelegation] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: ''
  });

  const queryClient = useQueryClient();

  // Fetch user delegations
  const { data: delegations, isLoading } = useQuery({
    queryKey: ['delegations'],
    queryFn: async () => {
      const response = await fetch('/delegation/user-delegations', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    }
  });

  // Create delegation request mutation
  const createDelegationMutation = useMutation({
    mutationFn: async (delegationData) => {
      const response = await fetch('/delegation/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(delegationData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['delegations']);
      setShowCreateModal(false);
    }
  });

  // Approve/reject delegation mutation
  const updateDelegationMutation = useMutation({
    mutationFn: async ({ delegationId, status, reason }) => {
      const response = await fetch(`/api/delegation/request/${delegationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, reason })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['delegations']);
    }
  });

  // Complete delegation mutation
  const completeDelegationMutation = useMutation({
    mutationFn: async ({ delegationId, completionData }) => {
      const response = await fetch(`/api/delegation/complete/${delegationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(completionData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['delegations']);
    }
  });

  const filteredDelegations = delegations?.data?.filter(delegation => {
    if (filters.status !== 'all' && delegation.status !== filters.status) return false;
    if (filters.type !== 'all' && delegation.delegation_type !== filters.type) return false;
    if (filters.search && !delegation.delegatee_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  }) || [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  return (
    <div className="delegation-manager bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Delegation Management</h1>
              <p className="text-gray-600 mt-1">Manage journey completion assistance and professional support</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Delegation
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'requests', label: 'Delegation Requests', count: filteredDelegations.length },
                { id: 'active', label: 'Active Delegations', count: filteredDelegations.filter(d => d.status === 'approved').length },
                { id: 'completed', label: 'Completed', count: filteredDelegations.filter(d => d.status === 'completed').length },
                { id: 'history', label: 'History', count: filteredDelegations.filter(d => ['completed', 'cancelled'].includes(d.status)).length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="full_completion">Full Completion</option>
                <option value="partial_assistance">Partial Assistance</option>
                <option value="review_only">Review Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: 'all', type: 'all', search: '' })}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Delegations List */}
        <div className="bg-white rounded-lg shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading delegations...</p>
            </div>
          ) : filteredDelegations.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No delegations found</h3>
              <p className="text-gray-600">Create your first delegation request to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredDelegations.map(delegation => (
                <div key={delegation.delegation_id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(delegation.status)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {delegation.delegation_type.replace('_', ' ').toUpperCase()}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delegation.status)}`}>
                            {delegation.status}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">{delegation.delegator_name}</span> → <span className="font-medium">{delegation.delegatee_name}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          Journey: {delegation.journey_type} • Created: {new Date(delegation.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedDelegation(delegation)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {delegation.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateDelegationMutation.mutate({
                              delegationId: delegation.delegation_id,
                              status: 'approved',
                              reason: 'Approved by user'
                            })}
                            className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateDelegationMutation.mutate({
                              delegationId: delegation.delegation_id,
                              status: 'rejected',
                              reason: 'Rejected by user'
                            })}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Delegation Modal */}
      {showCreateModal && (
        <CreateDelegationModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={createDelegationMutation.mutate}
          isLoading={createDelegationMutation.isPending}
        />
      )}

      {/* Delegation Details Modal */}
      {selectedDelegation && (
        <DelegationDetailsModal
          delegation={selectedDelegation}
          onClose={() => setSelectedDelegation(null)}
          onComplete={completeDelegationMutation.mutate}
          isLoading={completeDelegationMutation.isPending}
        />
      )}
    </div>
  );
};

// Create Delegation Modal Component
const CreateDelegationModal = ({ onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    delegateeId: '',
    journeyId: '',
    delegationType: 'full_completion',
    delegationReason: '',
    consentRequired: true
  });

  const [users, setUsers] = useState([]);
  const [journeys, setJourneys] = useState([]);

  useEffect(() => {
    // Fetch users and journeys for selection
    fetchUsersAndJourneys();
  }, []);

  const fetchUsersAndJourneys = async () => {
    try {
      const [usersResponse, journeysResponse] = await Promise.all([
        fetch('/users', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/journeys', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      
      const usersData = await usersResponse.json();
      const journeysData = await journeysResponse.json();
      
      setUsers(usersData.data || []);
      setJourneys(journeysData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Delegation Request</h2>
          <p className="text-gray-600 mt-1">Request to complete a journey on behalf of another user</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delegate To User
            </label>
            <select
              value={formData.delegateeId}
              onChange={(e) => setFormData({ ...formData, delegateeId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a user...</option>
              {users.map(user => (
                <option key={user.user_id} value={user.user_id}>
                  {user.username} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Journey
            </label>
            <select
              value={formData.journeyId}
              onChange={(e) => setFormData({ ...formData, journeyId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a journey...</option>
              {journeys.map(journey => (
                <option key={journey.journey_id} value={journey.journey_id}>
                  {journey.journey_type} - {journey.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delegation Type
            </label>
            <select
              value={formData.delegationType}
              onChange={(e) => setFormData({ ...formData, delegationType: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="full_completion">Full Completion</option>
              <option value="partial_assistance">Partial Assistance</option>
              <option value="review_only">Review Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Delegation
            </label>
            <textarea
              value={formData.delegationReason}
              onChange={(e) => setFormData({ ...formData, delegationReason: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Explain why this delegation is needed..."
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="consentRequired"
              checked={formData.consentRequired}
              onChange={(e) => setFormData({ ...formData, consentRequired: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="consentRequired" className="ml-2 block text-sm text-gray-700">
              Require explicit consent from delegatee
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              Create Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delegation Details Modal Component
const DelegationDetailsModal = ({ delegation, onClose, onComplete, isLoading }) => {
  const [completionData, setCompletionData] = useState({
    finalFormData: {},
    documents: [],
    submissionStatus: 'completed',
    completionNotes: ''
  });

  const handleComplete = () => {
    onComplete({
      delegationId: delegation.delegation_id,
      completionData
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Delegation Details</h2>
              <p className="text-gray-600 mt-1">Journey completion assistance</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Delegation Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Delegation Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-medium">{delegation.delegation_type}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 font-medium">{delegation.status}</span>
              </div>
              <div>
                <span className="text-gray-600">Delegator:</span>
                <span className="ml-2 font-medium">{delegation.delegator_name}</span>
              </div>
              <div>
                <span className="text-gray-600">Delegatee:</span>
                <span className="ml-2 font-medium">{delegation.delegatee_name}</span>
              </div>
              <div>
                <span className="text-gray-600">Journey:</span>
                <span className="ml-2 font-medium">{delegation.journey_type}</span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 font-medium">{new Date(delegation.created_at).toLocaleString()}</span>
              </div>
            </div>
            {delegation.delegation_reason && (
              <div className="mt-3">
                <span className="text-gray-600">Reason:</span>
                <p className="mt-1 text-sm text-gray-800">{delegation.delegation_reason}</p>
              </div>
            )}
          </div>

          {/* Completion Form */}
          {delegation.status === 'approved' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Complete Journey</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Notes
                </label>
                <textarea
                  value={completionData.completionNotes}
                  onChange={(e) => setCompletionData({ ...completionData, completionNotes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Add notes about the completion..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Status
                </label>
                <select
                  value={completionData.submissionStatus}
                  onChange={(e) => setCompletionData({ ...completionData, submissionStatus: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="completed">Completed</option>
                  <option value="submitted">Submitted</option>
                  <option value="pending_review">Pending Review</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Complete Journey
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DelegationManager;
