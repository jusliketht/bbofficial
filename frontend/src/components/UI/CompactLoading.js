// =====================================================
// COMPACT LOADING COMPONENTS - MOBILE-FIRST
// Efficient loading states with maximum visual appeal
// =====================================================

import React from 'react';

// =====================================================
// COMPACT SPINNER
// =====================================================

export const CompactSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    success: 'text-success-500',
    warning: 'text-warning-500',
    error: 'text-error-500',
    neutral: 'text-neutral-500'
  };

  return (
    <div className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// =====================================================
// COMPACT SKELETON LOADER
// =====================================================

export const CompactSkeleton = ({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '' 
}) => {
  return (
    <div className={`animate-pulse bg-neutral-200 rounded ${width} ${height} ${className}`} />
  );
};

// =====================================================
// COMPACT CARD SKELETON
// =====================================================

export const CompactCardSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-xl border border-neutral-200 p-4 ${className}`}>
      <div className="flex items-center space-x-3 mb-3">
        <CompactSkeleton width="w-8" height="h-8" className="rounded-lg" />
        <div className="flex-1">
          <CompactSkeleton width="w-3/4" height="h-4" className="mb-2" />
          <CompactSkeleton width="w-1/2" height="h-3" />
        </div>
      </div>
      <CompactSkeleton width="w-full" height="h-6" className="mb-2" />
      <CompactSkeleton width="w-2/3" height="h-4" />
    </div>
  );
};

// =====================================================
// COMPACT DASHBOARD SKELETON
// =====================================================

export const CompactDashboardSkeleton = () => {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <CompactSkeleton width="w-64" height="h-8" className="mb-2" />
          <CompactSkeleton width="w-48" height="h-4" />
        </div>
        <div className="flex items-center space-x-3">
          <CompactSkeleton width="w-20" height="h-8" className="rounded-full" />
          <CompactSkeleton width="w-24" height="h-8" className="rounded-full" />
        </div>
      </div>

      {/* Quick actions skeleton */}
      <div>
        <CompactSkeleton width="w-32" height="h-6" className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <CompactCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Stats skeleton */}
      <div>
        <CompactSkeleton width="w-24" height="h-6" className="mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <CompactCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CompactSkeleton width="w-40" height="h-6" className="mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <CompactCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <CompactSkeleton width="w-32" height="h-6" className="mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <CompactCardSkeleton key={j} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =====================================================
// COMPACT FORM SKELETON
// =====================================================

export const CompactFormSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <CompactSkeleton width="w-48" height="h-8" className="mb-2" />
            <CompactSkeleton width="w-64" height="h-4" />
          </div>
          <CompactSkeleton width="w-20" height="h-8" className="rounded-full" />
        </div>
      </div>

      {/* Progress bar skeleton */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <CompactSkeleton width="w-24" height="h-4" />
          <CompactSkeleton width="w-16" height="h-4" />
        </div>
        <CompactSkeleton width="w-full" height="h-2" className="rounded-full" />
      </div>

      {/* Form content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="space-y-6">
              <div>
                <CompactSkeleton width="w-48" height="h-6" className="mb-2" />
                <CompactSkeleton width="w-64" height="h-4" className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <CompactSkeleton width="w-24" height="h-4" />
                      <CompactSkeleton width="w-full" height="h-10" className="rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-neutral-200 mt-6">
              <CompactSkeleton width="w-24" height="h-10" className="rounded-lg" />
              <CompactSkeleton width="w-32" height="h-10" className="rounded-lg" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 p-4">
              <CompactSkeleton width="w-32" height="h-6" className="mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <CompactSkeleton width="w-24" height="h-4" />
                    <CompactSkeleton width="w-16" height="h-4" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =====================================================
// COMPACT LOADING OVERLAY
// =====================================================

export const CompactLoadingOverlay = ({ 
  message = 'Loading...', 
  show = false,
  className = ''
}) => {
  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center ${className}`}>
      <div className="text-center">
        <CompactSpinner size="xl" className="mx-auto mb-4" />
        <p className="text-neutral-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

// =====================================================
// COMPACT PROGRESS BAR
// =====================================================

export const CompactProgressBar = ({ 
  progress = 0, 
  total = 100, 
  showPercentage = true,
  color = 'primary',
  size = 'md',
  className = ''
}) => {
  const percentage = Math.min(Math.max((progress / total) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-neutral-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-neutral-600">Progress</span>
          <span className="text-sm font-medium text-neutral-900">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default {
  CompactSpinner,
  CompactSkeleton,
  CompactCardSkeleton,
  CompactDashboardSkeleton,
  CompactFormSkeleton,
  CompactLoadingOverlay,
  CompactProgressBar
};
