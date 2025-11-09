import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'highlight' | 'mr-x' | 'detective';
  glow?: boolean;
  onClick?: () => void;
}

/**
 * Unified Card component with glass-morphism effect
 * Based on TransportLegend and PlayerPanel reference designs
 */
export function Card({
  children,
  className = '',
  variant = 'default',
  glow = false,
  onClick
}: CardProps) {
  const baseClasses = 'bg-black bg-opacity-60 backdrop-blur-sm rounded-lg border p-3 transition-all';

  const variantClasses = {
    default: 'border-gray-700 hover:border-gray-600',
    highlight: 'border-cyan-500 shadow-lg shadow-cyan-500/30',
    'mr-x': 'border-pink-500 shadow-lg shadow-pink-500/30',
    detective: 'border-cyan-500 shadow-lg shadow-cyan-500/30',
  };

  const glowStyle = glow && variant === 'highlight'
    ? { boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }
    : glow && variant === 'mr-x'
    ? { boxShadow: '0 0 20px rgba(255, 20, 147, 0.3)' }
    : undefined;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      style={glowStyle}
    >
      {children}
    </div>
  );
}
