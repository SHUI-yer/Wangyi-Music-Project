/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        netease: {
          red: '#C20C0C',
          darkRed: '#A40011',
          bg: '#FFFFFF',
          sidebar: '#F9F9F9',
          border: '#E1E1E1',
          // Correct Font Colors
          text: '#333333',     // Primary text (Titles, active items)
          subtext: '#666666',  // Secondary text (Artists, descriptions)
          hint: '#999999',     // Hint text (Dates, play counts)
          headerText: '#FFFFFF' // Header text color
        }
      }
    },
  },
  plugins: [],
}