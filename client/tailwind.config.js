/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFB800',
        secondary: '#FF6B35',
        accent: '#E63946',
      },
    },
  },
  plugins: [],
}

