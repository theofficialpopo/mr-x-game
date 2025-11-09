/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00CED1',
          light: '#06b6d4',
          dark: '#0891b2',
        },
        secondary: {
          DEFAULT: '#FF1493',
          light: '#ec4899',
          dark: '#be185d',
        },
        accent: {
          DEFAULT: '#FFD700',
          light: '#fbbf24',
          dark: '#f59e0b',
        },
        transport: {
          taxi: '#FFD700',
          bus: '#32CD32',
          underground: '#FF1493',
          water: '#00CED1',
          black: '#1a1a1a',
        },
        role: {
          mrx: '#FF1493',
          detective: '#00CED1',
        },
      },
      boxShadow: {
        // Glow effects for components
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.3)',
        'glow-cyan-strong': '0 0 20px rgba(6, 182, 212, 0.6)',
        'glow-pink': '0 0 20px rgba(255, 20, 147, 0.6)',
        'glow-gold': '0 0 20px rgba(251, 191, 36, 0.4)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.4)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.4)',
        // Legacy support
        'neon': '0 0 20px rgba(0, 217, 255, 0.6)',
        'neon-pink': '0 0 20px rgba(255, 20, 147, 0.6)',
      },
      textShadow: {
        'glow-cyan': '0 0 40px rgba(6, 182, 212, 0.8)',
        'glow-pink': '0 0 40px rgba(255, 20, 147, 0.8)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.5)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
      },
    },
  },
  plugins: [
    // Plugin to add text-shadow utilities
    function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    },
  ],
}
