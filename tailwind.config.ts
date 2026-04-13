// ============================================================
// tailwind.config.ts — Configuration Tailwind CSS
// Note : les couleurs de la charte sont dans globals.css via var(--ch-*)
// Tailwind est utilisé UNIQUEMENT pour le layout/spacing, jamais pour les couleurs
// ============================================================

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Breakpoint mobile unique (768px selon CLAUDE.md)
      screens: {
        md: '768px',
      },
      // Font families référencées depuis les variables CSS du layout
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'serif'],
        body: ['var(--font-body)', 'DM Sans', 'sans-serif'],
      },
      // Max-widths du layout mobile-first
      maxWidth: {
        mobile: '480px',
        desktop: '1200px',
      },
    },
  },
  plugins: [],
}

export default config
