import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // AIESEC Official Brand Accents
        aiesec: {
          blue: "#037EF3",
          darkblue: "#0256A7",
          navy: "#0A2540",
          soft: "#EBF5FF",
        },
        // Official Product Palettes
        igv: {
          coral: "#F85A40",
          dark: "#D94127",
          soft: "#FFF3F1",
          border: "#FED7D2",
        },
        igta: {
          teal: "#0CB9C1",
          dark: "#098E94",
          soft: "#F0FCFD",
          border: "#C7F4F6",
        },
        igte: {
          orange: "#F48924",
          dark: "#CC6B12",
          soft: "#FEF7F0",
          border: "#FCDDC0",
        },
        // Operational Status Tokens (WCAG 2.2 AA Compliant)
        status: {
          success: {
            bg: "#ECFDF5",
            text: "#065F46",
            border: "#A7F3D0",
            dot: "#10B981",
          },
          warning: {
            bg: "#FFFBEB",
            text: "#92400E",
            border: "#FDE68A",
            dot: "#F59E0B",
          },
          critical: {
            bg: "#FEF2F2",
            text: "#991B1B",
            border: "#FECACA",
            dot: "#EF4444",
          },
          info: {
            bg: "#EFF6FF",
            text: "#1E40AF",
            border: "#BFDBFE",
            dot: "#3B82F6",
          },
          neutral: {
            bg: "#F8FAFC",
            text: "#334155",
            border: "#E2E8F0",
            dot: "#64748B",
          },
        },
        // Local Rabat Operational Palette (Kasbah / Platinum / Indigo)
        ribat: {
          kasbah: "#FFFFFF",
          platinum: "#F8FAFC",
          subtle: "#F1F5F9",
          sandstone: "#E6E1D6",
          indigo: "#1E3A5F",
          slate: "#1E293B",
          muted: "#64748B",
          border: "#E2E8F0",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        heading: ["Inter", "Montserrat", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
};

export default config;
