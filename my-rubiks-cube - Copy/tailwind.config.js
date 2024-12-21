/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // Matches all files in the src directory
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Share Tech Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};
