import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  glow?: boolean;
  active?: boolean;
}

/**
 * Unified Button component
 * Based on TransportLegend and PlayerPanel reference designs
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  glow = false,
  active = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'rounded-lg font-semibold transition-all flex items-center justify-center gap-2';

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  };

  const variantClasses = {
    primary: active
      ? 'bg-cyan-500 text-white'
      : 'bg-cyan-500 bg-opacity-20 border-2 border-cyan-500 text-cyan-400 hover:bg-opacity-30',
    secondary: active
      ? 'bg-pink-500 text-white'
      : 'bg-pink-500 bg-opacity-20 border-2 border-pink-500 text-pink-400 hover:bg-opacity-30',
    outline: active
      ? 'bg-gray-800 border-2 border-gray-600 text-white'
      : 'bg-transparent border-2 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300',
    ghost: active
      ? 'bg-gray-800 text-white'
      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed hover:bg-opacity-20'
    : '';

  const glowStyle = glow && variant === 'primary' && !disabled
    ? { boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }
    : glow && variant === 'secondary' && !disabled
    ? { boxShadow: '0 0 20px rgba(255, 20, 147, 0.3)' }
    : undefined;

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${disabledClasses} ${className}`}
      disabled={disabled}
      style={glowStyle}
      {...props}
    >
      {children}
    </button>
  );
}
