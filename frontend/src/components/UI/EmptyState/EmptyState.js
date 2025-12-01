// =====================================================
// EMPTY STATE COMPONENT
// Contextual empty states with actions
// Fully compliant with UI.md specifications
// =====================================================

import React from 'react';
import { FileText, Upload, AlertTriangle, Search } from 'lucide-react';
import Button from '../../common/Button';
import { cn } from '../../../lib/utils';

const EmptyState = ({
  icon: Icon = FileText,
  title,
  description,
  action,
  actionLabel,
  secondaryAction,
  secondaryActionLabel,
  className = '',
  size = 'md',
  ...props
}) => {
  const iconSize = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const padding = {
    sm: 'py-8 px-4',
    md: 'py-12 px-6',
    lg: 'py-16 px-8',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        padding[size],
        className,
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      {Icon && (
        <div className={cn('mb-4', size === 'lg' && 'mb-5')}>
          <Icon className={cn('text-gray-300', iconSize[size])} aria-hidden="true" />
        </div>
      )}

      {title && (
        <h3
          className={cn(
            'text-heading-md font-semibold text-gray-800 mb-2',
            size === 'sm' && 'text-heading-sm',
            size === 'lg' && 'text-heading-lg',
          )}
          style={{
            fontSize: size === 'sm' ? '16px' : size === 'lg' ? '20px' : '18px',
            fontWeight: 600,
            lineHeight: size === 'sm' ? '24px' : size === 'lg' ? '28px' : '26px',
          }}
        >
          {title}
        </h3>
      )}

      {description && (
        <p
          className={cn(
            'text-body-md text-gray-500 max-w-sm mb-6',
            size === 'sm' && 'text-body-sm',
          )}
          style={{
            fontSize: size === 'sm' ? '13px' : '14px',
            lineHeight: size === 'sm' ? '20px' : '22px',
          }}
        >
          {description}
        </p>
      )}

      {(action || actionLabel || secondaryAction || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action || (actionLabel && (
            <Button variant="primary" onClick={action}>
              {actionLabel}
            </Button>
          ))}
          {secondaryAction || (secondaryActionLabel && (
            <Button variant="secondary" onClick={secondaryAction}>
              {secondaryActionLabel}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

// Pre-built empty states
export const NoDataEmptyState = ({ itemType = 'items', onAdd }) => {
  return (
    <EmptyState
      icon={FileText}
      title={`No ${itemType} added`}
      description={`Add your ${itemType} to get started with tax calculation`}
      action={onAdd ? { label: `+ Add ${itemType}`, onClick: onAdd } : undefined}
    />
  );
};

export const UploadEmptyState = ({ documentType = 'document', onUpload, onManualEntry }) => {
  return (
    <EmptyState
      icon={Upload}
      title={`Upload ${documentType} to get started`}
      description={`We'll auto-fill your details from the ${documentType}`}
      action={{ label: `Upload ${documentType}`, onClick: onUpload }}
      secondaryAction={onManualEntry ? { label: 'or enter details manually', onClick: onManualEntry } : undefined}
    />
  );
};

export const ErrorEmptyState = ({ onRetry }) => {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="Something went wrong"
      description="We couldn't load your data. Please try again."
      action={{ label: 'Try Again', onClick: onRetry, variant: 'secondary' }}
    />
  );
};

export const NoResultsEmptyState = ({ searchTerm, onClear }) => {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`No matches for "${searchTerm}". Try a different search term.`}
      action={{ label: 'Clear Search', onClick: onClear, variant: 'secondary' }}
    />
  );
};

export default EmptyState;

