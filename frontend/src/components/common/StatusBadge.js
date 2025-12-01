// =====================================================
// STATUS BADGE COMPONENT
// Fully compliant with UI.md specifications
// =====================================================

import React from 'react';
import { Check, AlertTriangle, XCircle, Clock, Loader2, Sparkles, PenTool, BadgeCheck, FileEdit } from 'lucide-react';
import { cn } from '../../lib/utils';

const badgeConfig = {
  complete: {
    icon: Check,
    label: 'Complete',
    bgClass: 'bg-success-100',
    textClass: 'text-success-700',
  },
  verified: {
    icon: BadgeCheck,
    label: 'Verified',
    bgClass: 'bg-success-100',
    textClass: 'text-success-700',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    bgClass: 'bg-warning-100',
    textClass: 'text-warning-700',
  },
  error: {
    icon: XCircle,
    label: 'Error',
    bgClass: 'bg-error-100',
    textClass: 'text-error-700',
  },
  pending: {
    icon: Clock,
    label: 'Pending',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-600',
  },
  'in-progress': {
    icon: Loader2,
    label: 'In Progress',
    bgClass: 'bg-info-100',
    textClass: 'text-info-700',
    animate: true,
  },
  'auto-filled': {
    icon: Sparkles,
    label: 'Auto-filled',
    bgClass: 'bg-info-100',
    textClass: 'text-info-700',
  },
  manual: {
    icon: PenTool,
    label: 'Manual',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-600',
  },
  draft: {
    icon: FileEdit,
    label: 'Draft',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-700',
  },
  // Legacy status mappings
  submitted: {
    icon: Check,
    label: 'Submitted',
    bgClass: 'bg-success-100',
    textClass: 'text-success-700',
  },
  processed: {
    icon: Check,
    label: 'Processed',
    bgClass: 'bg-success-100',
    textClass: 'text-success-700',
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    bgClass: 'bg-error-100',
    textClass: 'text-error-700',
  },
  paid: {
    icon: Check,
    label: 'Paid',
    bgClass: 'bg-success-100',
    textClass: 'text-success-700',
  },
  unpaid: {
    icon: XCircle,
    label: 'Unpaid',
    bgClass: 'bg-error-100',
    textClass: 'text-error-700',
  },
  active: {
    icon: Check,
    label: 'Active',
    bgClass: 'bg-success-100',
    textClass: 'text-success-700',
  },
  inactive: {
    icon: Clock,
    label: 'Inactive',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-600',
  },
};

const StatusBadge = ({
  status,
  color,
  size = 'medium',
  className = '',
  children,
  count,
  showLabel = true,
  pulse = false,
}) => {
  // Normalize status (handle camelCase, snake_case, etc.)
  const normalizedStatus = status?.toLowerCase().replace(/_/g, '-') || 'pending';

  // Get config - use provided color if status not found, otherwise use config
  const config = badgeConfig[normalizedStatus] || {
    icon: Clock,
    label: status || 'Unknown',
    bgClass: color === 'green' ? 'bg-success-100' : color === 'red' ? 'bg-error-100' : color === 'yellow' ? 'bg-warning-100' : color === 'blue' ? 'bg-info-100' : 'bg-gray-100',
    textClass: color === 'green' ? 'text-success-700' : color === 'red' ? 'text-error-700' : color === 'yellow' ? 'text-warning-700' : color === 'blue' ? 'text-info-700' : 'text-gray-600',
  };

  const Icon = config.icon;
  const hasAnimation = config.animate || pulse;

  const sizeClasses = {
    small: 'px-2 py-0.5 text-label-sm',
    medium: 'px-2.5 py-1 text-label-md',
    large: 'px-3 py-1.5 text-label-lg',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        config.bgClass,
        config.textClass,
        sizeClasses[size],
        pulse && 'relative',
        className,
      )}
      role="status"
      aria-label={showLabel ? (children || config.label) : undefined}
    >
      <Icon
        className={cn(
          hasAnimation && 'animate-spin',
          size === 'small' ? 'w-3 h-3' : size === 'medium' ? 'w-3.5 h-3.5' : 'w-4 h-4',
        )}
        aria-hidden="true"
      />
      {showLabel && (
        <span>
          {children || config.label}
          {count !== undefined && count > 0 && ` (${count})`}
        </span>
      )}
      {!showLabel && count !== undefined && count > 0 && <span>{count}</span>}
      {pulse && (
        <span
          className={cn(
            'absolute inset-0 rounded-full animate-ping opacity-75',
            config.bgClass,
          )}
          aria-hidden="true"
        />
      )}
    </span>
  );
};

// Dot Indicator (Minimal)
export const StatusDot = ({ status, pulse = false }) => {
  const colors = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    pending: 'bg-gray-300',
  };

  return (
    <span className="relative inline-flex" role="status" aria-label={`Status: ${status}`}>
      <span className={cn('w-2 h-2 rounded-full', colors[status] || colors.pending)} />
      {pulse && (
        <span
          className={cn(
            'absolute inset-0 rounded-full animate-ping opacity-75',
            colors[status] || colors.pending,
          )}
          aria-hidden="true"
        />
      )}
    </span>
  );
};

export default StatusBadge;
