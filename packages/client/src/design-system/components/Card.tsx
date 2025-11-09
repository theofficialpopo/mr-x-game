import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  // Base styles
  'bg-black bg-opacity-60 backdrop-blur-sm rounded-lg border',
  {
    variants: {
      variant: {
        default: 'border-gray-700',
        primary: 'border-cyan-500 border-opacity-50',
        secondary: 'border-purple-500 border-opacity-50',
        success: 'border-green-500 border-opacity-50',
        danger: 'border-red-500 border-opacity-50',
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
      elevated: {
        true: 'shadow-2xl',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      elevated: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, elevated, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cardVariants({ variant, padding, elevated, className })}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 ${className || ''}`}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-xl font-bold tracking-tight ${className || ''}`}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={className} {...props} />
));

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center ${className || ''}`}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';
