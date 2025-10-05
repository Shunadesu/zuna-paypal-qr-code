/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paypal: {
          blue: '#0070ba',
          darkblue: '#003087',
          lightblue: '#009cde'
        }
      }
    },
  },
  plugins: [],
}
