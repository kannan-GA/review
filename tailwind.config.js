/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F97316',
          lightorange: '#FFF7ED',
          dark: '#1C1C1E',
        }
      },
    },
  },
  plugins: [],
};
