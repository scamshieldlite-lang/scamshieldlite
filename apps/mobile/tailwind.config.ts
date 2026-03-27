/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0B1F3A", // Primary Background
          card: "#112A4A", // Card Background
          blue: "#1E90FF", // Primary Color
          green: "#22C55E", // Secondary Color
          danger: "#EF4444", // Error/Likely Scam
          warning: "#F59E0B", // Suspicious
          textMain: "#FFFFFF",
          textSub: "#A0AEC0",
        },
      },
      borderRadius: {
        base: "12px",
      },
    },
  },
  plugins: [],
};
