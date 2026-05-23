/**
 * AnimatedNumber Component
 * 
 * Displays a number with smooth count-up animation.
 * Great for displaying monetary values, counts, or percentages.
 */

import { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: 'currency' | 'percent' | 'default';
  currency?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export default function AnimatedNumber({
  value,
  duration = 600,
  format = 'default',
  currency = 'PLN',
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  const formatValue = () => {
    if (format === 'currency') {
      return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(displayValue);
    }

    if (format === 'percent') {
      return `${displayValue.toFixed(decimals)}%`;
    }

    return displayValue.toLocaleString('pl-PL', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <span className={`count-animate ${className}`}>
      {prefix}
      {formatValue()}
      {suffix}
    </span>
  );
}
