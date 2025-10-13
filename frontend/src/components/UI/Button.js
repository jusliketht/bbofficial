// =====================================================
// ENHANCED BUTTON COMPONENT - DESIGN SYSTEM INTEGRATION
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';

const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  className = '', 
  onClick,
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500 shadow-sm hover:shadow-md',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus-visible:ring-secondary-500 shadow-sm hover:shadow-md',
    outline: 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 focus-visible:ring-primary-500',
    ghost: 'text-neutral-700 hover:bg-neutral-100 focus-visible:ring-primary-500',
    success: 'bg-success-500 text-white hover:bg-success-600 focus-visible:ring-success-500 shadow-sm hover:shadow-md',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 focus-visible:ring-warning-500 shadow-sm hover:shadow-md',
    error: 'bg-error-500 text-white hover:bg-error-600 focus-visible:ring-error-500 shadow-sm hover:shadow-md',
  };
  
  const sizes = {
    xs: 'h-8 px-2 text-xs rounded-md',
    sm: 'h-9 px-3 text-sm rounded-md',
    md: 'h-10 px-4 text-sm rounded-lg',
    lg: 'h-11 px-6 text-base rounded-lg',
    xl: 'h-12 px-8 text-lg rounded-xl',
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <motion.button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      {...props}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;