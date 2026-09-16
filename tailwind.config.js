/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8f4",
          100: "#d8f0e7",
          200: "#b3e0d1",
          300: "#82cbb6",
          400: "#4eaf92",
          500: "#2f9478",
          600: "#197a63",
          700: "#12624f",
          800: "#104e40",
          900: "#0d4035",
          950: "#06251f"
        }
      },

      fontFamily: {
        sans: [
          "Segoe UI",
          "Segoe UI Variable",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ],

        display: ["Instrument Serif", "Georgia", "serif"]
      },

      boxShadow: {
        fluent: "0 1px 2px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.04)",

        "fluent-dark": "0 1px 2px rgba(0,0,0,.35), 0 8px 28px rgba(0,0,0,.22)"
      }
    }
  },
  plugins: []
};
