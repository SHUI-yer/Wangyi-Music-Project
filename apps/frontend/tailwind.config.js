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
          red: 'var(--primary-color)',
          darkRed: '#A40011',
          bg: 'var(--bg-color)',
          sidebar: 'var(--sidebar-bg)',
          border: 'var(--border-color)',
          // Correct Font Colors
          text: 'var(--text-primary)',     // Primary text (Titles, active items)
          subtext: 'var(--text-secondary)',  // Secondary text (Artists, descriptions)
          hint: '#999999',     // Hint text (Dates, play counts)
          headerText: '#FFFFFF' // Header text color
        }
      }
    },
  },
  plugins: [],
}