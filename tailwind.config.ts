import type { Config } from "tailwindcss";

const v = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: v("primary"),
        "primary-fg": v("primary-fg"),
        accent: v("accent"),
        "accent-fg": v("accent-fg"),
        bg: v("bg"),
        surface: v("surface"),
        ink: v("text"),
        muted: v("muted"),
        line: v("border"),
      },
      borderRadius: {
        theme: "var(--radius)",
        "theme-lg": "calc(var(--radius) * 1.6)",
        "theme-sm": "calc(var(--radius) * 0.6)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        drift: {
          "0%,100%": { transform: "translate(0,0) scale(1)" },
          "50%": { transform: "translate(6%, -8%) scale(1.15)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        drift: "drift 14s ease-in-out infinite",
        "drift-slow": "drift 22s ease-in-out infinite reverse",
      },
    },
  },
  plugins: [],
};
export default config;
