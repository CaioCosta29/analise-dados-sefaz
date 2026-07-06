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
        sefaz: {
          green: "#0B4232",
          light: "#E9ECE1",
          gray: "#5C6A64", 
        },
        maceio: {
          amber: "#D97925",
          light: "#FDF6ED",
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-merriweather)', 'serif'],
      }
    },
  },
  plugins: [],
};
export default config;