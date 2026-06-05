/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Manrope", "system-ui", "sans-serif"],
      },
      colors: {
        accent: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
        },
        teal: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        surface: {
          light: "#fffbf5",
          DEFAULT: "#fef7ed",
          dark: "#0c0c14",
          card: "#ffffff",
          "card-dark": "#16161f",
        },
        ink: {
          DEFAULT: "#1a1625",
          muted: "#6b7280",
          faint: "#9ca3af",
        },
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(20, 184, 166, 0.35)",
        "glow-accent": "0 0 40px -10px rgba(236, 72, 153, 0.35)",
        card: "0 4px 24px -4px rgba(26, 22, 37, 0.08)",
        "card-dark": "0 4px 24px -4px rgba(0, 0, 0, 0.4)",
      },
      backgroundImage: {
        mesh: "radial-gradient(at 20% 30%, rgba(20,184,166,0.15) 0%, transparent 50%), radial-gradient(at 80% 70%, rgba(236,72,153,0.12) 0%, transparent 50%)",
        "mesh-dark": "radial-gradient(at 20% 30%, rgba(20,184,166,0.08) 0%, transparent 50%), radial-gradient(at 80% 70%, rgba(236,72,153,0.06) 0%, transparent 50%)",
      },
    },
  },
  plugins: [],
};
