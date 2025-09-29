import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../services/api';
import { 
  EnterpriseCard,
  EnterpriseButton,
  EnterpriseBadge,
  EnterpriseStatCard
} from '../../components/DesignSystem/EnterpriseComponents';

// Justification: Audit Dashboard - Admin interface for audit log management
// Provides comprehensive audit trail viewing and analysis capabilities
// Essential for compliance, security monitoring, and system administration
// Restricted to admin users for security and privacy

const AuditDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [eventTypes, setEventTypes] = useState({});
  const [auditLevels, setAuditLevels] = useState({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    userId: '',
    eventType: '',
    resourceType: '',
    resourceId: '',
    level: '',
    startDate: '',
    endDate: '',
    limit: 100,
    offset: 0
  });
  const [pagination, setPagination] = useState({
    limit: 100,
    offset: 0,
    count: 0
  });

  // Justification: Load Audit Data - Initialize audit dashboard data
  // Provides comprehensive audit information for dashboard display
  // Essential for admin monitoring and compliance reporting
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadAuditData();
  }, [user]); // Remove navigate dependency to prevent infinite loop

  const loadAuditData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/audit/dashboard');

      setLogs(response.logs || []);
      setStatistics(response.statistics || []);
      setEventTypes(response.eventTypes || {});
      setAuditLevels(response.auditLevels || {});
      setPagination(response.pagination || {});
    } catch (error) {
      console.error('Failed to load audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Justification: Handle Filter Change - Update audit log filters
  // Provides dynamic filtering capabilities for audit log analysis
  // Essential for efficient audit trail investigation and monitoring
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, offset: 0 };
    setFilters(newFilters);
  };

  // Justification: Apply Filters - Execute filtered audit log query
  // Provides filtered audit log retrieval based on user criteria
  // Essential for targeted audit trail analysis and investigation
  const applyFilters = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/audit/logs', { params: filters });
      setLogs(response.logs || []);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error('Failed to apply filters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Justification: Export Audit Logs - Export audit data for external analysis
  // Provides data export capabilities for compliance and external audits
  // Essential for regulatory reporting and external analysis
  const exportLogs = async (format = 'json') => {
    try {
      const response = await apiClient.get(`/audit/export`, { 
        params: { ...filters, format } 
      });

      if (format === 'csv') {
        // Handle CSV download
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.filename;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Handle JSON download
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
          type: 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.filename;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  // Justification: Format Timestamp - Display formatted timestamps
  // Provides human-readable timestamp display
  // Essential for user-friendly audit log viewing
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Justification: Get Event Type Label - Display human-readable event types
  // Provides user-friendly event type labels
  // Essential for clear audit log interpretation
  const getEventTypeLabel = (eventType) => {
    return eventTypes[eventType] || eventType;
  };

  // Justification: Get Level Badge - Display audit level with visual indicators
  // Provides visual distinction for different audit levels
  // Essential for quick audit log assessment and prioritization
  const getLevelBadge = (level) => {
    const colors = {
      CRITICAL: 'bg-red-100 text-red-800',
      HIGH: 'bg-orange-100 text-orange-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level] || 'bg-gray-100 text-gray-800'}`}>
        {level}
      </span>
    );
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Audit Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor system activity and compliance
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => exportLogs('json')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Export JSON
              </button>
              <button
                onClick={() => exportLogs('csv')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Events</h3>
            <p className="text-3xl font-bold text-blue-600">{statistics.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Critical Events</h3>
            <p className="text-3xl font-bold text-red-600">
              {statistics.filter(s => s.level === 'CRITICAL').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">User Actions</h3>
            <p className="text-3xl font-bold text-green-600">
              {statistics.filter(s => s.user_role !== 'system').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">System Events</h3>
            <p className="text-3xl font-bold text-purple-600">
              {statistics.filter(s => s.user_role === 'system').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <input
                  type="text"
                  value={filters.userId}
                  onChange={(e) => handleFilterChange('userId', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter user ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Type</label>
                <select
                  value={filters.eventType}
                  onChange={(e) => handleFilterChange('eventType', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">All Event Types</option>
                  {Object.entries(eventTypes).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Level</label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">All Levels</option>
                  {Object.entries(auditLevels).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={applyFilters}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Apply Filters'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Audit Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.audit_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getEventTypeLabel(log.event_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{log.user_id}</div>
                        <div className="text-gray-500">{log.user_role}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{log.resource_type}</div>
                        <div className="text-gray-500">{log.resource_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getLevelBadge(log.level)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.ip_address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing {pagination.offset + 1} to {pagination.offset + logs.length} of {pagination.count} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const newOffset = Math.max(0, pagination.offset - pagination.limit);
                    setFilters({ ...filters, offset: newOffset });
                  }}
                  disabled={pagination.offset === 0}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    const newOffset = pagination.offset + pagination.limit;
                    setFilters({ ...filters, offset: newOffset });
                  }}
                  disabled={pagination.offset + pagination.limit >= pagination.count}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditDashboard;
