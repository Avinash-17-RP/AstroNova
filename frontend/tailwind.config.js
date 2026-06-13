/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#0a0e27',
          800: '#1a1f3a',
          700: '#2a2f4d',
          600: '#3a3f60',
        },
        neon: {
          blue: '#00d9ff',
          purple: '#d946ef',
          pink: '#ec4899',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
