// =====================================================
// ITR FILING PLATFORM - ENHANCED FILING LIST COMPONENT
// Phase 2: Frontend State Management - Enterprise Implementation
// Advanced listing component with enterprise-grade features
// =====================================================

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFilingList, useFilingStatistics, useBulkUpdateFilings } from '../../hooks';
import { Card, Button, Input, Select, Modal } from '../../components/UI';
import { toast } from 'react-hot-toast';
import { useRenderDebug, useDebouncedSetter, useStableCallback } from '../../utils/infiniteRenderPrevention';

// =====================================================
// FILING LIST COMPONENT
// =====================================================

const ITRFilingList = () => {
  // ✅ Add render debugging
  const debugInfo = useRenderDebug('ITRFilingList', {});
  
  const {
    filings,
    totalCount,
    currentPage,
    totalPages,
    filters,
    isLoading,
    error,
    selectedFiling,
    setFilters,
    setSelectedFiling,
  } = useFilingList();

  const {
    statistics,
  } = useFilingStatistics();

  const {
    bulkUpdateFilings,
    isLoading: bulkUpdateLoading,
  } = useBulkUpdateFilings();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilings, setSelectedFilings] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // ✅ Use debounced setter to prevent excessive API calls
  const debouncedSetFilters = useDebouncedSetter(
    useStableCallback((filters) => setFilters(filters), [setFilters]),
    500
  );

  // ✅ Optimized debounced search
  useEffect(() => {
    if (searchTerm !== filters.search) {
      debouncedSetFilters({ search: searchTerm, page: 1 });
    }
  }, [searchTerm, filters.search]); // Remove debouncedSetFilters dependency to prevent infinite loop

  // Handle filing selection
  const handleFilingSelect = useCallback((filing) => {
    setSelectedFiling(filing);
  }, [setSelectedFiling]);

  // Handle bulk selection
  const handleBulkSelect = useCallback((filingId, checked) => {
    setSelectedFilings(prev => 
      checked 
        ? [...prev, filingId]
        : prev.filter(id => id !== filingId)
    );
  }, []);

  // Handle select all
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedFilings(filings.map(filing => filing.id));
    } else {
      setSelectedFilings([]);
    }
  }, [filings]);

  // Handle bulk actions
  const handleBulkAction = useCallback(async (action) => {
    if (selectedFilings.length === 0) {
      toast.error('Please select filings to perform bulk action');
      return;
    }

    try {
      await bulkUpdateFilings(selectedFilings, { status: action });
      toast.success(`Successfully updated ${selectedFilings.length} filings`);
      setSelectedFilings([]);
    } catch (error) {
      toast.error('Failed to update filings');
    }
  }, [selectedFilings, bulkUpdateFilings]);

  // Filter options
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'acknowledged', label: 'Acknowledged' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const itrTypeOptions = [
    { value: '', label: 'All ITR Types' },
    { value: 'ITR-1', label: 'ITR-1' },
    { value: 'ITR-2', label: 'ITR-2' },
    { value: 'ITR-3', label: 'ITR-3' },
    { value: 'ITR-4', label: 'ITR-4' },
  ];

  const contextOptions = [
    { value: '', label: 'All Contexts' },
    { value: 'self', label: 'Self' },
    { value: 'family', label: 'Family' },
    { value: 'ca_client', label: 'CA Client' },
  ];

  // Computed values
  const filteredFilings = useMemo(() => {
    return filings.filter(filing => {
      const matchesSearch = !searchTerm || 
        filing.taxpayerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        filing.pan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        filing.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !filters.status || filing.status === filters.status;
      const matchesItrType = !filters.itrType || filing.itrType === filters.itrType;
      const matchesContext = !filters.context || filing.filingContext === filters.context;
      const matchesYear = !filters.year || filing.assessmentYear === filters.year;

      return matchesSearch && matchesStatus && matchesItrType && matchesContext && matchesYear;
    });
  }, [filings, searchTerm, filters]);

  const isAllSelected = selectedFilings.length === filteredFilings.length && filteredFilings.length > 0;
  const isIndeterminate = selectedFilings.length > 0 && selectedFilings.length < filteredFilings.length;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Filings</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ITR Filings</h1>
          <p className="text-gray-600">
            {totalCount} total filings • {filteredFilings.length} filtered
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          
          {selectedFilings.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowBulkActions(!showBulkActions)}
            >
              Bulk Actions ({selectedFilings.length})
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, PAN, or ticket number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value, page: 1 })}
              options={statusOptions}
            />
            
            <Select
              value={filters.itrType}
              onChange={(e) => setFilters({ itrType: e.target.value, page: 1 })}
              options={itrTypeOptions}
            />
            
            <Select
              value={filters.context}
              onChange={(e) => setFilters({ context: e.target.value, page: 1 })}
              options={contextOptions}
            />
            
            <Input
              placeholder="Assessment Year"
              value={filters.year}
              onChange={(e) => setFilters({ year: e.target.value, page: 1 })}
            />
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {showBulkActions && selectedFilings.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-blue-800 font-medium">
              {selectedFilings.length} filing(s) selected
            </div>
            
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleBulkAction('in_progress')}
                disabled={bulkUpdateLoading}
              >
                Mark as In Progress
              </Button>
              
              <Button
                size="sm"
                onClick={() => handleBulkAction('submitted')}
                disabled={bulkUpdateLoading}
              >
                Mark as Submitted
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedFilings([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Filings</div>
            <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">In Progress</div>
            <div className="text-2xl font-bold text-blue-600">{statistics.inProgress}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Submitted</div>
            <div className="text-2xl font-bold text-green-600">{statistics.submitted}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-2xl font-bold text-purple-600">{statistics.completed}</div>
          </div>
        </div>
      )}

      {/* Filings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taxpayer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ITR Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Context
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredFilings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No filings found
                  </td>
                </tr>
              ) : (
                filteredFilings.map((filing) => (
                  <tr key={filing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedFilings.includes(filing.id)}
                        onChange={(e) => handleBulkSelect(filing.id, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {filing.taxpayerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          PAN: {filing.pan}
                        </div>
                        <div className="text-sm text-gray-500">
                          Ticket: {filing.ticketNumber}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {filing.itrType}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        filing.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        filing.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        filing.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        filing.status === 'acknowledged' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {filing.status.replace('_', ' ')}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${filing.progressPercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {filing.progressPercentage}%
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {filing.filingContext.replace('_', ' ')}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFilingSelect(filing)}
                        >
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setFilters({ page: currentPage - 1 })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setFilters({ page: currentPage + 1 })}
              >
                Next
              </Button>
            </div>
            
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setFilters({ page: currentPage - 1 })}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      onClick={() => setFilters({ page })}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setFilters({ page: currentPage + 1 })}
                  >
                    Next
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filing Detail Modal */}
      {selectedFiling && (
        <Modal
          isOpen={!!selectedFiling}
          onClose={() => setSelectedFiling(null)}
          title="Filing Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Taxpayer Name</label>
                <p className="mt-1 text-sm text-gray-900">{selectedFiling.taxpayerName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">PAN</label>
                <p className="mt-1 text-sm text-gray-900">{selectedFiling.pan}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">ITR Type</label>
                <p className="mt-1 text-sm text-gray-900">{selectedFiling.itrType}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Assessment Year</label>
                <p className="mt-1 text-sm text-gray-900">{selectedFiling.assessmentYear}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1 text-sm text-gray-900">{selectedFiling.status}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Progress</label>
                <p className="mt-1 text-sm text-gray-900">{selectedFiling.progressPercentage}%</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setSelectedFiling(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ITRFilingList;
