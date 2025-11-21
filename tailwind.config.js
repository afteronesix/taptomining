/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "nh-bg-dark": "#111827",
        "nh-terminal-green": "#00ff41",
        "nh-terminal-light": "#00ffa1",
        "nh-text-muted": "#888",
        "nh-card-bg": "#1f2937",
        "nh-border": "#374151",
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { textShadow: "0 0 8px rgba(0, 255, 65, 0.5)" },
          "50%": { textShadow: "0 0 16px rgba(0, 255, 65, 0.8)" },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 1.5s ease-in-out infinite",
        bob: "bob 0.8s infinite",
        glitch: "glitch 0.2s infinite alternate",
      },
    },
  },
  plugins: [],
};
