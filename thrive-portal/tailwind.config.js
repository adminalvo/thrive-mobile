/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0A192F',
        surface: '#0D1E36',
        surfaceElevated: '#132847',
        border: '#1E3A5F',
        teal: {
          400: '#5ce1e6',
          500: '#4CA2B5',
          600: '#388899',
        },
      },
    },
  },
  plugins: [],
};
