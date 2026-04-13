// ============================================================
// app/(legal)/mentions-legales/page.tsx
// ============================================================

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales — CH Accessoires',
  robots: { index: false, follow: false },
}

const TITRE_ST = {
  fontFamily: 'var(--font-display)',
  fontSize: '22px',
  fontWeight: 400,
  color: 'var(--ch-noir)',
  letterSpacing: '0.02em',
  marginTop: '40px',
  marginBottom: '14px',
} as React.CSSProperties

const CORPS_ST = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  fontWeight: 300,
  color: 'var(--ch-gris-texte)',
  lineHeight: 1.8,
  marginBottom: '14px',
} as React.CSSProperties

export default function MentionsLegales() {
  return (
    <>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ch-or)', marginBottom: '12px' }}>
        Informations légales
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 300, color: 'var(--ch-noir)', letterSpacing: '0.02em', marginBottom: '8px' }}>
        Mentions légales
      </h1>
      <p style={{ ...CORPS_ST, marginBottom: '32px' }}>Dernière mise à jour : janvier 2025</p>
      <div style={{ width: '40px', height: '0.5px', background: 'var(--ch-or)', marginBottom: '40px' }} />

      <h2 style={TITRE_ST}>Éditeur du site</h2>
      <p style={CORPS_ST}>
        <strong>CH Accessoires</strong><br />
        Activité commerciale — Algérie<br />
        Site web : ch-accessoires.com<br />
        Contact : via le bouton WhatsApp disponible sur le site
      </p>

      <h2 style={TITRE_ST}>Hébergement</h2>
      <p style={CORPS_ST}>
        Le site est hébergé par :<br />
        <strong>Vercel Inc.</strong><br />
        340 Pine Street, Suite 701<br />
        San Francisco, CA 94104 — États-Unis<br />
        <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ch-or)' }}>vercel.com</a>
      </p>
      <p style={CORPS_ST}>
        La base de données est hébergée par :<br />
        <strong>Supabase Inc.</strong><br />
        <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ch-or)' }}>supabase.com</a>
      </p>

      <h2 style={TITRE_ST}>Propriété intellectuelle</h2>
      <p style={CORPS_ST}>
        L'ensemble du contenu de ce site (textes, images, photographies, vidéos, logo, design, structure) est la propriété exclusive de CH Accessoires. Toute reproduction, représentation, modification ou diffusion sans autorisation préalable écrite est strictement interdite et constitue une contrefaçon.
      </p>

      <h2 style={TITRE_ST}>Données personnelles</h2>
      <p style={CORPS_ST}>
        Le traitement des données personnelles est décrit dans notre{' '}
        <a href="/politique-de-confidentialite" style={{ color: 'var(--ch-or)' }}>
          Politique de confidentialité
        </a>.
      </p>

      <h2 style={TITRE_ST}>Cookies</h2>
      <p style={CORPS_ST}>
        Ce site utilise des cookies à des fins fonctionnelles (mémorisation de la langue) et publicitaires (Meta Pixel). Pour en savoir plus, consultez notre{' '}
        <a href="/politique-de-confidentialite" style={{ color: 'var(--ch-or)' }}>
          Politique de confidentialité
        </a>.
      </p>

      <h2 style={TITRE_ST}>Limitation de responsabilité</h2>
      <p style={CORPS_ST}>
        CH Accessoires s'efforce d'assurer l'exactitude des informations diffusées sur ce site. Cependant, nous ne pouvons garantir l'exactitude, la complétude ou l'actualité des informations. L'utilisation du site se fait sous la responsabilité exclusive de l'utilisateur.
      </p>
    </>
  )
}
