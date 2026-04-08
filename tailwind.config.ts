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
          bg: "#080c10",
          card: "rgba(255,255,255,0.04)",
          border: "rgba(255,255,255,0.09)",
          muted: "rgba(255,255,255,0.08)",
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
      backdropBlur: {
        xs: "4px",
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
