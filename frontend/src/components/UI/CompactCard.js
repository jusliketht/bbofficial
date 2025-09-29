// =====================================================
// COMPACT CARD COMPONENT - MOBILE-FIRST DESIGN
// Dense information display with maximum efficiency
// =====================================================

import React from 'react';
import { ChevronRight, ExternalLink, AlertCircle, CheckCircle, Clock, Info } from 'lucide-react';

const CompactCard = ({
  title,
  subtitle,
  value,
  status,
  icon: Icon,
  onClick,
  href,
  variant = 'default',
  size = 'md',
  className = '',
  children,
  metadata = [],
  actions = [],
  loading = false,
  error = false
}) => {
  const baseClasses = `
    relative group cursor-pointer transition-all duration-200 ease-out
    bg-white border border-neutral-200 rounded-xl
    hover:shadow-md hover:border-primary-300 hover:-translate-y-0.5
    active:scale-[0.98] active:transition-none
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  `;

  const sizeClasses = {
    sm: 'p-3 min-h-[60px]',
    md: 'p-4 min-h-[80px]',
    lg: 'p-5 min-h-[100px]'
  };

  const variantClasses = {
    default: 'border-neutral-200 hover:border-primary-300',
    primary: 'border-primary-200 bg-primary-50/30 hover:border-primary-400',
    success: 'border-success-200 bg-success-50/30 hover:border-success-400',
    warning: 'border-warning-200 bg-warning-50/30 hover:border-warning-400',
    error: 'border-error-200 bg-error-50/30 hover:border-error-400',
    info: 'border-primary-200 bg-primary-50/30 hover:border-primary-400'
  };

  const statusIcon = {
    success: <CheckCircle className="w-4 h-4 text-success-500" />,
    warning: <AlertCircle className="w-4 h-4 text-warning-500" />,
    error: <AlertCircle className="w-4 h-4 text-error-500" />,
    pending: <Clock className="w-4 h-4 text-warning-500" />,
    info: <Info className="w-4 h-4 text-primary-500" />
  };

  const handleClick = () => {
    if (onClick) onClick();
    if (href) window.open(href, '_blank');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={title}
    >
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute top-2 right-2">
          <AlertCircle className="w-4 h-4 text-error-500" />
        </div>
      )}

      {/* Header Row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {Icon && (
            <div className="flex-shrink-0">
              <Icon className="w-4 h-4 text-neutral-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-neutral-900 truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-neutral-500 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {status && statusIcon[status]}
          {href && <ExternalLink className="w-3 h-3 text-neutral-400" />}
          {!href && onClick && <ChevronRight className="w-3 h-3 text-neutral-400 group-hover:text-primary-500" />}
        </div>
      </div>

      {/* Value Display */}
      {value && (
        <div className="mb-2">
          <div className="text-lg font-bold text-neutral-900">
            {value}
          </div>
        </div>
      )}

      {/* Metadata Row */}
      {metadata.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {metadata.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      {/* Actions Row */}
      {actions.length > 0 && (
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-neutral-100">
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

      {/* Children Content */}
      {children && (
        <div className="mt-2">
          {children}
        </div>
      )}

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:to-primary-500/5 transition-all duration-200 pointer-events-none" />
    </div>
  );
};

// =====================================================
// COMPACT CARD GRID LAYOUT
// =====================================================

export const CompactCardGrid = ({ 
  children, 
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = '4',
  className = ''
}) => {
  const gridClasses = `
    grid gap-${gap}
    grid-cols-${columns.sm}
    md:grid-cols-${columns.md}
    lg:grid-cols-${columns.lg}
    xl:grid-cols-${columns.xl}
    ${className}
  `;

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

// =====================================================
// COMPACT STATS CARD
// =====================================================

export const CompactStatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  trend,
  onClick,
  className = ''
}) => {
  const changeColors = {
    positive: 'text-success-600 bg-success-50',
    negative: 'text-error-600 bg-error-50',
    neutral: 'text-neutral-600 bg-neutral-50'
  };

  return (
    <CompactCard
      title={title}
      value={value}
      icon={Icon}
      onClick={onClick}
      size="sm"
      className={className}
    >
      <div className="flex items-center justify-between">
        {change && (
          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${changeColors[changeType]}`}>
            {change}
          </span>
        )}
        {trend && (
          <div className="text-xs text-neutral-500">
            {trend}
          </div>
        )}
      </div>
    </CompactCard>
  );
};

// =====================================================
// COMPACT PROGRESS CARD
// =====================================================

export const CompactProgressCard = ({
  title,
  progress,
  total,
  status = 'pending',
  onClick,
  className = ''
}) => {
  const percentage = total > 0 ? (progress / total) * 100 : 0;

  return (
    <CompactCard
      title={title}
      value={`${progress}/${total}`}
      status={status}
      onClick={onClick}
      size="sm"
      className={className}
    >
      <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
        <div
          className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-neutral-500 mt-1">
        {percentage.toFixed(0)}% complete
      </div>
    </CompactCard>
  );
};

export default CompactCard;
