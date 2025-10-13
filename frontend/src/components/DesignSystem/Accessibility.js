// =====================================================
// BURNBACK ACCESSIBILITY SYSTEM - A11Y COMPLIANCE
// Comprehensive accessibility utilities and components
// =====================================================

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// =====================================================
// ACCESSIBILITY UTILITIES
// =====================================================

export const A11yUtils = {
  // Generate unique IDs for form elements
  generateId: (prefix = 'element') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },
  
  // Check if element is visible to screen readers
  isVisibleToScreenReader: (element) => {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      rect.width > 0 &&
      rect.height > 0
    );
  },
  
  // Get contrast ratio between two colors
  getContrastRatio: (color1, color2) => {
    const getLuminance = (color) => {
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;
      
      const [r, g, b] = rgb.map(c => {
        c = parseInt(c) / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  },
  
  // Check if contrast meets WCAG standards
  meetsContrastStandard: (color1, color2, level = 'AA') => {
    const ratio = A11yUtils.getContrastRatio(color1, color2);
    const standards = {
      AA: { normal: 4.5, large: 3 },
      AAA: { normal: 7, large: 4.5 }
    };
    
    return ratio >= standards[level].normal;
  },
};

// =====================================================
// SCREEN READER UTILITIES
// =====================================================

export const ScreenReaderOnly = ({ children, className = '', ...props }) => {
  return (
    <span 
      className={`sr-only ${className}`} 
      {...props}
    >
      {children}
    </span>
  );
};

export const VisuallyHidden = ({ children, className = '', ...props }) => {
  return (
    <span 
      className={`absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 ${className}`} 
      {...props}
    >
      {children}
    </span>
  );
};

// =====================================================
// FOCUS MANAGEMENT
// =====================================================

export const FocusTrap = ({ children, isActive = false, className = '' }) => {
  const trapRef = useRef(null);
  
  useEffect(() => {
    if (!isActive || !trapRef.current) return;
    
    const focusableElements = trapRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);
  
  return (
    <div ref={trapRef} className={className}>
      {children}
    </div>
  );
};

export const FocusManager = ({ children, className = '' }) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleFocusIn = (e) => {
      // Ensure focus stays within container
      if (!container.contains(e.target)) {
        const firstFocusable = container.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }
    };
    
    document.addEventListener('focusin', handleFocusIn);
    
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
    };
  }, []);
  
  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// =====================================================
// ARIA LIVE REGIONS
// =====================================================

export const AriaLiveRegion = ({ 
  children, 
  level = 'polite', 
  className = '' 
}) => {
  return (
    <div 
      className={`sr-only ${className}`}
      aria-live={level}
      aria-atomic="true"
    >
      {children}
    </div>
  );
};

export const StatusAnnouncer = ({ message, level = 'polite' }) => {
  const [announcement, setAnnouncement] = useState('');
  
  useEffect(() => {
    if (message) {
      setAnnouncement(message);
      // Clear announcement after screen reader has time to read it
      const timer = setTimeout(() => setAnnouncement(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  
  return (
    <AriaLiveRegion level={level}>
      {announcement}
    </AriaLiveRegion>
  );
};

// =====================================================
// KEYBOARD NAVIGATION
// =====================================================

export const KeyboardNavigation = ({ children, className = '' }) => {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleKeyDown = (e) => {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
      
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % focusableElements.length;
          focusableElements[nextIndex]?.focus();
          break;
          
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          const prevIndex = currentIndex === 0 
            ? focusableElements.length - 1 
            : currentIndex - 1;
          focusableElements[prevIndex]?.focus();
          break;
          
        case 'Home':
          e.preventDefault();
          focusableElements[0]?.focus();
          break;
          
        case 'End':
          e.preventDefault();
          focusableElements[focusableElements.length - 1]?.focus();
          break;
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

// =====================================================
// ACCESSIBLE FORM COMPONENTS
// =====================================================

export const AccessibleInput = React.forwardRef(({ 
  id,
  label,
  error,
  helpText,
  required = false,
  className = '',
  ...props 
}, ref) => {
  const inputId = id || A11yUtils.generateId('input');
  const errorId = `${inputId}-error`;
  const helpId = `${inputId}-help`;
  
  const describedBy = [
    error && errorId,
    helpText && helpId
  ].filter(Boolean).join(' ');
  
  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={inputId}
        className="block text-sm font-medium text-neutral-700"
      >
        {label}
        {required && (
          <span className="text-error-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      <input
        ref={ref}
        id={inputId}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
          error ? 'border-error-300' : 'border-neutral-300'
        }`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy || undefined}
        required={required}
        {...props}
      />
      
      {helpText && (
        <p id={helpId} className="text-sm text-neutral-600">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-error-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

AccessibleInput.displayName = 'AccessibleInput';

export const AccessibleButton = React.forwardRef(({ 
  children,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      className={`px-4 py-2 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${className}`}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      {children}
    </button>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

// =====================================================
// ACCESSIBLE MODAL
// =====================================================

export const AccessibleModal = ({ 
  isOpen,
  onClose,
  title,
  children,
  className = ''
}) => {
  const modalRef = useRef(null);
  const titleId = A11yUtils.generateId('modal-title');
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <FocusTrap isActive={isOpen}>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Modal Content */}
        <motion.div
          ref={modalRef}
          className={`relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 ${className}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          tabIndex={-1}
        >
          <div className="p-6">
            <h2 id={titleId} className="text-xl font-semibold mb-4">
              {title}
            </h2>
            {children}
          </div>
        </motion.div>
      </div>
    </FocusTrap>
  );
};

// =====================================================
// ACCESSIBLE TOOLTIP
// =====================================================

export const AccessibleTooltip = ({ 
  children,
  content,
  position = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  
  const positions = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };
  
  return (
    <div className={`relative inline-block ${className}`}>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-describedby={isVisible ? 'tooltip' : undefined}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className={`absolute z-10 px-2 py-1 text-sm text-white bg-neutral-800 rounded ${positions[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

// =====================================================
// EXPORTS
// =====================================================

export default {
  A11yUtils,
  ScreenReaderOnly,
  VisuallyHidden,
  FocusTrap,
  FocusManager,
  AriaLiveRegion,
  StatusAnnouncer,
  KeyboardNavigation,
  AccessibleInput,
  AccessibleButton,
  AccessibleModal,
  AccessibleTooltip,
};
