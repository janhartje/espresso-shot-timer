/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Pre-included NativeWind preset
  presets: [require("nativewind/preset")],
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: "#121212",
        "accent-copper": "#D4AF37",
      },
    },
  },
  plugins: [],
}

