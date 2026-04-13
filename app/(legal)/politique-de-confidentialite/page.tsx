// ============================================================
// app/(legal)/politique-de-confidentialite/page.tsx
// Obligatoire pour Meta Pixel et les publicités Facebook/Instagram
// ============================================================

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — CH Accessoires',
  description: 'Politique de confidentialité et de protection des données personnelles de CH Accessoires.',
  robots: { index: true, follow: false },
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

const LISTE_ST = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  fontWeight: 300,
  color: 'var(--ch-gris-texte)',
  lineHeight: 1.8,
  paddingLeft: '20px',
  marginBottom: '14px',
} as React.CSSProperties

export default function PolitiqueConfidentialite() {
  return (
    <>
      {/* En-tête */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ch-or)', marginBottom: '12px' }}>
        Mentions légales
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 300, color: 'var(--ch-noir)', letterSpacing: '0.02em', marginBottom: '8px' }}>
        Politique de confidentialité
      </h1>
      <p style={{ ...CORPS_ST, marginBottom: '32px' }}>
        Dernière mise à jour : janvier 2025
      </p>
      <div style={{ width: '40px', height: '0.5px', background: 'var(--ch-or)', marginBottom: '40px' }} />

      {/* Intro */}
      <p style={CORPS_ST}>
        CH Accessoires («&nbsp;nous&nbsp;», «&nbsp;notre&nbsp;») s'engage à protéger la vie privée des personnes qui visitent notre site et passent commande. Cette politique explique quelles données nous collectons, pourquoi et comment elles sont utilisées.
      </p>

      <h2 style={TITRE_ST}>1. Données collectées</h2>
      <p style={CORPS_ST}>Lors d'une commande ou d'une visite, nous collectons les informations suivantes :</p>
      <ul style={LISTE_ST}>
        <li>Nom, prénom, numéro de téléphone</li>
        <li>Wilaya et adresse de livraison</li>
        <li>Identifiant de commande et détails du produit commandé</li>
        <li>Données de navigation : adresse IP, navigateur, pages visitées, durée de visite</li>
        <li>Identifiants publicitaires : fbclid, utm_source, utm_campaign (provenant de publicités Meta)</li>
      </ul>

      <h2 style={TITRE_ST}>2. Finalités du traitement</h2>
      <p style={CORPS_ST}>Vos données sont utilisées exclusivement pour :</p>
      <ul style={LISTE_ST}>
        <li>Traiter et livrer votre commande (paiement à la livraison)</li>
        <li>Vous contacter pour confirmer la livraison</li>
        <li>Prévenir les fraudes et les fausses commandes</li>
        <li>Améliorer nos publicités Meta (Facebook / Instagram) via le Meta Pixel et l'API Conversions</li>
        <li>Analyser les performances de notre boutique</li>
      </ul>

      <h2 style={TITRE_ST}>3. Meta Pixel et API Conversions</h2>
      <p style={CORPS_ST}>
        Notre site utilise le <strong>Meta Pixel</strong> (anciennement Facebook Pixel), un outil d'analyse fourni par Meta Platforms, Inc. Il collecte des données de navigation pour mesurer l'efficacité de nos publicités et vous proposer des annonces pertinentes.
      </p>
      <p style={CORPS_ST}>
        Nous utilisons également l'<strong>API Conversions de Meta</strong> (côté serveur) pour envoyer des événements d'achat avec votre numéro de téléphone haché (SHA-256). Ce hachage est irréversible et ne permet pas d'identifier directement une personne.
      </p>
      <p style={CORPS_ST}>
        Vous pouvez désactiver la publicité personnalisée Meta via <a href="https://www.facebook.com/settings?tab=ads" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ch-or)' }}>vos préférences publicitaires</a>.
      </p>

      <h2 style={TITRE_ST}>4. Partage des données</h2>
      <p style={CORPS_ST}>
        Nous ne vendons, ne louons et ne partageons pas vos données personnelles avec des tiers, sauf dans les cas suivants :
      </p>
      <ul style={LISTE_ST}>
        <li>Transporteurs et services de livraison (nom, téléphone, adresse uniquement)</li>
        <li>Supabase (hébergement sécurisé de la base de données)</li>
        <li>Meta Platforms Inc. (données publicitaires pseudonymisées)</li>
        <li>Vercel (hébergement du site web)</li>
      </ul>

      <h2 style={TITRE_ST}>5. Conservation des données</h2>
      <p style={CORPS_ST}>
        Vos données de commande sont conservées pendant 3 ans à compter de la date de commande, conformément aux obligations légales algériennes. Les données de navigation sont conservées 13 mois.
      </p>

      <h2 style={TITRE_ST}>6. Vos droits</h2>
      <p style={CORPS_ST}>Vous disposez des droits suivants sur vos données personnelles :</p>
      <ul style={LISTE_ST}>
        <li>Accès à vos données</li>
        <li>Rectification des informations inexactes</li>
        <li>Suppression de vos données (dans les limites légales)</li>
        <li>Opposition au traitement à des fins publicitaires</li>
      </ul>
      <p style={CORPS_ST}>
        Pour exercer ces droits, contactez-nous via WhatsApp au numéro indiqué sur notre site ou par email à l'adresse affichée en bas de page.
      </p>

      <h2 style={TITRE_ST}>7. Sécurité</h2>
      <p style={CORPS_ST}>
        Nous appliquons des mesures techniques appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation. Notre base de données est hébergée sur des serveurs sécurisés (Supabase, certifié SOC 2).
      </p>

      <h2 style={TITRE_ST}>8. Cookies</h2>
      <p style={CORPS_ST}>
        Notre site utilise des cookies fonctionnels (préférence de langue) et des cookies analytiques/publicitaires (Meta Pixel). En utilisant notre site, vous consentez à l'utilisation de ces cookies.
      </p>

      <h2 style={TITRE_ST}>9. Contact</h2>
      <p style={CORPS_ST}>
        Pour toute question relative à cette politique, contactez CH Accessoires via le bouton WhatsApp disponible sur notre site.
      </p>
    </>
  )
}
