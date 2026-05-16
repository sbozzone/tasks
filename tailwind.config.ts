import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F5F0E8",
        card: "#FDFAF4",
        "card-header": "#F0EBE0",
        sidebar: "#EDE8DE",
        border: "#DDD8CC",
        "border-light": "#EAE5D8",
        accent: {
          DEFAULT: "#D97757",
          light: "#FDF0E8",
          dark: "#8B3A1A",
          hover: "#C4623E",
        },
        text: {
          DEFAULT: "#2C2416",
          secondary: "#7A6F5E",
          muted: "#A89F8E",
        },
        green: "#4A9B6F",
        blue: "#4A7FA5",
        gold: "#C49A2A",
        red: "#C45242",
      },
      fontFamily: {
        serif: ["Lora", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      borderRadius: {
        card: "12px",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
        "safe-top": "env(safe-area-inset-top, 0px)",
      },
      minHeight: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};

export default config;
