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
          bg:       "#060608",
          card:     "rgba(255,255,255,0.03)",
          border:   "rgba(255,255,255,0.07)",
          muted:    "rgba(255,255,255,0.06)",
          text:     "#e8e8e8",
          subtle:   "#555555",
          // gold — only for text/icon accents
          gold:     "#D4AF37",
          "gold-light": "#F5D070",
          "gold-dark":  "#A67C00",
          // metric colors (kept subtle, used in rings/text only)
          recovery: "#D4AF37",
          strain:   "#C9A84C",
          sleep:    "#B8973A",
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
