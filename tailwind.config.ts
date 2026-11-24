import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        void: "#070B09",
        canvas: "#070B09",
        "canvas-pure": "#0C120F",
        lime: {
          50: "#F7FEE7",
          100: "#ECFCCB",
          200: "#D9F99D",
          300: "#BEF264",
          400: "#A3E635",
          500: "#84CC16",
          electric: "#9DFF00",
          primary: "#9DFF00",
          hover: "#8CE600",
          dark: "#141C10",
        },
        obsidian: {
          950: "#070B09",
          900: "#0C120F",
          850: "#101713",
          800: "#121B16",
          700: "#18241D",
          600: "#1E2C24",
          500: "#2C4034",
        },
        surface: {
          sidebar: "#0A0F0C",
          elevated: "#121B16",
          interactive: "#18241D",
          active: "#1A2820",
          border: "#1E2C24",
          "border-strong": "#2C4034",
        },
        brand: {
          50: "#F4FFE0",
          100: "#E6FFBA",
          200: "#CEFF7A",
          300: "#B2FF3D",
          400: "#9DFF00",
          500: "#8CE600",
          600: "#6CB800",
          700: "#4E8800",
          800: "#376000",
          900: "#1F3700",
          950: "#0E1A00",
        },
      },
      boxShadow: {
        obsidian: "0 1px 0 0 rgba(255, 255, 255, 0.04) inset, 0 18px 40px -16px rgba(0, 0, 0, 0.75)",
        "obsidian-hover": "0 1px 0 0 rgba(157, 255, 0, 0.12) inset, 0 24px 48px -16px rgba(0, 0, 0, 0.9)",
        luxury: "0 1px 0 0 rgba(255, 255, 255, 0.04) inset, 0 20px 44px -16px rgba(0, 0, 0, 0.7)",
        "luxury-hover": "0 1px 0 0 rgba(157, 255, 0, 0.14) inset, 0 24px 50px -14px rgba(0, 0, 0, 0.85)",
        card: "0 1px 0 0 rgba(255, 255, 255, 0.03) inset, 0 8px 24px -12px rgba(0, 0, 0, 0.65)",
        "card-elevated": "0 1px 0 0 rgba(255, 255, 255, 0.05) inset, 0 20px 45px -16px rgba(0, 0, 0, 0.8)",
        pill: "0 2px 10px 0 rgba(0, 0, 0, 0.35)",
        glow: "0 4px 24px -2px rgba(157, 255, 0, 0.35)",
        "glow-lime": "0 0 28px -4px rgba(157, 255, 0, 0.45)",
        "glow-emerald": "0 4px 20px -2px rgba(16, 185, 129, 0.3)",
      },
      fontFamily: {
        display: ["var(--font-display)", "'Space Grotesk'", "sans-serif"],
        sans: ["var(--font-sans)", "'Plus Jakarta Sans'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "'JetBrains Mono'", "'SF Mono'", "Menlo", "monospace"],
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee var(--duration, 35s) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration, 35s) linear infinite",
        "border-beam": "border-beam calc(var(--duration, 15)*1s) infinite linear",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap, 1rem)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap, 1rem)))" },
        },
        "border-beam": {
          "100%": {
            "offset-distance": "100%",
          },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
