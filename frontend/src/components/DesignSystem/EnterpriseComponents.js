// =====================================================
// ENTERPRISE COMPONENT LIBRARY - PIXEL PERFECT CONSISTENCY
// All components use the same design tokens and classes
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';
import { ENTERPRISE_CLASSES, getEnterpriseClasses } from './EnterpriseDesignSystem';

// =====================================================
// ENTERPRISE CARD COMPONENT
// =====================================================

export const EnterpriseCard = ({ 
  children, 
  className = '', 
  hover = true, 
  interactive = false,
  padding = 'md',
  ...props 
}) => {
  const baseClasses = getEnterpriseClasses('card', 'base');
  const hoverClasses = hover ? getEnterpriseClasses('card', 'hover') : '';
  const interactiveClasses = interactive ? getEnterpriseClasses('card', 'interactive') : '';
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// =====================================================
// ENTERPRISE BUTTON COMPONENT
// =====================================================

export const EnterpriseButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  ...props 
}) => {
  const baseClasses = getEnterpriseClasses('button', variant);
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`${baseClasses} ${disabledClasses} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// =====================================================
// ENTERPRISE BADGE COMPONENT
// =====================================================

export const EnterpriseBadge = ({ 
  children, 
  variant = 'neutral', 
  className = '',
  ...props 
}) => {
  const badgeClasses = getEnterpriseClasses('badge', variant);
  
  return (
    <span 
      className={`${badgeClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// =====================================================
// ENTERPRISE PROGRESS COMPONENT
// =====================================================

export const EnterpriseProgress = ({ 
  value = 0, 
  max = 100, 
  variant = 'primary',
  className = '',
  showLabel = false,
  ...props 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const progressClasses = getEnterpriseClasses('progress', variant);
  
  return (
    <div className={`${className}`} {...props}>
      {showLabel && (
        <div className="flex justify-between text-sm text-neutral-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={getEnterpriseClasses('progress', 'base')}>
        <motion.div 
          className={progressClasses}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// =====================================================
// ENTERPRISE INPUT COMPONENT
// =====================================================

export const EnterpriseInput = ({ 
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  error = false,
  className = '',
  ...props 
}) => {
  const inputClasses = getEnterpriseClasses('input', error ? 'error' : 'base');
  
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`${inputClasses} ${className}`}
      {...props}
    />
  );
};

// =====================================================
// ENTERPRISE STAT CARD COMPONENT
// =====================================================

export const EnterpriseStatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  color = 'primary',
  onClick,
  className = '',
  ...props 
}) => {
  const changeColorMap = {
    positive: 'text-success-600',
    negative: 'text-error-600',
    neutral: 'text-neutral-600'
  };
  
  const changeIconMap = {
    positive: '↗',
    negative: '↘',
    neutral: '→'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${getEnterpriseClasses('card', 'base')} ${onClick ? getEnterpriseClasses('card', 'interactive') : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
          {change && (
            <p className={`text-sm ${changeColorMap[changeType]} flex items-center mt-1`}>
              <span className="mr-1">{changeIconMap[changeType]}</span>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

// =====================================================
// ENTERPRISE LOADING SPINNER COMPONENT
// =====================================================

export const EnterpriseSpinner = ({ 
  size = 'md',
  color = 'primary',
  className = '',
  ...props 
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  return (
    <div className={`${className}`} {...props}>
      <div className={`${sizeMap[size]} animate-spin rounded-full border-2 border-${color}-200 border-t-${color}-600`} />
    </div>
  );
};

// =====================================================
// ENTERPRISE ALERT COMPONENT
// =====================================================

export const EnterpriseAlert = ({ 
  type = 'info',
  title,
  message,
  className = '',
  ...props 
}) => {
  const alertClasses = {
    info: 'bg-primary-50 border-primary-200 text-primary-800',
    success: 'bg-success-50 border-success-200 text-success-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    error: 'bg-error-50 border-error-200 text-error-800'
  };
  
  const iconMap = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  return (
    <div className={`${alertClasses[type]} border rounded-lg p-4 ${className}`} {...props}>
      <div className="flex items-start">
        <span className="text-lg mr-3">{iconMap[type]}</span>
        <div>
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// ENTERPRISE MODAL COMPONENT
// =====================================================

export const EnterpriseModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className = '',
  ...props 
}) => {
  if (!isOpen) return null;
  
  const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`${sizeMap[size]} w-full ${getEnterpriseClasses('card', 'base')} ${className}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {title && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </motion.div>
    </motion.div>
  );
};

export default {
  EnterpriseCard,
  EnterpriseButton,
  EnterpriseBadge,
  EnterpriseProgress,
  EnterpriseInput,
  EnterpriseStatCard,
  EnterpriseSpinner,
  EnterpriseAlert,
  EnterpriseModal
};
