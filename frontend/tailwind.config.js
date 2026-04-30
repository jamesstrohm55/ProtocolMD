/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        clinical: {
          50: '#f0f9ff',
          300: '#7dd3fc',
          500: '#0ea5e9',
          700: '#0369a1',
          900: '#0c4a6e'
        }
      }
    }
  },
  plugins: []
}

