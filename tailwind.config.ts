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
        canvas: "#F4F7F4",
        "canvas-pure": "#FFFFFF",
        lime: {
          50: "#F7FEE7",
          100: "#ECFCCB",
          200: "#D9F99D",
          300: "#BEF264",
          400: "#A3E635",
          500: "#84CC16",
          primary: "#C4F82A",
          hover: "#B5EA20",
          dark: "#141C10",
        },
        obsidian: {
          950: "#0A0E0C",
          900: "#0F1412",
          800: "#161D19",
          700: "#1E2722",
          600: "#2B3630",
        },
        surface: {
          sidebar: "#0F1412",
          elevated: "#FFFFFF",
          interactive: "#F4F7F4",
          active: "#E8F0E6",
          border: "#E5EAE3",
          "border-strong": "#CBD5CB",
        },
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
          950: "#1E1B4B",
        },
      },
      boxShadow: {
        luxury: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 10px 24px -4px rgba(15, 23, 42, 0.06), 0 20px 48px -12px rgba(15, 23, 42, 0.08)",
        "luxury-hover": "0 20px 35px -5px rgba(15, 23, 42, 0.1), 0 10px 10px -5px rgba(15, 23, 42, 0.04)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        "card-elevated": "0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.03)",
        pill: "0 2px 8px 0 rgba(0, 0, 0, 0.04)",
        glow: "0 4px 20px -2px rgba(99, 102, 241, 0.35)",
        "glow-emerald": "0 4px 20px -2px rgba(16, 185, 129, 0.3)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "'JetBrains Mono'", "'SF Mono'", "Menlo", "Monaco", "Consolas", "monospace"],
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
