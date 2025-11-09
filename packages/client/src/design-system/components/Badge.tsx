import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  // Base styles
  'inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-cyan-500 bg-opacity-20 border-cyan-500 text-cyan-400',
        secondary: 'bg-purple-500 bg-opacity-20 border-purple-500 text-purple-400',
        success: 'bg-green-500 bg-opacity-20 border-green-500 text-green-400',
        danger: 'bg-red-500 bg-opacity-20 border-red-500 text-red-400',
        warning: 'bg-yellow-500 bg-opacity-20 border-yellow-500 text-yellow-400',
        neutral: 'bg-gray-700 bg-opacity-40 border-gray-600 text-gray-300',
        gold: 'bg-yellow-500 bg-opacity-20 border-yellow-500 text-yellow-400',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={badgeVariants({ variant, size, className })}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
