'use client'

// ============================================================
// components/store/LanguageToggle.tsx — Bouton bascule FR/AR
// Stocke la préférence en localStorage via useLanguage
// ============================================================

import { useLanguage } from '@/hooks/useLanguage'

export default function LanguageToggle() {
  const { langue, basculerLangue } = useLanguage()

  return (
    <button
      onClick={basculerLangue}
      aria-label={langue === 'fr' ? 'Passer en arabe' : 'Passer en français'}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--ch-or)',
        background: 'transparent',
        border: '1px solid var(--ch-or)',
        padding: '6px 12px',
        cursor: 'pointer',
        transition: 'background 0.15s ease, color 0.15s ease',
        borderRadius: 0,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.background = 'var(--ch-or)'
        el.style.color = 'var(--ch-noir)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = 'transparent'
        el.style.color = 'var(--ch-or)'
      }}
    >
      {langue === 'fr' ? 'عربي' : 'FR'}
    </button>
  )
}
