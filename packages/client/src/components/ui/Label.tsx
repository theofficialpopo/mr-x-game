import { ReactNode } from 'react';

interface LabelProps {
  children: ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  uppercase?: boolean;
}

/**
 * Unified Label component for consistent typography
 * Based on TransportLegend and PlayerPanel reference designs
 */
export function Label({
  children,
  className = '',
  size = 'xs',
  uppercase = true,
}: LabelProps) {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
  };

  const baseClasses = 'font-bold text-gray-400 tracking-wide';
  const uppercaseClass = uppercase ? 'uppercase' : '';

  return (
    <div className={`${baseClasses} ${sizeClasses[size]} ${uppercaseClass} ${className}`}>
      {children}
    </div>
  );
}
