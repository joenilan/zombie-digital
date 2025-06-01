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
      fontFamily: {
        'sofia': ['var(--font-sofia-sans)', 'Sofia Sans', 'system-ui', 'sans-serif'],
        'sofia-condensed': ['var(--font-sofia-condensed)', 'Sofia Sans Condensed', 'system-ui', 'sans-serif'],
        'heading': ['var(--font-sofia-condensed)', 'Sofia Sans Condensed', 'system-ui', 'sans-serif'],
        'body': ['var(--font-sofia-sans)', 'Sofia Sans', 'system-ui', 'sans-serif'],
        'ui': ['var(--font-sofia-condensed)', 'Sofia Sans Condensed', 'system-ui', 'sans-serif'],
      },
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
        // Enhanced color system for unified accents
        accent: {
          primary: '#9146FF',
          secondary: '#00f0ff',
          tertiary: '#ff00e5',
          muted: 'rgba(145, 70, 255, 0.1)',
          subtle: 'rgba(145, 70, 255, 0.05)',
        },
        glass: {
          subtle: 'rgba(255, 255, 255, 0.03)',
          medium: 'rgba(255, 255, 255, 0.08)',
          strong: 'rgba(255, 255, 255, 0.12)',
          border: 'rgba(255, 255, 255, 0.1)',
          'border-hover': 'rgba(255, 255, 255, 0.2)',
        },
        status: {
          success: '#22c55e',
          'success-muted': 'rgba(34, 197, 94, 0.1)',
          warning: '#eab308',
          'warning-muted': 'rgba(234, 179, 8, 0.1)',
          error: '#ef4444',
          'error-muted': 'rgba(239, 68, 68, 0.1)',
          info: '#3b82f6',
          'info-muted': 'rgba(59, 130, 246, 0.1)',
        },
      },
      backgroundImage: {
        "ethereal-dark": "radial-gradient(circle at top, #2D1F47 0%, #0C0A16 100%)",
        "ethereal-light": "radial-gradient(circle at top, #F2EAFF 0%, #E5D6FF 100%)",
        "glass": "linear-gradient(115deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
        "glass-dark": "linear-gradient(115deg, rgba(255, 46, 147, 0.2) 0%, rgba(0, 240, 255, 0.1) 100%), linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.8))",
        "glass-hover": "linear-gradient(115deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%)",
        "cyber-gradient": "linear-gradient(135deg, #FF2E93 0%, #9146FF 100%)",
        "glass-subtle": "linear-gradient(115deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
        "glass-medium": "linear-gradient(115deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
        "glass-strong": "linear-gradient(115deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)",
        "cyber-subtle": "linear-gradient(135deg, rgba(145, 70, 255, 0.05) 0%, rgba(103, 232, 249, 0.02) 100%)",
        "cyber-medium": "linear-gradient(135deg, rgba(145, 70, 255, 0.1) 0%, rgba(103, 232, 249, 0.05) 100%)",
        "cyber-strong": "linear-gradient(135deg, rgba(145, 70, 255, 0.2) 0%, rgba(103, 232, 249, 0.1) 100%)",
        "success-subtle": "linear-gradient(115deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.02) 100%)",
        "warning-subtle": "linear-gradient(115deg, rgba(234, 179, 8, 0.05) 0%, rgba(234, 179, 8, 0.02) 100%)",
        "error-subtle": "linear-gradient(115deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%)",
        "info-subtle": "linear-gradient(115deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%)",
        "dot-pattern": "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
        "grid-pattern": "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        "noise-pattern": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'ethereal': '0 8px 32px -8px rgba(145, 70, 255, 0.3)',
        'ethereal-hover': '0 12px 40px -8px rgba(145, 70, 255, 0.5)',
        'glass': 'inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glass-hover': 'inset 0 0 0 1px rgba(255, 255, 255, 0.15), 0 4px 20px -4px rgba(145, 70, 255, 0.2)',
        'cyber': '0 0 20px -5px rgba(255, 46, 147, 0.3)',
        'cyber-hover': '0 0 30px -5px rgba(255, 46, 147, 0.5)',
        'lift': '0 4px 20px -4px rgba(0, 0, 0, 0.1)',
        'lift-hover': '0 8px 25px -8px rgba(145, 70, 255, 0.25)',
        'glow': '0 0 20px -5px rgba(145, 70, 255, 0.4)',
        'glow-intense': '0 0 30px -5px rgba(145, 70, 255, 0.6)',
        'glass-subtle': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'glass-medium': '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
        'glass-strong': '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
        'cyber-subtle': '0 4px 16px rgba(145, 70, 255, 0.08), 0 1px 4px rgba(103, 232, 249, 0.04)',
        'cyber-medium': '0 8px 32px rgba(145, 70, 255, 0.15), 0 4px 16px rgba(103, 232, 249, 0.08)',
        'cyber-strong': '0 12px 48px rgba(145, 70, 255, 0.25), 0 8px 32px rgba(103, 232, 249, 0.15)',
        'interactive': '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'interactive-hover': '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
        'success': '0 4px 16px rgba(34, 197, 94, 0.15), 0 1px 4px rgba(34, 197, 94, 0.08)',
        'warning': '0 4px 16px rgba(234, 179, 8, 0.15), 0 1px 4px rgba(234, 179, 8, 0.08)',
        'error': '0 4px 16px rgba(239, 68, 68, 0.15), 0 1px 4px rgba(239, 68, 68, 0.08)',
        'info': '0 4px 16px rgba(59, 130, 246, 0.15), 0 1px 4px rgba(59, 130, 246, 0.08)',
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
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
          background: "#f8fafc",
          foreground: "#1e1b4b",
          primary: {
            DEFAULT: "#9146FF",
            foreground: "#ffffff",
          },
          secondary: {
            DEFAULT: "#f1f5f9",
            foreground: "#1e1b4b",
          },
          success: {
            DEFAULT: "#22c55e",
            foreground: "#ffffff",
          },
          warning: {
            DEFAULT: "#eab308",
            foreground: "#ffffff",
          },
          danger: {
            DEFAULT: "#ef4444",
            foreground: "#ffffff",
          },
        },
      },
    },
  })],
};

