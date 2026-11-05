/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        industrial: {
          950: '#080c13',
          900: '#0d131d',
          850: '#111827',
          800: '#151e2e',
          750: '#1a263a',
          700: '#223048',
          600: '#324563',
          500: '#486187',
          400: '#6d88b0',
          300: '#9db4d4',
          200: '#cbd8e9',
          100: '#e5ecf5',
          50: '#f4f7fb'
        },
        tealAccent: {
          DEFAULT: '#10b981',
          light: '#34d399',
          dark: '#059669',
          glow: 'rgba(16, 185, 129, 0.25)'
        },
        cyanAccent: {
          DEFAULT: '#06b6d4',
          light: '#22d3ee',
          dark: '#0891b2'
        },
        amberAccent: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
          glow: 'rgba(245, 158, 11, 0.25)'
        },
        dangerRed: {
          DEFAULT: '#ef4444',
          light: '#f87171',
          dark: '#dc2626'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace']
      },
      boxShadow: {
        'glow-teal': '0 0 20px -3px rgba(16, 185, 129, 0.3)',
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.3)',
        'glow-amber': '0 0 20px -3px rgba(245, 158, 11, 0.3)',
        'glow-danger': '0 0 20px -3px rgba(239, 68, 68, 0.3)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
