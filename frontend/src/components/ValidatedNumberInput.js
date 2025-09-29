import React from 'react';
import Input from './UI/input';
import Label from './UI/label';

const ValidatedNumberInput = ({ 
  label, 
  error, 
  required = false,
  min = 0,
  max,
  step = 1,
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
        type="number"
        min={min}
        max={max}
        step={step}
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

export { ValidatedNumberInput };
export default ValidatedNumberInput;
