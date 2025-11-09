interface RoleIconProps {
  role: 'mr-x' | 'detective';
  size?: 'sm' | 'md' | 'lg';
  showBorder?: boolean;
}

/**
 * Unified RoleIcon component for Mr. X and Detective
 * Based on PlayerPanel reference design
 */
export function RoleIcon({ role, size = 'md', showBorder = true }: RoleIconProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const roleStyles = {
    'mr-x': {
      bg: 'bg-pink-500 bg-opacity-20',
      border: 'border-pink-500',
      text: 'text-pink-400',
      icon: '❓',
    },
    'detective': {
      bg: 'bg-cyan-500 bg-opacity-20',
      border: 'border-cyan-500',
      text: 'text-cyan-400',
      icon: '🔍',
    },
  };

  const style = roleStyles[role];
  const borderClass = showBorder ? `border-2 ${style.border}` : '';

  return (
    <div
      className={`${sizeClasses[size]} ${style.bg} ${borderClass} ${style.text} rounded-full flex items-center justify-center flex-shrink-0`}
    >
      {style.icon}
    </div>
  );
}
