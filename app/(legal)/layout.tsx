// ============================================================
// app/(legal)/layout.tsx — Layout partagé pour les pages légales
// Header minimaliste + footer + lien retour boutique
// ============================================================

import Link from 'next/link'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--ch-blanc)', minHeight: '100vh' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: 'var(--ch-border)',
          padding: '0 clamp(16px, 4vw, 48px)',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 300, color: 'var(--ch-noir)', letterSpacing: '0.06em' }}>
            CH
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '7.5px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ch-gris-texte)' }}>
            ACCESSOIRES
          </span>
        </Link>
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ch-gris-texte)',
            textDecoration: 'none',
          }}
        >
          ← Retour boutique
        </Link>
      </header>

      {/* Contenu */}
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 48px)' }}>
        {children}
      </main>

      {/* Footer minimal */}
      <footer style={{ borderTop: 'var(--ch-border)', padding: '20px clamp(16px, 4vw, 48px)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--ch-gris-texte)', letterSpacing: '0.08em' }}>
          © 2026 CH Accessoires — Tous droits réservés
        </p>
      </footer>
    </div>
  )
}
