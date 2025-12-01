// =====================================================
// ANIMATED NUMBER COMPONENT
// Smooth number transitions with Indian formatting
// =====================================================

import React, { useState, useEffect, useRef } from 'react';
import { formatIndianCurrency, formatIndianNumber } from '../../../lib/format';

const AnimatedNumber = ({
  value = 0,
  duration = 600,
  format = 'currency', // 'currency' | 'number'
  className = '',
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    const startTime = performance.now();

    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;

      setDisplayValue(Math.round(current));

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    prevValueRef.current = value;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration]);

  const formattedValue = format === 'currency'
    ? formatIndianCurrency(displayValue)
    : formatIndianNumber(displayValue);

  return (
    <span className={className} {...props}>
      {formattedValue}
    </span>
  );
};

export default AnimatedNumber;

