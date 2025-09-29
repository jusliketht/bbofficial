import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  const baseClasses = 'rounded-lg border bg-card text-card-foreground shadow-sm';
  const classes = `${baseClasses} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => {
  const baseClasses = 'flex flex-col space-y-1.5 p-6';
  const classes = `${baseClasses} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '', ...props }) => {
  const baseClasses = 'text-2xl font-semibold leading-none tracking-tight';
  const classes = `${baseClasses} ${className}`;
  
  return (
    <h3 className={classes} {...props}>
      {children}
    </h3>
  );
};

const CardDescription = ({ children, className = '', ...props }) => {
  const baseClasses = 'text-sm text-muted-foreground';
  const classes = `${baseClasses} ${className}`;
  
  return (
    <p className={classes} {...props}>
      {children}
    </p>
  );
};

const CardContent = ({ children, className = '', ...props }) => {
  const baseClasses = 'p-6 pt-0';
  const classes = `${baseClasses} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  const baseClasses = 'flex items-center p-6 pt-0';
  const classes = `${baseClasses} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;