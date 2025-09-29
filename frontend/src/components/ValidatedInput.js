import React from 'react';
import Input from './UI/input';
import Label from './UI/label';

const ValidatedInput = ({ 
  label, 
  error, 
  required = false, 
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Input
        {...props}
        className={`${props.className || ''} ${
          error ? 'border-red-500 focus:border-red-500' : ''
        }`}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export { ValidatedInput };
export default ValidatedInput;
