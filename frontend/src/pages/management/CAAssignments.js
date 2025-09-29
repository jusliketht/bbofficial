// =====================================================
// CA ASSIGNMENTS PAGE
// Enterprise-grade assignment management for CAs
// =====================================================

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Edit,
  MessageSquare,
  Calendar,
  Filter,
  Search,
  Plus,
  ArrowRight,
  User,
  Building2,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CAAssignments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState('active');

  // Fetch CA assignments
  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ['caAssignments', searchTerm, statusFilter, priorityFilter],
    queryFn: async () => {
      const response = await api.get(`/api/ca/assignments?search=${searchTerm}&status=${statusFilter}&priority=${priorityFilter}`);
      return response.data;
    },
    enabled: !!user?.user_id,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000 // 30 seconds
  });

  // Fetch assignment statistics
  const { data: statsData } = useQuery({
    queryKey: ['caAssignmentStats'],
    queryFn: async () => {
      const response = await api.get('/api/ca/assignments/stats');
      return response.data;
    },
    enabled: !!user?.user_id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const assignments = assignmentsData?.assignments || [];
  const stats = statsData?.stats || {};

  // Update assignment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ assignmentId, status, notes }) => {
      const response = await api.put(`/api/ca/assignments/${assignmentId}/status`, {
        status,
        notes
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['caAssignments']);
      queryClient.invalidateQueries(['caAssignmentStats']);
      toast.success('Assignment status updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update assignment: ${error.message}`);
    }
  });

  const handleStatusUpdate = (assignmentId, newStatus) => {
    updateStatusMutation.mutate({ assignmentId, status: newStatus });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
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
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'active', name: 'Active Assignments', count: stats.active || 0 },
    { id: 'pending', name: 'Pending', count: stats.pending || 0 },
    { id: 'completed', name: 'Completed', count: stats.completed || 0 },
    { id: 'overdue', name: 'Overdue', count: stats.overdue || 0 }
  ];

  const filteredAssignments = assignments.filter(assignment => {
    if (selectedTab === 'active') {
      return ['pending', 'in_progress'].includes(assignment.status);
    }
    return assignment.status === selectedTab;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
            <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
            >
                ← Back to Dashboard
            </button>
              <h1 className="text-xl font-semibold text-gray-900">My Assignments</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                CA: {user?.name}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.active || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completed || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.overdue || 0}</p>
              </div>
          </div>
        </div>
      </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Priority Filter */}
              <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              </select>
          </div>
            </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
            </div>
          </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'You don\'t have any assignments yet'
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {filteredAssignments.length} Assignment{filteredAssignments.length !== 1 ? 's' : ''}
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => (
                <div key={assignment.assignment_id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {getStatusIcon(assignment.status)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(assignment.status)}`}>
                            {assignment.status.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(assignment.priority)}`}>
                            {assignment.priority} priority
                          </span>
        </div>

                        <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{assignment.client_name}</span>
          </div>

                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
            </div>
                          
                          <div className="flex items-center space-x-1">
                            <Building2 className="h-4 w-4" />
                            <span>{assignment.client_type}</span>
            </div>
                            </div>
                        
                        {assignment.notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{assignment.notes}</p>
                            </div>
                        )}
                            </div>
                          </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/ca/clients/${assignment.client_id}`)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Client"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => navigate(`/messages?assignment_id=${assignment.assignment_id}`)}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                        title="Send Message"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                      
                            {assignment.status === 'pending' && (
                              <button
                          onClick={() => handleStatusUpdate(assignment.assignment_id, 'in_progress')}
                          className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Start Assignment"
                              >
                          <ArrowRight className="h-4 w-4" />
                              </button>
                            )}
                      
                      {assignment.status === 'in_progress' && (
                              <button
                                onClick={() => handleStatusUpdate(assignment.assignment_id, 'completed')}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          title="Mark Complete"
                        >
                          <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Completion Rate</h3>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.completion_rate || 0}%
            </div>
            <p className="text-sm text-gray-500">
              {stats.completed || 0} of {stats.total || 0} assignments completed
            </p>
              </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Average Time</h3>
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stats.average_completion_time || 0} days
                    </div>
            <p className="text-sm text-gray-500">
              Average time to complete assignments
                        </p>
                      </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Impact</h3>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              ₹{stats.revenue_impact || 0}
            </div>
            <p className="text-sm text-gray-500">
              Revenue generated from completed assignments
            </p>
                      </div>
        </div>
      </div>
    </div>
  );
};

export default CAAssignments;
