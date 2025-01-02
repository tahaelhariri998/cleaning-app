import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)", // Ensure this variable is defined in your CSS
        foreground: "var(--foreground)", // Ensure this variable is defined in your CSS
      },
    },
  },
  plugins: [],
};

export default config;
