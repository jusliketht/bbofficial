// =====================================================
// ENHANCED CARD COMPONENT - DESIGN SYSTEM INTEGRATION
// =====================================================

import React from 'react';
import { motion } from 'framer-motion';

const Card = React.forwardRef(({ 
  children, 
  className = '', 
  hover = false,
  ...props 
}, ref) => {
  const baseClasses = 'rounded-xl border bg-white text-neutral-900 shadow-sm transition-all duration-200';
  const hoverClasses = hover ? 'hover:shadow-md hover:scale-[1.01] cursor-pointer' : '';
  const classes = `${baseClasses} ${hoverClasses} ${className}`;
  
  return (
    <motion.div
      ref={ref}
      className={classes}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ children, className = '', ...props }, ref) => {
  const baseClasses = 'flex flex-col space-y-1.5 p-6';
  const classes = `${baseClasses} ${className}`;
  
  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ children, className = '', ...props }, ref) => {
  const baseClasses = 'text-xl font-semibold leading-none tracking-tight';
  const classes = `${baseClasses} ${className}`;
  
  return (
    <h3 ref={ref} className={classes} {...props}>
      {children}
    </h3>
  );
});

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ children, className = '', ...props }, ref) => {
  const baseClasses = 'text-sm text-neutral-600';
  const classes = `${baseClasses} ${className}`;
  
  return (
    <p ref={ref} className={classes} {...props}>
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ children, className = '', ...props }, ref) => {
  const baseClasses = 'p-6 pt-0';
  const classes = `${baseClasses} ${className}`;
  
  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ children, className = '', ...props }, ref) => {
  const baseClasses = 'flex items-center p-6 pt-0';
  const classes = `${baseClasses} ${className}`;
  
  return (
    <div ref={ref} className={classes} {...props}>
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;