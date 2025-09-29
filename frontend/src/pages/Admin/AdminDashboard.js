// =====================================================
// ADMIN DASHBOARD COMPONENT
// =====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { enterpriseLogger } from '../../utils/logger';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = ({ className = '' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: '',
    page: 1,
    limit: 20
  });

  // Role-based access control
  useEffect(() => {
    if (user) {
      const allowedRoles = ['super_admin', 'platform_admin', 'ca_firm_admin', 'ca'];
      if (!allowedRoles.includes(user.role)) {
        enterpriseLogger.warn('Unauthorized access to admin dashboard', {
          userId: user.id,
          userRole: user.role,
          attemptedPath: window.location.pathname
        });
        navigate('/dashboard');
        return;
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    loadSystemStats();
    loadRecentActivity();
    loadUsers();
  }, [filters]);

  const loadSystemStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load system stats');
      }

      const data = await response.json();
      setSystemStats(data.data);

    } catch (error) {
      enterpriseLogger.error('Failed to load system stats', { error: error.message });
    }
  };

  const loadRecentActivity = async () => {
    try {
      const response = await fetch('/api/admin/activity', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load recent activity');
      }

      const data = await response.json();
      setRecentActivity(data.data.activities);

    } catch (error) {
      enterpriseLogger.error('Failed to load recent activity', { error: error.message });
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data.data.users);

    } catch (error) {
      enterpriseLogger.error('Failed to load users', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (user) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load user details');
      }

      const data = await response.json();
      setSelectedUser(data.data);
      setShowUserModal(true);

    } catch (error) {
      enterpriseLogger.error('Failed to load user details', { error: error.message });
    }
  };

  const handleStatusUpdate = async (userId, newStatus, reason) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus, reason })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      // Reload users
      await loadUsers();
      setShowStatusModal(false);

      enterpriseLogger.info('User status updated', { userId, newStatus, reason });

    } catch (error) {
      enterpriseLogger.error('Failed to update user status', { error: error.message });
    }
  };

  const handleRoleUpdate = async (userId, newRole, reason) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: newRole, reason })
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      // Reload users
      await loadUsers();
      setShowRoleModal(false);

      enterpriseLogger.info('User role updated', { userId, newRole, reason });

    } catch (error) {
      enterpriseLogger.error('Failed to update user role', { error: error.message });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && !systemStats) {
    return (
      <div className={`admin-dashboard ${className}`}>
        <Card className="loading-state">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Loading admin dashboard...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`admin-dashboard ${className}`}>
      {/* Header */}
      <Card className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Manage users, monitor system, and oversee operations</p>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="tabs-card">
        <div className="tabs">
          <Button
            variant={activeTab === 'overview' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('overview')}
            className="tab-button"
          >
            📊 Overview
          </Button>
          <Button
            variant={activeTab === 'users' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('users')}
            className="tab-button"
          >
            👥 Users ({users.length})
          </Button>
          <Button
            variant={activeTab === 'activity' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('activity')}
            className="tab-button"
          >
            📈 Activity
          </Button>
        </div>
      </Card>

      {/* Overview Tab */}
      {activeTab === 'overview' && systemStats && (
        <div className="overview-tab">
          {/* System Stats */}
          <Card className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{systemStats.users.totalUsers}</h3>
                <p>Total Users</p>
                <div className="stat-breakdown">
                  <span className="breakdown-item">Active: {systemStats.users.activeUsers}</span>
                  <span className="breakdown-item">CA: {systemStats.users.caUsers}</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📄</div>
              <div className="stat-content">
                <h3>{systemStats.filings.totalFilings}</h3>
                <p>Total Filings</p>
                <div className="stat-breakdown">
                  <span className="breakdown-item">Draft: {systemStats.filings.draftFilings}</span>
                  <span className="breakdown-item">Submitted: {systemStats.filings.submittedFilings}</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎫</div>
              <div className="stat-content">
                <h3>{systemStats.tickets.totalTickets}</h3>
                <p>Service Tickets</p>
                <div className="stat-breakdown">
                  <span className="breakdown-item">Open: {systemStats.tickets.openTickets}</span>
                  <span className="breakdown-item">Resolved: {systemStats.tickets.resolvedTickets}</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📁</div>
              <div className="stat-content">
                <h3>{systemStats.documents.totalDocuments}</h3>
                <p>Documents</p>
                <div className="stat-breakdown">
                  <span className="breakdown-item">Verified: {systemStats.documents.verifiedDocuments}</span>
                  <span className="breakdown-item">Storage: {formatFileSize(systemStats.documents.totalStorage)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* System Info */}
          <Card className="system-info">
            <h3>System Information</h3>
            <div className="system-details">
              <div className="system-item">
                <span className="label">Uptime:</span>
                <span className="value">{Math.floor(systemStats.system.uptime / 3600)} hours</span>
              </div>
              <div className="system-item">
                <span className="label">Memory Usage:</span>
                <span className="value">{formatFileSize(systemStats.system.memoryUsage.heapUsed)}</span>
              </div>
              <div className="system-item">
                <span className="label">Node Version:</span>
                <span className="value">{systemStats.system.nodeVersion}</span>
              </div>
              <div className="system-item">
                <span className="label">Platform:</span>
                <span className="value">{systemStats.system.platform}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="users-tab">
          {/* Filters */}
          <Card className="filters-card">
            <div className="filters">
              <div className="filter-group">
                <label>Role:</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
                >
                  <option value="">All Roles</option>
                  <option value="user">End User</option>
                  <option value="ca">CA</option>
                  <option value="ca_firm_admin">CA Firm Admin</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Status:</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Search:</label>
                <input
                  type="text"
                  placeholder="Search by name, email, or phone"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                />
              </div>
            </div>
          </Card>

          {/* Users List */}
          <Card className="users-list">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
                <p>Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <h3>No Users Found</h3>
                <p>No users match your current filters</p>
              </div>
            ) : (
              <div className="users-table">
                <div className="table-header">
                  <div className="header-cell">User</div>
                  <div className="header-cell">Role</div>
                  <div className="header-cell">Status</div>
                  <div className="header-cell">Created</div>
                  <div className="header-cell">Last Login</div>
                  <div className="header-cell">Actions</div>
                </div>
                {users.map(user => (
                  <div key={user.id} className="table-row" onClick={() => handleUserClick(user)}>
                    <div className="table-cell">
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <h4>{user.fullName}</h4>
                          <p>{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="table-cell">
                      <span className="role-badge">{user.roleLabel}</span>
                    </div>
                    <div className="table-cell">
                      <StatusBadge
                        status={user.statusLabel}
                        color={user.statusColor}
                      />
                    </div>
                    <div className="table-cell">
                      {formatDate(user.createdAt)}
                    </div>
                    <div className="table-cell">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                    </div>
                    <div className="table-cell">
                      <div className="action-buttons">
                        <Button
                          variant="outline"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                            setShowStatusModal(true);
                          }}
                        >
                          Status
                        </Button>
                        <Button
                          variant="outline"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                            setShowRoleModal(true);
                          }}
                        >
                          Role
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <Card className="activity-tab">
          <h3>Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📈</div>
              <h3>No Recent Activity</h3>
              <p>No recent activity to display</p>
            </div>
          ) : (
            <div className="activity-list">
              {recentActivity.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'user_registration' ? '👤' : '📄'}
                  </div>
                  <div className="activity-content">
                    <h4>{activity.description}</h4>
                    <p>{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="User Details"
        size="large"
      >
        {selectedUser && (
          <div className="user-details-modal">
            <div className="user-header">
              <div className="user-avatar-large">
                {selectedUser.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <h2>{selectedUser.fullName}</h2>
                <p>{selectedUser.email}</p>
                <div className="user-badges">
                  <StatusBadge
                    status={selectedUser.statusLabel}
                    color={selectedUser.statusColor}
                  />
                  <span className="role-badge">{selectedUser.roleLabel}</span>
                </div>
              </div>
            </div>

            <div className="user-stats">
              <div className="stat-item">
                <h4>Tickets</h4>
                <p>Total: {selectedUser.statistics.tickets.totalTickets}</p>
                <p>Open: {selectedUser.statistics.tickets.openTickets}</p>
              </div>
              <div className="stat-item">
                <h4>Filings</h4>
                <p>Total: {selectedUser.statistics.filings.totalFilings}</p>
                <p>Draft: {selectedUser.statistics.filings.draftFilings}</p>
              </div>
              <div className="stat-item">
                <h4>Documents</h4>
                <p>Total: {selectedUser.statistics.documents.totalFiles}</p>
                <p>Storage: {formatFileSize(selectedUser.statistics.documents.totalSize)}</p>
              </div>
            </div>

            <div className="user-meta">
              <h4>Account Information</h4>
              <div className="meta-item">
                <span className="label">Created:</span>
                <span className="value">{formatDate(selectedUser.createdAt)}</span>
              </div>
              <div className="meta-item">
                <span className="label">Last Login:</span>
                <span className="value">{selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'Never'}</span>
              </div>
              <div className="meta-item">
                <span className="label">Login Count:</span>
                <span className="value">{selectedUser.loginCount}</span>
              </div>
              <div className="meta-item">
                <span className="label">Email Verified:</span>
                <span className="value">{selectedUser.emailVerified ? 'Yes' : 'No'}</span>
              </div>
              <div className="meta-item">
                <span className="label">Phone Verified:</span>
                <span className="value">{selectedUser.phoneVerified ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update User Status"
        size="small"
      >
        {selectedUser && (
          <div className="status-update-modal">
            <h3>Update status for {selectedUser.fullName}</h3>
            <div className="status-options">
              {['active', 'inactive', 'suspended', 'pending'].map(status => (
                <Button
                  key={status}
                  variant={selectedUser.status === status ? 'primary' : 'outline'}
                  onClick={() => handleStatusUpdate(selectedUser.id, status, 'Status updated by admin')}
                  className="status-option"
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Role Update Modal */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Update User Role"
        size="small"
      >
        {selectedUser && (
          <div className="role-update-modal">
            <h3>Update role for {selectedUser.fullName}</h3>
            <div className="role-options">
              {[
                { key: 'user', label: 'End User' },
                { key: 'ca', label: 'CA' },
                { key: 'ca_firm_admin', label: 'CA Firm Admin' },
                { key: 'admin', label: 'Admin' },
                { key: 'super_admin', label: 'Super Admin' }
              ].map(role => (
                <Button
                  key={role.key}
                  variant={selectedUser.role === role.key ? 'primary' : 'outline'}
                  onClick={() => handleRoleUpdate(selectedUser.id, role.key, 'Role updated by admin')}
                  className="role-option"
                >
                  {role.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
