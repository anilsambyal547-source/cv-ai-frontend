/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "monospace"],
      },
      colors: {
        // ── Semantic tokens (maps to CSS vars) ──────────────────────────────
        background:          "hsl(var(--background))",
        foreground:          "hsl(var(--foreground))",
        card:                "hsl(var(--card))",
        "card-foreground":   "hsl(var(--card-foreground))",
        border:              "hsl(var(--border))",
        muted:               "hsl(var(--muted))",
        "muted-foreground":  "hsl(var(--muted-foreground))",
        primary:             "hsl(var(--primary))",
        "primary-foreground":"hsl(var(--primary-foreground))",
        popover:             "hsl(var(--card))",
        // ── Industrial palette ───────────────────────────────────────────────
        graphite: {
          50:  "#f4f5f7",
          100: "#e4e6ea",
          200: "#c5cad4",
          300: "#9aa3b2",
          400: "#6e7d94",
          500: "#4d5b73",
          600: "#3a4559",
          700: "#2a3346",
          800: "#1c2336",
          900: "#111827",
          950: "#080d16",
        },
        steel: {
          light: "rgba(196,208,224,0.15)",
          mid:   "rgba(156,172,192,0.10)",
          dark:  "rgba(100,116,139,0.08)",
          glow:  "rgba(148,163,184,0.06)",
        },
        // ── Accent: Electric teal / blue ─────────────────────────────────────
        teal: {
          glow:  "rgba(20,184,166,0.6)",
          edge:  "rgba(20,184,166,0.25)",
          faint: "rgba(20,184,166,0.08)",
        },
        electric: {
          blue:   "#3b82f6",
          teal:   "#14b8a6",
          purple: "#8b5cf6",
          amber:  "#f59e0b",
        },
      },
      backgroundImage: {
        // Graphite noise texture
        "graphite-noise": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        // Ambient gradient for backgrounds
        "ambient-dark": "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 90% 70%, rgba(20,184,166,0.04) 0%, transparent 60%), linear-gradient(180deg, #080d16 0%, #0c1220 100%)",
        // Glass surface gradients
        "glass-surface": "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        "glass-card":    "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 50%, rgba(0,0,0,0.05) 100%)",
        // Metal shimmer
        "metal-edge":    "linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.15) 50%, transparent 100%)",
        "teal-edge":     "linear-gradient(90deg, transparent 0%, rgba(20,184,166,0.25) 50%, transparent 100%)",
        "blue-edge":     "linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.3) 50%, transparent 100%)",
      },
      boxShadow: {
        // Glass layers
        "glass-sm":    "0 0 0 1px rgba(255,255,255,0.06) inset, 0 2px 8px rgba(0,0,0,0.4)",
        "glass-md":    "0 0 0 1px rgba(255,255,255,0.07) inset, 0 4px 16px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.08) inset",
        "glass-lg":    "0 0 0 1px rgba(255,255,255,0.08) inset, 0 8px 32px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.10) inset",
        "glass-xl":    "0 0 0 1px rgba(255,255,255,0.09) inset, 0 16px 64px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.12) inset",
        // Metallic depth
        "metal":       "0 0 0 1px rgba(148,163,184,0.12) inset, 0 0 0 1px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.5)",
        // Accent glows
        "glow-teal":   "0 0 20px 2px rgba(20,184,166,0.3), 0 0 40px 4px rgba(20,184,166,0.15)",
        "glow-blue":   "0 0 20px 2px rgba(59,130,246,0.35), 0 0 40px 4px rgba(59,130,246,0.15)",
        "glow-purple": "0 0 20px 2px rgba(139,92,246,0.3), 0 0 40px 4px rgba(139,92,246,0.15)",
        "glow-amber":  "0 0 20px 2px rgba(245,158,11,0.3), 0 0 40px 4px rgba(245,158,11,0.12)",
        // Focus ring
        "focus-teal":  "0 0 0 2px rgba(20,184,166,0.4)",
        "focus-blue":  "0 0 0 2px rgba(59,130,246,0.4)",
        // Sidebar
        "sidebar":     "4px 0 24px rgba(0,0,0,0.6), 1px 0 0 rgba(255,255,255,0.04)",
      },
      backdropBlur: {
        xs:  "2px",
        sm:  "6px",
        md:  "12px",
        lg:  "20px",
        xl:  "32px",
        "2xl": "48px",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        // Pulse dot for live indicators
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":      { opacity: "0.3", transform: "scale(0.75)" },
        },
        // Sweep shine on glass cards
        "glass-shine": {
          "0%":   { transform: "translateX(-100%) skewX(-15deg)", opacity: "0" },
          "50%":  { opacity: "0.6" },
          "100%": { transform: "translateX(200%) skewX(-15deg)", opacity: "0" },
        },
        // Metric value count-up flicker
        "flicker": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.85" },
        },
        // Ambient float
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-6px)" },
        },
        // Slide in from left
        "slide-in-left": {
          "0%":   { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)",     opacity: "1" },
        },
        // Fade up
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-dot":      "pulse-dot 2s ease-in-out infinite",
        "glass-shine":    "glass-shine 2.5s ease-in-out infinite",
        "flicker":        "flicker 3s ease-in-out infinite",
        "float":          "float 6s ease-in-out infinite",
        "slide-in-left":  "slide-in-left 0.25s ease-out",
        "fade-up":        "fade-up 0.35s ease-out",
      },
    },
  },
  plugins: [],
};
