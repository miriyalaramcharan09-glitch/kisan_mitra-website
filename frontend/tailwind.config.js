/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: '#f2fbf4',
          100: '#e1f7e6',
          200: '#c3efcf',
          300: '#94e0a7',
          400: '#5dc87a',
          500: '#34ab55',
          600: '#238941',
          700: '#1e6d36',
          800: '#1c562e',
          900: '#184728',
        },
        earth: {
          50: '#faf8f5',
          100: '#f4ede2',
          200: '#e8dbc5',
          300: '#d7c09e',
          400: '#c3a174',
          500: '#b08753',
          600: '#996f43',
          700: '#7e5737',
          800: '#674731',
          900: '#553b2b',
        },
        amberGold: {
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
