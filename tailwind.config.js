/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Pre-included NativeWind preset
  presets: [require("nativewind/preset")],
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        "brand-light": "#FAFAFA",
        "brand-dark": "#050505",
        dark: "#050505", // Deep black background
        "card-glass": "rgba(30, 30, 30, 0.4)", // Card background
        "accent-copper": "#C88A53", // Muted copper text
        "accent-gold": "#E6B778", // Bright gold highlight
        "glass-border": "rgba(255, 255, 255, 0.15)",
        "glass-shine": "rgba(255, 255, 255, 0.25)",
        "espresso-dark": "#3E2723",
        "espresso-light": "#8D6E63",
      },
    },
  },
  plugins: [],
}

