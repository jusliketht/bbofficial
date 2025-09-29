// =====================================================
// COMPACT NOTIFICATION SYSTEM - MOBILE-FIRST
// Dense notification display with maximum efficiency
// =====================================================

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Clock,
  ExternalLink
} from 'lucide-react';

const CompactNotification = ({
  id,
  type = 'info',
  title,
  message,
  timestamp,
  read = false,
  priority = 'normal',
  actions = [],
  onMarkAsRead,
  onDismiss,
  onClick,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200'
    },
    error: {
      icon: AlertCircle,
      color: 'text-error-600',
      bgColor: 'bg-error-50',
      borderColor: 'border-error-200'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
      borderColor: 'border-warning-200'
    },
    info: {
      icon: Info,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200'
    }
  };

  const priorityConfig = {
    high: 'border-l-4 border-l-error-500',
    medium: 'border-l-4 border-l-warning-500',
    low: 'border-l-4 border-l-primary-500',
    normal: ''
  };

  const config = typeConfig[type];

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss(id);
    }
  };

  const handleMarkAsRead = () => {
    if (onMarkAsRead) {
      onMarkAsRead(id);
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        relative p-4 rounded-xl border transition-all duration-200 cursor-pointer
        ${config.bgColor} ${config.borderColor} ${priorityConfig[priority]}
        ${!read ? 'shadow-sm' : 'opacity-75'}
        hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
        ${className}
      `}
      onClick={onClick}
    >
      {/* Dismiss button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Content */}
      <div className="flex items-start space-x-3 pr-6">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <config.icon className={`w-5 h-5 ${config.color}`} />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-semibold text-neutral-900 truncate">
              {title}
            </h4>
            {!read && (
              <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 ml-2 mt-1" />
            )}
          </div>
          
          <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
            {message}
          </p>

          {/* Timestamp and actions */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 text-neutral-400" />
              <span className="text-xs text-neutral-500">
                {formatTimestamp(timestamp)}
              </span>
            </div>

            {/* Actions */}
            {actions.length > 0 && (
              <div className="flex items-center space-x-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick();
                    }}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mark as read button */}
      {!read && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleMarkAsRead();
          }}
          className="absolute bottom-2 right-2 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          Mark as read
        </button>
      )}
    </div>
  );
};

// =====================================================
// COMPACT NOTIFICATION LIST
// =====================================================

export const CompactNotificationList = ({
  notifications = [],
  onMarkAllAsRead,
  onDismissAll,
  onNotificationClick,
  onMarkAsRead,
  onDismiss,
  className = ''
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-neutral-600" />
          <h3 className="text-lg font-semibold text-neutral-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onDismissAll}
            className="text-sm text-neutral-500 hover:text-neutral-700 font-medium transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <CompactNotification
              key={notification.id}
              {...notification}
              onClick={() => onNotificationClick?.(notification)}
              onMarkAsRead={onMarkAsRead}
              onDismiss={onDismiss}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">No notifications yet</p>
            <p className="text-sm text-neutral-400 mt-1">
              You'll see important updates here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================
// COMPACT NOTIFICATION BELL
// =====================================================

export const CompactNotificationBell = ({
  count = 0,
  onClick,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors ${className}`}
    >
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-error-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

// =====================================================
// COMPACT NOTIFICATION TOAST
// =====================================================

export const CompactNotificationToast = ({
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  actions = []
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200'
    },
    error: {
      icon: AlertCircle,
      color: 'text-error-600',
      bgColor: 'bg-error-50',
      borderColor: 'border-error-200'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
      borderColor: 'border-warning-200'
    },
    info: {
      icon: Info,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200'
    }
  };

  const config = typeConfig[type];

  if (!isVisible) return null;

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-xl border shadow-lg
      ${config.bgColor} ${config.borderColor}
      animate-slide-in-right
    `}>
      <div className="flex items-start space-x-3">
        <config.icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-neutral-900">{title}</h4>
          <p className="text-sm text-neutral-600 mt-1">{message}</p>
          {actions.length > 0 && (
            <div className="flex items-center space-x-2 mt-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CompactNotification;
