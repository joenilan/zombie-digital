const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        twitch: {
          DEFAULT: "#9146FF",
          glow: "#B88FFF",
          ethereal: "#C4A9FF",
        },
        cyber: {
          darker: '#0a0a0f',
          lighter: '#f5f5f7',
          DEFAULT: '#141420',
          hover: '#1a1a2e',
          cyan: '#00f0ff',
          purple: '#9146ff',
          pink: '#ff00e5',
        },
      },
      backgroundImage: {
        "ethereal-dark": "radial-gradient(circle at top, #2D1F47 0%, #0C0A16 100%)",
        "ethereal-light": "radial-gradient(circle at top, #F2EAFF 0%, #E5D6FF 100%)",
        "glass": "linear-gradient(115deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
        "glass-dark": "linear-gradient(115deg, rgba(255, 46, 147, 0.2) 0%, rgba(0, 240, 255, 0.1) 100%), linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.8))",
        "glass-hover": "linear-gradient(115deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)",
        "cyber-gradient": "linear-gradient(135deg, #FF2E93 0%, #9146FF 100%)",
      },
      boxShadow: {
        'ethereal': '0 8px 32px -8px rgba(145, 70, 255, 0.3)',
        'ethereal-hover': '0 12px 40px -8px rgba(145, 70, 255, 0.5)',
        'glass': 'inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'cyber': '0 0 20px -5px rgba(255, 46, 147, 0.3)',
        'cyber-hover': '0 0 30px -5px rgba(255, 46, 147, 0.5)',
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s ease-in-out infinite",
      },
    },
  },
  darkMode: "class",
  plugins: [nextui({
    themes: {
      dark: {
        colors: {
          background: "#171023",
          foreground: "#E2D9F3",
          primary: {
            DEFAULT: "#9146FF",
            foreground: "#ffffff",
          },
        },
      },
      light: {
        colors: {
          background: "#F2EAFF",
          foreground: "#2D1F47",
          primary: {
            DEFAULT: "#9146FF",
            foreground: "#ffffff",
          },
        },
      },
    },
  })],
};

