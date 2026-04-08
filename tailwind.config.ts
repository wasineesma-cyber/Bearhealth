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
          bg:       "#08070a",
          card:     "rgba(212,175,55,0.05)",
          border:   "rgba(212,175,55,0.15)",
          muted:    "rgba(212,175,55,0.08)",
          text:     "#F0E6C8",
          subtle:   "#7A6840",
          gold:     "#D4AF37",
          "gold-bright": "#FFD700",
          "gold-light":  "#F5D070",
          "gold-dark":   "#A67C00",
          recovery: "#D4AF37",
          strain:   "#FFB830",
          sleep:    "#C9A84C",
          warning:  "#F59E0B",
          danger:   "#ef4444",
          heart:    "#ff4d6d",
        },
      },
      backdropBlur: { xs: "4px" },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow":  "spin 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
