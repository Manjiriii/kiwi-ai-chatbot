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
        brand: {
          dark: '#0A0F1D',      // Deep midnight navy
          surface: '#111827',   // Rich charcoal navy
          card: '#182234',      // Card surface
          border: '#243248',    // Dark border
          teal: '#0EA5E9',      // Tech cyan/teal
          emerald: '#10B981',   // Parrot emerald green
          mint: '#34D399',      // Soft parrot green
          yellow: '#F59E0B',    // Parrot beak/crest yellow
          coral: '#F43F5E',     // Subtle parrot feather accent
        },
      },
      animation: {
        'subtle-pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'blink': 'blink 4s infinite',
        'wing-flap': 'wingFlap 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        blink: {
          '0%, 90%, 100%': { transform: 'scaleY(1)' },
          '95%': { transform: 'scaleY(0.1)' },
        },
        wingFlap: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(4deg)' },
        }
      }
    },
  },
  plugins: [],
}
