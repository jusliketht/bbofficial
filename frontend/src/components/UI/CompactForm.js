// =====================================================
// COMPACT FORM COMPONENTS - MOBILE-FIRST DENSE FORMS
// Efficient form layouts with maximum information density
// =====================================================

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff, AlertCircle, CheckCircle, Info } from 'lucide-react';

// =====================================================
// COMPACT INPUT COMPONENT
// =====================================================

export const CompactInput = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  success,
  disabled = false,
  required = false,
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconClick,
  className = '',
  size = 'md',
  variant = 'default',
  helpText,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-4 py-4 text-lg'
  };

  const variantClasses = {
    default: 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
    error: 'border-error-500 focus:border-error-500 focus:ring-error-500',
    success: 'border-success-500 focus:border-success-500 focus:ring-success-500'
  };

  const getVariant = () => {
    if (error) return 'error';
    if (success) return 'success';
    return variant;
  };

  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon className={`w-4 h-4 ${isFocused ? 'text-primary-500' : 'text-neutral-400'}`} />
          </div>
        )}
        
        <input
          ref={inputRef}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full border rounded-lg transition-all duration-200
            ${sizeClasses[size]}
            ${Icon ? 'pl-10' : 'pl-4'}
            ${RightIcon || type === 'password' ? 'pr-10' : 'pr-4'}
            ${variantClasses[getVariant()]}
            ${disabled ? 'bg-neutral-100 cursor-not-allowed' : 'bg-white'}
            ${isFocused ? 'ring-2 ring-opacity-20' : ''}
            focus:outline-none
          `}
          {...props}
        />
        
        {(RightIcon || type === 'password') && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {type === 'password' ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={onRightIconClick}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <RightIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Status indicators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {error && (
            <div className="flex items-center space-x-1 text-error-600">
              <AlertCircle className="w-3 h-3" />
              <span className="text-xs">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center space-x-1 text-success-600">
              <CheckCircle className="w-3 h-3" />
              <span className="text-xs">{success}</span>
            </div>
          )}
        </div>
        
        {helpText && (
          <div className="flex items-center space-x-1 text-neutral-500">
            <Info className="w-3 h-3" />
            <span className="text-xs">{helpText}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================
// COMPACT SELECT COMPONENT
// =====================================================

export const CompactSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  success,
  disabled = false,
  required = false,
  icon: Icon,
  className = '',
  size = 'md',
  variant = 'default',
  helpText,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const selectRef = useRef(null);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-4 py-4 text-lg'
  };

  const variantClasses = {
    default: 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
    error: 'border-error-500 focus:border-error-500 focus:ring-error-500',
    success: 'border-success-500 focus:border-success-500 focus:ring-success-500'
  };

  const getVariant = () => {
    if (error) return 'error';
    if (success) return 'success';
    return variant;
  };

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative" ref={selectRef}>
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <Icon className={`w-4 h-4 ${isFocused ? 'text-primary-500' : 'text-neutral-400'}`} />
          </div>
        )}
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full border rounded-lg transition-all duration-200 text-left
            ${sizeClasses[size]}
            ${Icon ? 'pl-10' : 'pl-4'}
            pr-10
            ${variantClasses[getVariant()]}
            ${disabled ? 'bg-neutral-100 cursor-not-allowed' : 'bg-white cursor-pointer'}
            ${isFocused ? 'ring-2 ring-opacity-20' : ''}
            focus:outline-none
          `}
          {...props}
        >
          <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </button>
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-neutral-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          )}
        </div>
        
        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2 text-left text-sm hover:bg-neutral-100 transition-colors
                  ${option.value === value ? 'bg-primary-50 text-primary-700' : 'text-neutral-900'}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Status indicators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {error && (
            <div className="flex items-center space-x-1 text-error-600">
              <AlertCircle className="w-3 h-3" />
              <span className="text-xs">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center space-x-1 text-success-600">
              <CheckCircle className="w-3 h-3" />
              <span className="text-xs">{success}</span>
            </div>
          )}
        </div>
        
        {helpText && (
          <div className="flex items-center space-x-1 text-neutral-500">
            <Info className="w-3 h-3" />
            <span className="text-xs">{helpText}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================
// COMPACT FORM GROUP
// =====================================================

export const CompactFormGroup = ({
  title,
  subtitle,
  children,
  className = '',
  required = false,
  error,
  success
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || subtitle) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
              {title}
              {required && <span className="text-error-500 ml-1">*</span>}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-neutral-600">{subtitle}</p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
      
      {(error || success) && (
        <div className="flex items-center space-x-2">
          {error && (
            <div className="flex items-center space-x-1 text-error-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center space-x-1 text-success-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =====================================================
// COMPACT FORM LAYOUT
// =====================================================

export const CompactFormLayout = ({
  children,
  columns = { sm: 1, md: 2, lg: 2 },
  gap = '6',
  className = ''
}) => {
  const gridClasses = `
    grid gap-${gap}
    grid-cols-${columns.sm}
    md:grid-cols-${columns.md}
    lg:grid-cols-${columns.lg}
    ${className}
  `;

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

// =====================================================
// COMPACT FORM ACTIONS
// =====================================================

export const CompactFormActions = ({
  children,
  className = '',
  align = 'right'
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <div className={`flex items-center space-x-3 ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
};

// =====================================================
// COMPACT BUTTON
// =====================================================

export const CompactButton = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500',
    success: 'bg-success-500 text-white hover:bg-success-600 focus:ring-success-500',
    error: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500',
    outline: 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus:ring-primary-500',
    ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-primary-500'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
      )}
      {Icon && !loading && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

export default {
  CompactInput,
  CompactSelect,
  CompactFormGroup,
  CompactFormLayout,
  CompactFormActions,
  CompactButton
};
