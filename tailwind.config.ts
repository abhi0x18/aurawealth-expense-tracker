import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["Outfit", "'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'Space Grotesk'", "'JetBrains Mono'", "monospace"],
        cinzel: ["Cinzel", "serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
      fontSize: {
        xs: ["0.875rem", { lineHeight: "1.25rem" }], // 14px (boosted from 12px)
        sm: ["1rem", { lineHeight: "1.5rem" }],       // 16px (boosted from 14px)
        base: ["1.125rem", { lineHeight: "1.75rem" }], // 18px (boosted from 16px)
        lg: ["1.25rem", { lineHeight: "1.75rem" }],    // 20px
        xl: ["1.5rem", { lineHeight: "2rem" }],        // 24px
        "2xl": ["1.875rem", { lineHeight: "2.25rem" }],// 30px
        "3xl": ["2.25rem", { lineHeight: "2.5rem" }],  // 36px
        "4xl": ["3rem", { lineHeight: "1.15" }],       // 48px
        "5xl": ["3.75rem", { lineHeight: "1.1" }],     // 60px
        "6xl": ["4.5rem", { lineHeight: "1" }],        // 72px
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          450: "#10B981",
          500: "#10b981",
          550: "#059669",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        indigo: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          550: "#4F46E5",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
      },
      animation: {
        "float-slow": "floatSlow 6s ease-in-out infinite",
        "float-delayed": "floatSlow 7s ease-in-out 2s infinite",
        "float-gentle": "floatGentle 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "shimmer": "shimmer 3s infinite",
        "gradient-flow": "gradientFlow 5s ease infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) translateZ(30px)" },
          "50%": { transform: "translateY(-12px) translateZ(45px)" },
        },
        floatGentle: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        gradientFlow: {
          "0%, 100%": { "background-size": "200% 200%", "background-position": "left center" },
          "50%": { "background-size": "200% 200%", "background-position": "right center" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
