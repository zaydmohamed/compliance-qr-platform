/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2C3925', // Main dark green
          'primary-hover': '#212B1C',
          'primary-light': '#3D4F34',
          'primary-subtle': '#EEF2EC',
          accent: '#0086FF', // Vibrant blue
          'accent-hover': '#006ED6',
          'accent-light': '#E6F3FF',
          dark: '#2F2E2D', // Deep charcoal
          'dark-muted': '#5A5856',
          'dark-subtle': '#8C8986',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px -2px rgba(44, 57, 37, 0.08), 0 4px 20px -4px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 24px -4px rgba(44, 57, 37, 0.12), 0 4px 16px -2px rgba(0, 134, 255, 0.08)',
        'modal': '0 20px 40px -8px rgba(47, 46, 45, 0.25)',
      }
    },
  },
  plugins: [],
}
