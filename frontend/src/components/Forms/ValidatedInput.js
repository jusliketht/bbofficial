import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { validationEngine } from '../utils/validation';

const ValidatedInput = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  className = '',
  context = {},
  autoCorrect = false,
  showSuggestions = true,
  maxLength,
  min,
  max,
  step,
  ...props
}) => {
  const [validationState, setValidationState] = useState({
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
    isTouched: false
  });
  const [isFocused, setIsFocused] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback(async (inputValue) => {
    setIsValidating(true);

    // Debounce validation for better UX
    setTimeout(async () => {
      try {
        let processedValue = inputValue;

        // Auto-correct if enabled
        if (autoCorrect && processedValue) {
          processedValue = validationEngine.autoCorrect(name, processedValue);
          if (processedValue !== inputValue) {
            onChange(processedValue);
          }
        }

        const result = validationEngine.validateField(name, processedValue, context);
        const suggestions = validationEngine.getSuggestions(name, processedValue, context);

        setValidationState({
          isValid: result.isValid,
          errors: result.errors,
          warnings: result.warnings,
          suggestions: [...result.suggestions, ...suggestions],
          isTouched: true
        });
      } catch (error) {
        console.error('Validation error:', error);
      } finally {
        setIsValidating(false);
      }
    }, 300);
  }, [name, context, autoCorrect, onChange]);

  // Real-time validation
  useEffect(() => {
    if (value && validationState.isTouched) {
      validateField(value);
    }
  }, [value, context, validateField, validationState.isTouched]);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (!validationState.isTouched) {
      validateField(e.target.value);
    }
    onBlur && onBlur(e);
  };

  const handleChange = (e) => {
    let newValue = e.target.value;

    // Auto-format specific fields
    if (name === 'pan' && newValue) {
      newValue = newValue.toUpperCase();
    }

    onChange(newValue);
  };

  const getInputClassName = () => {
    const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors mobile-form-input';

    if (disabled) {
      return `${baseClasses} bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed`;
    }

    if (!validationState.isTouched) {
      return `${baseClasses} border-gray-300 focus:ring-blue-500 focus:border-blue-500`;
    }

    if (validationState.errors.length > 0) {
      return `${baseClasses} border-red-300 focus:ring-red-500 focus:border-red-500`;
    }

    if (validationState.warnings.length > 0) {
      return `${baseClasses} border-yellow-300 focus:ring-yellow-500 focus:border-yellow-500`;
    }

    if (validationState.isValid && value) {
      return `${baseClasses} border-green-300 focus:ring-green-500 focus:border-green-500`;
    }

    return `${baseClasses} border-gray-300 focus:ring-blue-500 focus:border-blue-500`;
  };

  const getValidationIcon = () => {
    if (isValidating) {
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }

    if (!validationState.isTouched || !value) {
      return null;
    }

    if (validationState.errors.length > 0) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }

    if (validationState.warnings.length > 0) {
      return <Info className="w-4 h-4 text-yellow-500" />;
    }

    if (validationState.isValid) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }

    return null;
  };

  const getHelperText = () => {
    if (!validationState.isTouched) return null;

    if (validationState.errors.length > 0) {
      return validationState.errors[0].message;
    }

    if (validationState.warnings.length > 0) {
      return validationState.warnings[0].message;
    }

    if (validationState.isValid && value) {
      return '✓ Valid';
    }

    return null;
  };

  const getHelperTextColor = () => {
    if (!validationState.isTouched) return 'text-gray-500';

    if (validationState.errors.length > 0) return 'text-red-600';
    if (validationState.warnings.length > 0) return 'text-yellow-600';
    if (validationState.isValid && value) return 'text-green-600';

    return 'text-gray-500';
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          className={getInputClassName()}
          {...props}
        />

        {/* Validation Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {getValidationIcon()}
        </div>
      </div>

      {/* Helper Text */}
      {getHelperText() && (
        <p className={`text-xs ${getHelperTextColor()}`}>
          {getHelperText()}
        </p>
      )}

      {/* Suggestions */}
      {showSuggestions && validationState.suggestions.length > 0 && (isFocused || validationState.errors.length > 0) && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Suggestions:</p>
              <ul className="text-xs text-blue-800 space-y-1">
                {validationState.suggestions.slice(0, 3).map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {validationState.warnings.length > 0 && validationState.isTouched && (
        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-900 mb-1">Please Note:</p>
              <ul className="text-xs text-yellow-800 space-y-1">
                {validationState.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{warning.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Errors */}
      {validationState.errors.length > 0 && validationState.isTouched && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900 mb-1">Please Fix:</p>
              <ul className="text-xs text-red-800 space-y-1">
                {validationState.errors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{error.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidatedInput;
