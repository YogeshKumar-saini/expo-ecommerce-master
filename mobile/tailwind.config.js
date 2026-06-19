/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#000000",
          light: "#333333",
          dark: "#000000",
        },
        background: {
          DEFAULT: "#FFFFFF",
          light: "#F5F5F5",
          lighter: "#EBEBEB",
        },
        surface: {
          DEFAULT: "#F5F5F5",
          light: "#FFFFFF",
        },
        text: {
          primary: "#000000",
          secondary: "#666666",
          tertiary: "#999999",
        },
        accent: {
          DEFAULT: "#000000",
          red: "#CC0000",
          yellow: "#999999",
        },
        border: {
          DEFAULT: "#E5E5E5",
          light: "#F0F0F0",
        },
      },
    },
  },
  plugins: [],
};
