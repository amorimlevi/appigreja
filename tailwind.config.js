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
        'church-purple': {
          50: '#f7f4ff',
          100: '#ede7ff', 
          200: '#ddd3ff',
          300: '#c8b5ff',
          400: '#b19ce1',
          500: '#9f7aea',
          600: '#8b5cf6',
          700: '#7c3aed',
          800: '#6b46c1',
          900: '#553c9a'
        }
      }
    },
  },
  plugins: [],
}
