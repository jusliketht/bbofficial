// =====================================================
// MOBILE-FIRST FILING HISTORY PAGE
// Touch-friendly, responsive design for all devices
// =====================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Download, 
  Eye, 
  Calendar, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import api from '../../services/api';

const FilingHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch filings data using React Query
  const { data: filingsData, isLoading, error } = useQuery({
    queryKey: ['userFilings', user?.user_id],
    queryFn: async () => {
      const response = await api.get('/dashboard/user-filings');
      return response.data;
    },
    enabled: !!user?.user_id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const filings = filingsData?.filings || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'processing':
        return <Clock className="h-3 w-3" />;
      case 'rejected':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const filteredFilings = filings.filter(filing => {
    const matchesSearch = filing.assessment_year?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         filing.ack_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         filing.itr_form?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || filing.status === filterStatus;
    const matchesYear = selectedYear === 'all' || filing.assessment_year === selectedYear;
    
    return matchesSearch && matchesStatus && matchesYear;
  });

  const assessmentYears = ['all', '2023-24', '2022-23', '2021-22', '2020-21'];
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'processing', label: 'Processing' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'draft', label: 'Draft' }
  ];

  // Mobile-optimized filing card
  const FilingCard = ({ filing }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="font-semibold text-gray-900">{filing.itr_form || filing.itr_type}</span>
            <span className="text-sm text-gray-500">{filing.assessment_year}</span>
          </div>
          <p className="text-xs text-gray-500 font-mono">{filing.ack_number || 'Pending'}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full font-medium flex items-center space-x-1 ${getStatusColor(filing.status)}`}>
          {getStatusIcon(filing.status)}
          <span className="capitalize">{filing.status}</span>
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-500 mb-1">Status</p>
          <p className="text-sm font-semibold text-gray-900 capitalize">{filing.status}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-500 mb-1">Created</p>
          <p className="text-sm font-semibold text-gray-900">
            {filing.created_at ? new Date(filing.created_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>{filing.updated_at ? new Date(filing.updated_at).toLocaleDateString() : 'N/A'}</span>
        </div>
        <span>Self</span>
      </div>
      
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(`/filing/${filing.id}`)}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 active:scale-95 transition-transform"
        >
          <Eye className="h-3 w-3" />
          <span className="text-xs font-medium">View Details</span>
        </button>
        <button className="flex items-center space-x-1 text-green-600 hover:text-green-800 active:scale-95 transition-transform">
          <Download className="h-3 w-3" />
          <span className="text-xs font-medium">Download</span>
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Loading filing history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-transform"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Filing History</h1>
                <p className="text-xs text-gray-500">{filings.length} filings</p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/filing/start')}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 active:scale-95 transition-transform"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 space-y-4">
        {/* Quick Stats - Mobile Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-lg font-bold text-gray-900">
                  {filings.filter(f => f.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-xs text-gray-500">Processing</p>
                <p className="text-lg font-bold text-gray-900">
                  {filings.filter(f => f.status === 'processing').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search filings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 active:scale-95 transition-transform"
          >
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filters</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Collapsible Filters */}
          {showFilters && (
            <div className="mt-3 space-y-3 pt-3 border-t border-gray-200">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {assessmentYears.map(year => (
                    <option key={year} value={year}>
                      {year === 'all' ? 'All Years' : year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Filings List */}
        <div>
          {filteredFilings.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No filings found</h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm || filterStatus !== 'all' || selectedYear !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'You haven\'t filed any ITR returns yet'
                }
              </p>
              <button
                onClick={() => navigate('/filing/start')}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 active:scale-95 transition-transform font-medium"
              >
                <Plus className="h-4 w-4 mr-2 inline" />
                Start New Filing
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFilings.map((filing) => (
                <FilingCard key={filing.id} filing={filing} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden">
        <div className="flex justify-around">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600"
          >
            <FileText className="h-5 w-5 mb-1" />
            <span className="text-xs">Dashboard</span>
          </button>
          <button className="flex flex-col items-center p-2 text-blue-600">
            <CheckCircle className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">History</span>
          </button>
          <button 
            onClick={() => navigate('/filing/start')}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600"
          >
            <Plus className="h-5 w-5 mb-1" />
            <span className="text-xs">New Filing</span>
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-600"
          >
            <Eye className="h-5 w-5 mb-1" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </nav>

      {/* Bottom padding for mobile navigation */}
      <div className="h-20 md:hidden"></div>
    </div>
  );
};

export default FilingHistory;