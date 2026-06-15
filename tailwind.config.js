/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#E8F3FF",
          100: "#BEDAFF",
          200: "#94BDFF",
          300: "#6AA2FF",
          400: "#4087FF",
          500: "#165DFF",
          600: "#0E42D2",
          700: "#0A2BA0",
          800: "#06196E",
          900: "#030D3C",
        },
        industrial: {
          50: "#F2F3F5",
          100: "#E5E6EB",
          200: "#C9CDD4",
          300: "#86909C",
          400: "#4E5969",
          500: "#272E3B",
          600: "#1D2129",
          700: "#14171D",
          800: "#0C0E12",
          900: "#060709",
        },
        success: {
          50: "#E8FFEA",
          500: "#00B42A",
          600: "#009A29",
        },
        warning: {
          50: "#FFF7E8",
          500: "#FF7D00",
          600: "#D96A00",
        },
        danger: {
          50: "#FFECE8",
          500: "#F53F3F",
          600: "#CB2634",
        },
      },
      fontFamily: {
        sans: ['"Source Han Sans CN"', '"Noto Sans SC"', '"PingFang SC"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      fontSize: {
        'data': '13px',
        'data-lg': '16px',
        'data-xl': '20px',
      },
      borderRadius: {
        'industrial': '2px',
      },
      boxShadow: {
        'industrial': '0 1px 2px 0 rgba(0, 0, 0, 0.08)',
        'industrial-lg': '0 4px 12px 0 rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
