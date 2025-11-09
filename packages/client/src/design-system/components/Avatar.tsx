import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const avatarVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-full border-2 font-bold',
  {
    variants: {
      variant: {
        mrx: 'bg-pink-500 bg-opacity-20 border-pink-500 text-pink-400',
        detective: 'bg-cyan-500 bg-opacity-20 border-cyan-500 text-cyan-400',
        neutral: 'bg-gray-700 bg-opacity-40 border-gray-600 text-gray-300',
      },
      size: {
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-2xl',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  children: React.ReactNode;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={avatarVariants({ variant, size, className })}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
