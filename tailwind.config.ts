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
        primary: {
          DEFAULT: "#0066cc",
          hover: "#0052a3",
          light: "#e6f0fa",
        },
        deal: {
          great: "#10b981",
          greatBg: "#ecfdf5",
          fair: "#f59e0b",
          fairBg: "#fffbeb",
          high: "#ef4444",
          highBg: "#fef2f2",
        },
      },
    },
  },
  plugins: [],
};
export default config;
