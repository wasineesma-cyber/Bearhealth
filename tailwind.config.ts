import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bear: {
          bg: "#0d0d0d",
          card: "#1a1a1a",
          border: "#2a2a2a",
          muted: "#3a3a3a",
          text: "#e8e8e8",
          subtle: "#888888",
          recovery: "#00d4aa",
          strain: "#3b82f6",
          sleep: "#8b5cf6",
          warning: "#f59e0b",
          danger: "#ef4444",
          heart: "#ff4d6d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
