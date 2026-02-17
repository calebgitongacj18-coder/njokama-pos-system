/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      // You can add custom colors here if needed to match the logo
      colors: {
        njokama: {
          blue: '#2563eb',
          dark: '#010409',
        }
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"), // Required for your App.js "animate-in" classes
  ],
}