/**
 * Design System Theme Constants
 * Centralized color palette and design tokens
 */

export const colors = {
  // Primary brand colors
  primary: {
    DEFAULT: '#00CED1', // Cyan
    light: '#06b6d4',
    dark: '#0891b2',
  },
  secondary: {
    DEFAULT: '#FF1493', // Deep Pink
    light: '#ec4899',
    dark: '#be185d',
  },
  accent: {
    DEFAULT: '#FFD700', // Gold
    light: '#fbbf24',
    dark: '#f59e0b',
  },

  // Transport colors (from shared constants)
  transport: {
    taxi: '#FFD700',
    bus: '#32CD32',
    underground: '#FF1493',
    water: '#00CED1',
    black: '#1a1a1a',
  },

  // Role-based colors
  role: {
    mrx: '#FF1493',
    detective: '#00CED1',
  },

  // Semantic colors
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Neutral palette
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
} as const;

export const opacity = {
  10: '10',
  20: '20',
  40: '40',
  60: '60',
  80: '80',
  100: '100',
} as const;

export const spacing = {
  xs: '0.5rem',  // 8px
  sm: '0.75rem', // 12px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '3rem', // 48px
} as const;

export const borderRadius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  full: '9999px',
} as const;

export const shadows = {
  glow: {
    cyan: '0 0 20px rgba(6, 182, 212, 0.3)',
    'cyan-strong': '0 0 20px rgba(6, 182, 212, 0.6)',
    pink: '0 0 20px rgba(255, 20, 147, 0.6)',
    gold: '0 0 20px rgba(251, 191, 36, 0.4)',
    green: '0 0 20px rgba(34, 197, 94, 0.4)',
    red: '0 0 20px rgba(239, 68, 68, 0.4)',
  },
  text: {
    cyan: '0 0 40px rgba(6, 182, 212, 0.8)',
    pink: '0 0 40px rgba(255, 20, 147, 0.8)',
    green: '0 0 20px rgba(34, 197, 94, 0.5)',
    red: '0 0 20px rgba(239, 68, 68, 0.5)',
  },
} as const;

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',
} as const;
