/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00D9FF',
        secondary: '#FF1493',
        accent: '#FFD700',
        transport: {
          taxi: '#FFD700',
          bus: '#32CD32',
          underground: '#FF1493',
          water: '#00CED1',
        }
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 217, 255, 0.6)',
        'neon-pink': '0 0 20px rgba(255, 20, 147, 0.6)',
      }
    },
  },
  plugins: [],
}
