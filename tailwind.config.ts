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
        background: "var(--background)",
        foreground: "var(--foreground)",
        kuiro: {
          charcoal: "#0B0F14", // 30% dark surfaces
          slate: "#374151",    // 10% neutral elements
          orange: "#FF7A00",   // 5% actions & emphasis
          gray: "#D1D5DB",     // borders & subtle text
          white: "#FFFFFF",    // 55% light surfaces
        },
      },
      fontFamily: {
        sora: ["'Sora'", "system-ui", "-apple-system", "sans-serif"],
        inter: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
        sans: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
        heading: ["'Sora'", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
