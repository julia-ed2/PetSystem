/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx}", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        pink:   { DEFAULT: '#E91E8C', light: '#F8BBD9', dark: '#C2185B' },
        purple: { DEFAULT: '#7B2FBE', light: '#EDE7F6', dark: '#4A148C' },
      },
    },
  },
  plugins: [],
};