import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  // Base styles
  'w-full rounded-lg border bg-gray-800 bg-opacity-50 text-white placeholder-gray-500 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'border-gray-700 focus:border-cyan-500',
        primary: 'border-cyan-500 border-opacity-50 focus:border-cyan-500',
        danger: 'border-red-500 border-opacity-50 focus:border-red-500',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-5 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={inputVariants({
            variant: error ? 'danger' : variant,
            size,
            className,
          })}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
