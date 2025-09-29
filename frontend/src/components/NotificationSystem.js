// =====================================================
// ENTERPRISE NOTIFICATION SYSTEM - FRONTEND
// Real-time notification management with WebSocket integration
// =====================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { Bell, X, Check, AlertCircle, Info, CheckCircle, Clock, User, FileText, Shield, CreditCard, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

// Notification service
class NotificationService {
  constructor() {
    this.baseUrl = '/api/notifications';
  }

  async getNotifications(options = {}) {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value);
      }
    });

    const response = await fetch(`${this.baseUrl}?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return response.json();
  }

  async getNotificationStats() {
    const response = await fetch(`${this.baseUrl}/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notification stats');
    }

    return response.json();
  }

  async markAsRead(notificationId) {
    const response = await fetch(`${this.baseUrl}/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    return response.json();
  }

  async markAllAsRead() {
    const response = await fetch(`${this.baseUrl}/read-all`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }

    return response.json();
  }

  async deleteNotification(notificationId) {
    const response = await fetch(`${this.baseUrl}/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }

    return response.json();
  }

  async getPreferences() {
    const response = await fetch(`${this.baseUrl}/preferences`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notification preferences');
    }

    return response.json();
  }

  async updatePreferences(preferences) {
    const response = await fetch(`${this.baseUrl}/preferences`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferences)
    });

    if (!response.ok) {
      throw new Error('Failed to update notification preferences');
    }

    return response.json();
  }
}

const notificationService = new NotificationService();

// Notification icon mapping
const getNotificationIcon = (category, priority) => {
  const iconProps = {
    size: 20,
    className: priority === 'urgent' ? 'text-red-500' : 
               priority === 'high' ? 'text-orange-500' : 
               'text-blue-500'
  };

  switch (category) {
    case 'filing':
      return <FileText {...iconProps} />;
    case 'deadline':
      return <Clock {...iconProps} />;
    case 'ca':
      return <User {...iconProps} />;
    case 'system':
      return <Info {...iconProps} />;
    case 'payment':
      return <CreditCard {...iconProps} />;
    case 'document':
      return <Upload {...iconProps} />;
    case 'compliance':
      return <Shield {...iconProps} />;
    default:
      return <Bell {...iconProps} />;
  }
};

// Priority color mapping
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'urgent':
      return 'border-l-red-500 bg-red-50';
    case 'high':
      return 'border-l-orange-500 bg-orange-50';
    case 'normal':
      return 'border-l-blue-500 bg-blue-50';
    case 'low':
      return 'border-l-gray-500 bg-gray-50';
    default:
      return 'border-l-blue-500 bg-blue-50';
  }
};

// Notification component
const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMarkAsRead = useCallback(() => {
    if (!notification.is_read) {
      onMarkAsRead(notification.notification_id);
    }
  }, [notification, onMarkAsRead]);

  const handleDelete = useCallback(() => {
    onDelete(notification.notification_id);
  }, [notification, onDelete]);

  return (
    <div
      className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
        !notification.is_read ? 'bg-white shadow-sm' : 'bg-gray-50'
      } hover:shadow-md transition-all duration-200`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-1">
            {getNotificationIcon(notification.category, notification.priority)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className={`text-sm font-medium ${
                !notification.is_read ? 'text-gray-900' : 'text-gray-600'
              }`}>
                {notification.title}
              </h4>
              
              {!notification.is_read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              
              {notification.priority === 'urgent' && (
                <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                  Urgent
                </span>
              )}
            </div>
            
            <p className={`mt-1 text-sm ${
              !notification.is_read ? 'text-gray-700' : 'text-gray-500'
            }`}>
              {notification.message}
            </p>
            
            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
              <span>{new Date(notification.created_at).toLocaleString()}</span>
              
              {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                  View Details
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className={`flex items-center space-x-2 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          {!notification.is_read && (
            <button
              onClick={handleMarkAsRead}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="Mark as read"
            >
              <Check size={16} />
            </button>
          )}
          
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete notification"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Main notification system component
const NotificationSystem = ({ userId, className = '' }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showRead, setShowRead] = useState(true);
  const [wsConnection, setWsConnection] = useState(null);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  
  const queryClient = useQueryClient();
  const notificationRef = useRef(null);

  // Fetch notifications
  const { data: notificationsData, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['notifications', userId, filter, showRead],
    queryFn: () => notificationService.getNotifications({
      page: 1,
      limit: 50,
      type: filter !== 'all' ? filter : null,
      is_read: showRead ? null : false
    }),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  // Fetch notification stats
  const { data: statsData } = useQuery({
    queryKey: ['notificationStats', userId],
    queryFn: () => notificationService.getNotificationStats(),
    enabled: !!userId,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', userId]);
      queryClient.invalidateQueries(['notificationStats', userId]);
    },
    onError: (error) => {
      toast.error('Failed to mark notification as read');
      console.error('Error marking notification as read:', error);
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', userId]);
      queryClient.invalidateQueries(['notificationStats', userId]);
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      toast.error('Failed to mark all notifications as read');
      console.error('Error marking all notifications as read:', error);
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId) => notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications', userId]);
      queryClient.invalidateQueries(['notificationStats', userId]);
    },
    onError: (error) => {
      toast.error('Failed to delete notification');
      console.error('Error deleting notification:', error);
    }
  });

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem('accessToken');
    const userRole = user?.role || 'user';
    
    console.log('🔍 NotificationSystem Debug:', {
      userId,
      token: token ? `${token.substring(0, 20)}...` : 'undefined',
      userRole,
      user: user ? { id: user.id, role: user.role } : 'undefined'
    });
    
    const wsUrl = `${process.env.REACT_APP_WS_URL || 'ws://localhost:3002'}/ws?userId=${userId}&token=${token}&role=${userRole}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('🔌 Notification WebSocket connected');
      setWsConnection(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'notification') {
          // Invalidate queries to refresh notifications
          queryClient.invalidateQueries(['notifications', userId]);
          queryClient.invalidateQueries(['notificationStats', userId]);
          
          // Show toast for new notifications
          if (data.data.priority === 'urgent') {
            toast.error(data.data.title, {
              duration: 8000,
              icon: '🚨'
            });
          } else if (data.data.priority === 'high') {
            toast(data.data.title, {
              duration: 5000,
              icon: '🔔'
            });
          } else {
            toast(data.data.title, {
              duration: 3000,
              icon: '📢'
            });
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('🔌 Notification WebSocket disconnected');
      setWsConnection(null);
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (userId) {
          console.log('🔄 Attempting to reconnect WebSocket...');
          // Reconnection will be handled by the useEffect
        }
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [userId, queryClient]);

  // Track notification count changes
  useEffect(() => {
    if (statsData?.data?.unread !== undefined) {
      const currentCount = statsData.data.unread;
      
      if (lastNotificationCount > 0 && currentCount > lastNotificationCount) {
        // New notifications arrived
        const newCount = currentCount - lastNotificationCount;
        toast.success(`${newCount} new notification${newCount > 1 ? 's' : ''}`, {
          duration: 3000,
          icon: '🔔'
        });
      }
      
      setLastNotificationCount(currentCount);
    }
  }, [statsData, lastNotificationCount]);

  const notifications = notificationsData?.data || [];
  const stats = statsData?.data || { unread: 0, total: 0 };

  const handleMarkAsRead = useCallback((notificationId) => {
    markAsReadMutation.mutate(notificationId);
  }, [markAsReadMutation]);

  const handleDelete = useCallback((notificationId) => {
    deleteNotificationMutation.mutate(notificationId);
  }, [deleteNotificationMutation]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
      >
        <Bell size={24} />
        
        {stats.unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {stats.unread > 99 ? '99+' : stats.unread}
          </span>
        )}
        
        {wsConnection ? (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        ) : (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
                {stats.unread > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({stats.unread} unread)
                  </span>
                )}
              </h3>
              
              <div className="flex items-center space-x-2">
                {stats.unread > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    disabled={markAllAsReadMutation.isPending}
                  >
                    Mark all read
                  </button>
                )}
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Filters */}
            <div className="mt-3 flex items-center space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="filing_update">Filing</option>
                <option value="deadline_reminder">Deadlines</option>
                <option value="ca_assignment">CA</option>
                <option value="system_alert">System</option>
                <option value="payment_status">Payment</option>
                <option value="document_upload">Documents</option>
                <option value="compliance_alert">Compliance</option>
              </select>
              
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={showRead}
                  onChange={(e) => setShowRead(e.target.checked)}
                  className="mr-1"
                />
                Show read
              </label>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoadingNotifications ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications found
              </div>
            ) : (
              <div ref={notificationRef}>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.notification_id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {stats.total} total notifications
              </span>
              
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  wsConnection ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span>
                  {wsConnection ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;