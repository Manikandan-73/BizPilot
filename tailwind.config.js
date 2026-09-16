/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#090B10',
          secondary: '#0F1219',
          sidebar: '#0B0E14',
        },
        surface: {
          DEFAULT: '#121722',
          hover: '#171D29',
          elevated: '#161C27',
          input: '#0D1118',
          'input-hover': '#121824',
          'input-focus': '#151B28',
          dark: '#0B0E14',
          light: '#161C27'
        },
        border: {
          DEFAULT: '#222936',
          subtle: '#1C222E',
          strong: '#303848',
          dark: '#303848'
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#A7B0C0',
          muted: '#707A8C',
          disabled: '#4B5565',
        },
        primary: {
          DEFAULT: '#8B5CF6', // Violet
          hover: '#7C3AED',
          light: '#A78BFA',
          dark: '#6D28D9'
        },
        secondary: {
          DEFAULT: '#14B8A6', // Teal
          hover: '#0D9488',
          light: '#2DD4BF',
          dark: '#0F766E'
        },
        ai: {
          DEFAULT: '#14B8A6',
          highlight: '#8B5CF6',
          accent: '#A78BFA',
          light: '#2DD4BF',
        },
        violet: {
          DEFAULT: '#8B5CF6',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065'
        },
        teal: {
          DEFAULT: '#14B8A6',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          950: '#042F2E'
        },
        indigo: {
          DEFAULT: '#8B5CF6',
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065'
        },
        emerald: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857'
        },
        amber: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309'
        },
        rose: {
          DEFAULT: '#F43F5E',
          50: '#FFF1F2',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C'
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card-elevated': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
