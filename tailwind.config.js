/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        btg: {
          50:  '#e8f0fe',
          100: '#c5d8fd',
          200: '#9dbffc',
          300: '#6fa3fb',
          400: '#4a8bf9',
          500: '#1a6cf5',   // color principal de marca
          600: '#1258d6',
          700: '#0d44b0',
          800: '#09338a',
          900: '#052265',
          950: '#02122e',
        },
        surface: {
          DEFAULT: '#0d1117',
          card:    '#161b22',
          border:  '#21262d',
          muted:   '#30363d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,.5), 0 1px 2px rgba(0,0,0,.4)',
        glow: '0 0 20px rgba(26,108,245,.25)',
      }
    },
  },
  plugins: [],
}
