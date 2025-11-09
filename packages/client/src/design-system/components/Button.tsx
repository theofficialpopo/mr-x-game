import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
  {
    variants: {
      variant: {
        primary: 'bg-cyan-500 bg-opacity-20 border-2 border-cyan-500 text-cyan-400 hover:bg-opacity-30 focus:ring-cyan-500',
        secondary: 'bg-purple-500 bg-opacity-20 border-2 border-purple-500 text-purple-400 hover:bg-opacity-30 focus:ring-purple-500',
        danger: 'bg-red-500 bg-opacity-20 border-2 border-red-500 text-red-400 hover:bg-opacity-30 focus:ring-red-500',
        success: 'bg-green-500 bg-opacity-20 border-2 border-green-500 text-green-400 hover:bg-opacity-30 focus:ring-green-500',
        neutral: 'bg-gray-800 bg-opacity-50 border border-gray-700 text-gray-300 hover:bg-opacity-70 focus:ring-gray-500',
        ghost: 'border border-transparent text-gray-300 hover:bg-gray-800 hover:bg-opacity-50',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
      glow: {
        true: '',
        false: '',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'primary',
        glow: true,
        className: 'shadow-glow-cyan',
      },
      {
        variant: 'secondary',
        glow: true,
        className: 'shadow-glow-pink',
      },
      {
        variant: 'success',
        glow: true,
        className: 'shadow-glow-green',
      },
      {
        variant: 'danger',
        glow: true,
        className: 'shadow-glow-red',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      glow: false,
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, glow, fullWidth, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, glow, fullWidth, className })}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
