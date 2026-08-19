/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./templates/**/*.html",
    "./static/**/*.js",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#0a0a0f",
        "obsidian-card": "#12121c",
        "neon-blue": "#00f0ff",
        "neon-violet": "#8b5cf6",
        "neon-emerald": "#10b981",
        "helias-glow": "rgba(0, 240, 255, 0.15)"
      }
    }
  },
  plugins: []
};
