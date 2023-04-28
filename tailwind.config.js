/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: false,
  theme: {
    fontFamily: {
      sans: ['IBM Plex Sans', ...fontFamily.sans],
    },
    extend: {
      backgroundImage: (theme) => ({
        'pixel-noise': "url('/images/background-noise-light.png')",
      }),
      colors: {
        'moot-primary': '#FF7262',
        'base-100': '#F9F9F9',
        'base-200': '#F2F2F2',
        'base-300': '#E5E5E5',
        'primary-blue': '#729AF0',
        'primary-red': '#FF7262',
        'primary-green': '#6EB164',
      },
    },
  },
  variants: {
    extend: {
      visibility: ['group-hover'],
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
