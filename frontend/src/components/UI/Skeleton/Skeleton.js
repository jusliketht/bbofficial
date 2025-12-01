// =====================================================
// SKELETON COMPONENT
// Loading placeholders with shimmer animation
// =====================================================

import React from 'react';
import { cn } from '../../../lib/utils';

const Skeleton = ({
  variant = 'text', // 'text' | 'card' | 'avatar' | 'table'
  width,
  height,
  className = '',
  ...props
}) => {
  const baseClasses = 'animate-shimmer bg-gray-200 rounded';

  if (variant === 'avatar') {
    return (
      <div
        className={cn('rounded-full', baseClasses, className)}
        style={{
          width: width || height || '40px',
          height: height || width || '40px',
        }}
        {...props}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('p-4 rounded-lg border border-gray-200', className)} {...props}>
        <div className={cn('mb-3', baseClasses)} style={{ width: '60%', height: '20px' }} />
        <div className={cn('mb-2', baseClasses)} style={{ width: '100%', height: '16px' }} />
        <div className={cn('mb-2', baseClasses)} style={{ width: '90%', height: '16px' }} />
        <div className={cn(baseClasses)} style={{ width: '70%', height: '16px' }} />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={cn('space-y-2', className)} {...props}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex space-x-4">
            <div className={cn('flex-1', baseClasses)} style={{ height: '20px' }} />
            <div className={cn('w-24', baseClasses)} style={{ height: '20px' }} />
            <div className={cn('w-20', baseClasses)} style={{ height: '20px' }} />
          </div>
        ))}
      </div>
    );
  }

  // Text variant (default)
  return (
    <div
      className={cn(baseClasses, className)}
      style={{
        width: width || '100%',
        height: height || '16px',
      }}
      {...props}
    />
  );
};

export default Skeleton;

