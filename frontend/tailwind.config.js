/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vodafone Brand Colors
        vodafone: {
          red: '#E60000',
          'red-dark': '#C00000',
          charcoal: '#4A4D4E',
          gray: '#333333',
          'light-gray': '#F4F4F4',
        },
        // Extend default theme colors
        primary: {
          DEFAULT: '#E60000',
          foreground: '#FFFFFF',
          50: '#FFE5E5',
          100: '#FFCCCC',
          200: '#FF9999',
          300: '#FF6666',
          400: '#FF3333',
          500: '#E60000',
          600: '#CC0000',
          700: '#990000',
          800: '#660000',
          900: '#330000',
        },
        secondary: {
          DEFAULT: '#4A4D4E',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#F4F4F4',
          foreground: '#333333',
        },
        background: '#FFFFFF',
        foreground: '#333333',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#333333',
        },
        border: '#E5E5E5',
        input: '#E5E5E5',
        ring: '#E60000',
        muted: {
          DEFAULT: '#F4F4F4',
          foreground: '#666666',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'vodafone': '0 4px 20px rgba(230, 0, 0, 0.1)',
        'vodafone-lg': '0 10px 40px rgba(230, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
