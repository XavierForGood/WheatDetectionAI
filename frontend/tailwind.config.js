/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wheat: {
          50: '#fbf9f1',
          100: '#f5f1de',
          200: '#ebe0bc',
          300: '#dec68f',
          400: '#d0a860',
          500: '#c58e42',
          600: '#aa7035',
          700: '#88542e',
          800: '#70432b',
          900: '#5c3826',
          950: '#331d13',
        },
        tech: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
