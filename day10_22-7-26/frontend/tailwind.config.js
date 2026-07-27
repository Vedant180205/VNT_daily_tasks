/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F172A",
        surface: "#111827",
        border: "#1F2937",
        primary: "#6366F1",
        text: "#F8FAFC",
        muted: "#94A3B8",
        success: "#22C55E",
        danger: "#EF4444",
      }
    },
  },
  plugins: [],
}
