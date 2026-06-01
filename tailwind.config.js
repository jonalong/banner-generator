/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./main.js"],
  theme: {
    extend: {
      fontFamily: {
        suit: ["SUIT", "-apple-system", "BlinkMacSystemFont", "Apple SD Gothic Neo", "system-ui", "sans-serif"],
      },
      colors: {
        // Healio Primary (Brand Green)
        brand: {
          50:  "#E6FDF0",
          100: "#D6FEE7",
          200: "#B1F7D1",
          300: "#77F8AE",
          400: "#2AEC7C", // highlight
          500: "#14CC62", // 메인 브랜드
          600: "#01BD51",
          700: "#00A445",
          800: "#008039",
          900: "#004C20",
          DEFAULT: "#14CC62",
        },
        // Healio Gray
        hgray: {
          0:   "#FFFFFF",
          50:  "#F8F8F9",
          100: "#F2F2F3",
          200: "#DFE1E5",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
          950: "#030712",
        },
      },
      boxShadow: {
        card: "0 0.9px 1.35px rgba(0,0,0,0.15)",
        "card-preview": "0 0.9px 2.7px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};
