/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#111827',
          800: '#1F2937',
          700: '#374151',
          600: '#4B5563',
          500: '#6B7280',
          400: '#9CA3AF',
          300: '#D1D5DB',
          200: '#E5E7EB',
          100: '#F3F4F6',
          50: '#F9FAFB',
        },
        blue: {
          500: '#3B82F6',
          400: '#60A5FA',
          300: '#93C5FD',
        },
        purple: {
          500: '#8B5CF6',
          400: '#A78BFA',
          300: '#C4B5FD',
        },
        green: {
          500: '#10B981',
          400: '#34D399',
          300: '#6EE7B7',
        },
        red: {
          500: '#EF4444',
          400: '#F87171',
          300: '#FCA5A5',
        },
        orange: {
          500: '#F59E0B',
          400: '#FBBF24',
          300: '#FCD34D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

