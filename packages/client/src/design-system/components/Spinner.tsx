import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva(
  // Base styles
  'animate-spin rounded-full border-t-2 border-b-2',
  {
    variants: {
      variant: {
        primary: 'border-cyan-500',
        secondary: 'border-purple-500',
        success: 'border-green-500',
        danger: 'border-red-500',
        neutral: 'border-gray-500',
      },
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, variant, size, label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`inline-flex items-center gap-3 ${className || ''}`}
        {...props}
      >
        <div className={spinnerVariants({ variant, size })} />
        {label && <span className="text-gray-300">{label}</span>}
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';
