'use client'

// ============================================================
// app/HomeClient.tsx — Page d'accueil premium CH Accessoires
// Collection complète + section valeurs + footer
// Bilingue FR/AR via useLanguage
// ============================================================

import { useLanguage } from '@/hooks/useLanguage'
import Link from 'next/link'
import Image from 'next/image'
import LanguageToggle from '@/components/store/LanguageToggle'
import type { Produit, Variante } from '@/lib/supabase'
import { useState } from 'react'
import type { CSSProperties } from 'react'

type ProduitAvecVariantes = Produit & { variantes: Variante[] }

type Props = {
  produits: ProduitAvecVariantes[]
}

// ── Icône flèche ──────────────────────────────────────────────
function IcoArrow() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Icône livraison ───────────────────────────────────────────
function IcoLivraison() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="2" y="7" width="17" height="12" rx="0" stroke="var(--ch-or)" strokeWidth="1.2"/>
      <path d="M19 11h4l3 4v4H19V11z" stroke="var(--ch-or)" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="7" cy="21" r="2" stroke="var(--ch-or)" strokeWidth="1.2"/>
      <circle cx="22" cy="21" r="2" stroke="var(--ch-or)" strokeWidth="1.2"/>
    </svg>
  )
}

// ── Icône qualité ─────────────────────────────────────────────
function IcoQualite() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 3l2.8 5.5 6.2.9-4.5 4.3 1.1 6.1L14 17l-5.6 2.8 1.1-6.1L5 9.4l6.2-.9L14 3z" stroke="var(--ch-or)" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Icône COD ─────────────────────────────────────────────────
function IcoCod() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="4" y="8" width="20" height="13" rx="0" stroke="var(--ch-or)" strokeWidth="1.2"/>
      <path d="M4 13h20" stroke="var(--ch-or)" strokeWidth="1.2"/>
      <path d="M9 17h4" stroke="var(--ch-or)" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}

// ── Textes bilingues ──────────────────────────────────────────
const TEXTES = {
  fr: {
    urgence: '🚚 Livraison dans toute l\'Algérie · ⚡ Stock limité',
    navCollection: 'Collection',
    navContact: 'Contact',
    heroSurtitle: 'Saison 2025',
    heroTitre: 'L\'élégance qui\nvous ressemble',
    heroSous: 'Sacs haut de gamme · Fait pour durer · Livré chez vous',
    heroBtn: 'Découvrir la collection',
    collectionTitre: 'Notre collection',
    collectionSous: 'Chaque pièce est conçue pour accompagner votre quotidien avec élégance.',
    decouvrir: 'Découvrir',
    couleurs: 'coloris disponibles',
    unColoris: 'coloris disponible',
    prix: '3 500 DA',
    paiementLivraison: 'Paiement à la livraison',
    valeursTitre: 'Pourquoi CH Accessoires',
    v1titre: 'Qualité premium',
    v1sous: 'Matières sélectionnées, finitions soignées. Chaque sac est pensé pour durer.',
    v2titre: 'Livraison nationale',
    v2sous: 'Livraison offerte dans les 69 wilayas d\'Algérie. Rapide, fiable, sans frais.',
    v3titre: 'Paiement à la livraison',
    v3sous: 'Commandez en toute confiance. Vous payez uniquement à réception.',
    footerTagline: 'L\'élégance accessible.',
    footerLivraison: 'Livraison dans toute l\'Algérie',
    footerPaiement: 'Paiement à la livraison',
    footerDroits: '© 2026 CH Accessoires. Tous droits réservés.',
  },
  ar: {
    urgence: '🚚 الليفراج لقاع ولايات الجزائر · ⚡ الكمية محدودة',
    navCollection: 'الكوليكسيون',
    navContact: 'تواصلو معانا',
    heroSurtitle: 'موسم 2025',
    heroTitre: 'الإيلغانس اللي\nتعكس شخصيتك',
    heroSous: 'شنط فاخرة · مصنوعة تبقى · تيجي لبابك',
    heroBtn: 'شوف الكوليكسيون',
    collectionTitre: 'كوليكسيوننا',
    collectionSous: 'كل قطعة مصنوعة تصحبك في حياتك اليومية بأناقة.',
    decouvrir: 'شوف',
    couleurs: 'ألوان متاحة',
    unColoris: 'لون متاح',
    prix: '3 500 دج',
    paiementLivraison: 'الدفع عند الاستلام',
    valeursTitre: 'علاش CH Accessoires',
    v1titre: 'جودة عالية',
    v1sous: 'خامات مختارة وتشطيبات أنيقة. كل شنطة مصنوعة تبقى معاك.',
    v2titre: 'ليفراج وطني',
    v2sous: 'الليفراج مجاني لـ 69 ولاية. بالدرة وموثوق.',
    v3titre: 'الدفع عند الاستلام',
    v3sous: 'طلب بثقة. ما تدفعش غير وقت تستلم.',
    footerTagline: 'الأناقة في متناول الجميع.',
    footerLivraison: 'الليفراج لقاع الجزائر',
    footerPaiement: 'الدفع عند الاستلام',
    footerDroits: '© 2026 CH Accessoires. جميع الحقوق محفوظة.',
  },
}

// ── Composant principal ───────────────────────────────────────

export default function HomeClient({ produits }: Props) {
  const { langue, estArabe } = useLanguage()
  const T = TEXTES[langue]
  const fontArabe = estArabe ? 'var(--font-arabic)' : undefined

  return (
    <div
      style={{
        background: 'var(--ch-blanc)',
        minHeight: '100vh',
        direction: estArabe ? 'rtl' : 'ltr',
        fontFamily: estArabe ? 'var(--font-arabic)' : undefined,
      }}
    >
      {/* ── Urgency bar ─────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--ch-noir)',
          color: 'var(--ch-or)',
          fontFamily: estArabe ? 'var(--font-arabic)' : 'var(--font-body)',
          fontSize: estArabe ? '13px' : '10px',
          fontWeight: 500,
          letterSpacing: estArabe ? 0 : '0.18em',
          textTransform: estArabe ? 'none' : 'uppercase',
          textAlign: 'center',
          padding: '10px 16px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {T.urgence}
      </div>

      {/* ── Header ──────────────────────────────────────────── */}
      <header
        style={{
          background: 'var(--ch-blanc)',
          borderBottom: 'var(--ch-border)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          position: 'sticky',
          top: '38px',
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: 300,
              color: 'var(--ch-noir)',
              letterSpacing: '0.06em',
              lineHeight: 1,
            }}
          >
            CH
          </span>
          <span
            style={{
              fontFamily: fontArabe || 'var(--font-body)',
              fontSize: '7.5px',
              fontWeight: 500,
              letterSpacing: estArabe ? '0.05em' : '0.22em',
              textTransform: 'uppercase',
              color: 'var(--ch-gris-texte)',
            }}
          >
            {estArabe ? 'أكسسوارات' : 'ACCESSOIRES'}
          </span>
        </Link>

        {/* Nav droite */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a
              href="#collection"
              style={{
                fontFamily: fontArabe || 'var(--font-body)',
                fontSize: estArabe ? '13px' : '10px',
                fontWeight: 500,
                letterSpacing: estArabe ? 0 : '0.12em',
                textTransform: estArabe ? 'none' : 'uppercase',
                color: 'var(--ch-gris-texte)',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
            >
              {T.navCollection}
            </a>
          </nav>
          <LanguageToggle />
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--ch-noir)',
          padding: '100px 24px 80px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ligne décorative fine or */}
        <div
          style={{
            width: '1px',
            height: '60px',
            background: 'var(--ch-or)',
            margin: '0 auto 32px',
            opacity: 0.6,
          }}
        />

        {/* Surtitle */}
        <p
          style={{
            fontFamily: fontArabe || 'var(--font-body)',
            fontSize: estArabe ? '13px' : '10px',
            fontWeight: 500,
            letterSpacing: estArabe ? '0.05em' : '0.3em',
            textTransform: estArabe ? 'none' : 'uppercase',
            color: 'var(--ch-or)',
            marginBottom: '24px',
            opacity: 0.8,
          }}
        >
          {T.heroSurtitle}
        </p>

        {/* Titre principal */}
        <h1
          style={{
            fontFamily: estArabe ? 'var(--font-arabic)' : 'var(--font-display)',
            fontSize: 'clamp(40px, 7vw, 80px)',
            fontWeight: estArabe ? 300 : 300,
            color: 'var(--ch-blanc)',
            letterSpacing: estArabe ? '0.01em' : '0.04em',
            lineHeight: 1.15,
            maxWidth: '760px',
            margin: '0 auto 28px',
            whiteSpace: 'pre-line',
          }}
        >
          {T.heroTitre}
        </h1>

        {/* Sous-titre */}
        <p
          style={{
            fontFamily: fontArabe || 'var(--font-body)',
            fontSize: estArabe ? '15px' : '12px',
            fontWeight: 300,
            letterSpacing: estArabe ? 0 : '0.1em',
            color: 'rgba(200,196,188,0.6)',
            marginBottom: '48px',
          }}
        >
          {T.heroSous}
        </p>

        {/* CTA */}
        <a
          href="#collection"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: fontArabe || 'var(--font-body)',
            fontSize: estArabe ? '14px' : '10.5px',
            fontWeight: 500,
            letterSpacing: estArabe ? 0 : '0.18em',
            textTransform: estArabe ? 'none' : 'uppercase',
            color: 'var(--ch-noir)',
            background: 'var(--ch-or)',
            border: 'none',
            padding: estArabe ? '14px 36px' : '15px 40px',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {T.heroBtn}
          {!estArabe && <IcoArrow />}
        </a>

        {/* Ligne décorative bas */}
        <div
          style={{
            width: '1px',
            height: '60px',
            background: 'var(--ch-or)',
            margin: '64px auto 0',
            opacity: 0.3,
          }}
        />
      </section>

      {/* ── Collection ──────────────────────────────────────── */}
      <section
        id="collection"
        style={{
          padding: 'clamp(60px, 8vw, 100px) clamp(16px, 4vw, 48px)',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* En-tête section */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p
            style={{
              fontFamily: fontArabe || 'var(--font-body)',
              fontSize: estArabe ? '12px' : '9.5px',
              fontWeight: 500,
              letterSpacing: estArabe ? '0.05em' : '0.3em',
              textTransform: estArabe ? 'none' : 'uppercase',
              color: 'var(--ch-or)',
              marginBottom: '14px',
            }}
          >
            {T.heroSurtitle}
          </p>
          <h2
            style={{
              fontFamily: estArabe ? 'var(--font-arabic)' : 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 300,
              color: 'var(--ch-noir)',
              letterSpacing: estArabe ? '0.01em' : '0.03em',
              marginBottom: '16px',
            }}
          >
            {T.collectionTitre}
          </h2>
          <p
            style={{
              fontFamily: fontArabe || 'var(--font-body)',
              fontSize: estArabe ? '15px' : '13px',
              fontWeight: 300,
              color: 'var(--ch-gris-texte)',
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            {T.collectionSous}
          </p>
        </div>

        {/* Grille produits */}
        {produits.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 24px',
              color: 'var(--ch-gris-texte)',
              fontFamily: fontArabe || 'var(--font-body)',
              fontSize: '14px',
              border: 'var(--ch-border)',
            }}
          >
            {estArabe ? 'الشنط جاية قريب...' : 'Collection bientôt disponible…'}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
              gap: 'clamp(20px, 3vw, 40px)',
            }}
          >
            {produits.map((produit) => (
              <CarteProducte
                key={produit.id}
                produit={produit}
                langue={langue}
                estArabe={estArabe}
                T={T}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Section valeurs ─────────────────────────────────── */}
      <section
        style={{
          background: 'var(--ch-beige)',
          padding: 'clamp(60px, 8vw, 100px) clamp(16px, 4vw, 48px)',
          borderTop: 'var(--ch-border)',
          borderBottom: 'var(--ch-border)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Titre */}
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2
              style={{
                fontFamily: estArabe ? 'var(--font-arabic)' : 'var(--font-display)',
                fontSize: 'clamp(24px, 3.5vw, 36px)',
                fontWeight: 300,
                color: 'var(--ch-noir)',
                letterSpacing: estArabe ? '0.01em' : '0.03em',
              }}
            >
              {T.valeursTitre}
            </h2>
          </div>

          {/* 3 pilliers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '2px',
              background: 'var(--ch-gris-clair)',
            }}
          >
            {[
              { ico: <IcoQualite />, titre: T.v1titre, sous: T.v1sous },
              { ico: <IcoLivraison />, titre: T.v2titre, sous: T.v2sous },
              { ico: <IcoCod />, titre: T.v3titre, sous: T.v3sous },
            ].map((v, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--ch-blanc)',
                  padding: 'clamp(28px, 4vw, 48px) clamp(24px, 3vw, 40px)',
                  textAlign: 'center',
                }}
              >
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                  {v.ico}
                </div>
                <h3
                  style={{
                    fontFamily: estArabe ? 'var(--font-arabic)' : 'var(--font-display)',
                    fontSize: estArabe ? '20px' : '19px',
                    fontWeight: estArabe ? 500 : 600,
                    color: 'var(--ch-noir)',
                    letterSpacing: '0.01em',
                    marginBottom: '12px',
                  }}
                >
                  {v.titre}
                </h3>
                <p
                  style={{
                    fontFamily: fontArabe || 'var(--font-body)',
                    fontSize: estArabe ? '14px' : '13px',
                    fontWeight: 300,
                    color: 'var(--ch-gris-texte)',
                    lineHeight: 1.7,
                    maxWidth: '280px',
                    margin: '0 auto',
                  }}
                >
                  {v.sous}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer
        style={{
          background: 'var(--ch-noir)',
          padding: 'clamp(48px, 6vw, 72px) clamp(16px, 4vw, 48px) clamp(24px, 3vw, 36px)',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '32px',
          }}
        >
          {/* Logo footer */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', justifyContent: 'center', marginBottom: '10px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '36px',
                  fontWeight: 300,
                  color: 'var(--ch-or)',
                  letterSpacing: '0.06em',
                  lineHeight: 1,
                }}
              >
                CH
              </span>
              <span
                style={{
                  fontFamily: fontArabe || 'var(--font-body)',
                  fontSize: '8px',
                  fontWeight: 500,
                  letterSpacing: estArabe ? '0.05em' : '0.24em',
                  textTransform: 'uppercase',
                  color: 'rgba(201,168,76,0.45)',
                }}
              >
                {estArabe ? 'أكسسوارات' : 'ACCESSOIRES'}
              </span>
            </div>
            <p
              style={{
                fontFamily: fontArabe || 'var(--font-display)',
                fontStyle: estArabe ? 'normal' : 'italic',
                fontSize: estArabe ? '14px' : '13px',
                fontWeight: 300,
                color: 'rgba(200,196,188,0.45)',
                letterSpacing: '0.04em',
              }}
            >
              {T.footerTagline}
            </p>
          </div>

          {/* Séparateur */}
          <div style={{ width: '48px', height: '0.5px', background: 'rgba(201,168,76,0.25)' }} />

          {/* Infos pratiques */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px 32px',
              justifyContent: 'center',
            }}
          >
            {[T.footerLivraison, T.footerPaiement].map((info, i) => (
              <span
                key={i}
                style={{
                  fontFamily: fontArabe || 'var(--font-body)',
                  fontSize: estArabe ? '12px' : '10px',
                  fontWeight: 400,
                  letterSpacing: estArabe ? 0 : '0.12em',
                  textTransform: estArabe ? 'none' : 'uppercase',
                  color: 'rgba(200,196,188,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {i > 0 && (
                  <span style={{ width: '1px', height: '10px', background: 'rgba(200,196,188,0.2)', display: 'inline-block' }} />
                )}
                {info}
              </span>
            ))}
          </div>

          {/* Copyright */}
          <p
            style={{
              fontFamily: fontArabe || 'var(--font-body)',
              fontSize: estArabe ? '11px' : '9px',
              color: 'rgba(200,196,188,0.25)',
              letterSpacing: estArabe ? 0 : '0.08em',
              textAlign: 'center',
            }}
          >
            {T.footerDroits}
          </p>
        </div>
      </footer>
    </div>
  )
}

// ── Carte produit ─────────────────────────────────────────────

type CarteProps = {
  produit: ProduitAvecVariantes
  langue: 'fr' | 'ar'
  estArabe: boolean
  T: typeof TEXTES['fr']
}

function CarteProducte({ produit, estArabe, T }: CarteProps) {
  const [survole, setSurvole] = useState(false)
  const fontArabe = estArabe ? 'var(--font-arabic)' : undefined
  const nomProduit = estArabe ? produit.nom_ar : produit.nom_fr
  const descProduit = estArabe ? produit.description_ar : produit.description_fr

  // Image principale : première image de la première variante (locale ou externe)
  const premiereImage = produit.variantes
    .flatMap((v) => v.images)
    .find((img) => typeof img === 'string' && img.length > 0)

  const nbColoris = produit.variantes.length

  return (
    <Link
      href={`/produits/${produit.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <article
        onMouseEnter={() => setSurvole(true)}
        onMouseLeave={() => setSurvole(false)}
        style={{
          background: 'var(--ch-blanc)',
          border: survole ? '0.5px solid var(--ch-or)' : 'var(--ch-border)',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
      >
        {/* Image produit — ratio 3:4 */}
        <div
          style={{
            aspectRatio: '3 / 4',
            background: 'var(--ch-beige)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {premiereImage ? (
            <Image
              src={premiereImage}
              alt={nomProduit}
              fill
              style={{
                objectFit: 'cover',
                transition: 'transform 0.55s ease',
                transform: survole ? 'scale(1.05)' : 'scale(1)',
              }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            /* Placeholder si aucune image */
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '52px',
                  fontWeight: 300,
                  color: 'var(--ch-or)',
                  opacity: 0.35,
                  letterSpacing: '0.06em',
                }}
              >
                CH
              </span>
            </div>
          )}

          {/* Badge "Nouveau" si produit récent (< 30 jours) */}
          {isNouveauProduit(produit.created_at) && (
            <div
              style={{
                position: 'absolute',
                top: '16px',
                ...(estArabe ? { right: '16px' } : { left: '16px' }),
                background: 'var(--ch-noir)',
                color: 'var(--ch-or)',
                fontFamily: fontArabe || 'var(--font-body)',
                fontSize: estArabe ? '11px' : '8.5px',
                fontWeight: 500,
                letterSpacing: estArabe ? 0 : '0.18em',
                textTransform: estArabe ? 'none' : 'uppercase',
                padding: '4px 10px',
              }}
            >
              {estArabe ? 'جديدة' : 'Nouveau'}
            </div>
          )}
        </div>

        {/* Infos produit */}
        <div style={{ padding: '20px 20px 22px' }}>
          {/* Nom produit */}
          <h3
            style={{
              fontFamily: estArabe ? 'var(--font-arabic)' : 'var(--font-display)',
              fontSize: '20px',
              fontWeight: estArabe ? 500 : 400,
              color: 'var(--ch-noir)',
              letterSpacing: estArabe ? '0.01em' : '0.02em',
              marginBottom: '8px',
              lineHeight: 1.2,
            }}
          >
            {nomProduit}
          </h3>

          {/* Description courte — 2 lignes max */}
          {descProduit && (
            <p
              style={{
                fontFamily: fontArabe || 'var(--font-body)',
                fontSize: estArabe ? '13px' : '12px',
                fontWeight: 300,
                color: 'var(--ch-gris-texte)',
                lineHeight: 1.6,
                marginBottom: '16px',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as CSSProperties['WebkitBoxOrient'],
              }}
            >
              {descProduit}
            </p>
          )}

          {/* Dots coloris */}
          {produit.variantes.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {produit.variantes.map((v) => (
                <div
                  key={v.id}
                  title={estArabe ? v.couleur_ar : v.couleur_fr}
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: v.couleur_hex || '#000',
                    border: '1.5px solid rgba(0,0,0,0.1)',
                    flexShrink: 0,
                  }}
                />
              ))}
              <span
                style={{
                  fontFamily: fontArabe || 'var(--font-body)',
                  fontSize: estArabe ? '12px' : '10px',
                  fontWeight: 400,
                  color: 'var(--ch-gris-texte)',
                  letterSpacing: estArabe ? 0 : '0.06em',
                }}
              >
                {nbColoris === 1 ? T.unColoris : `${nbColoris} ${T.couleurs}`}
              </span>
            </div>
          )}

          {/* Prix + CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: 'var(--ch-border)',
              paddingTop: '16px',
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: fontArabe || 'var(--font-body)',
                  fontSize: '19px',
                  fontWeight: 500,
                  color: 'var(--ch-noir)',
                }}
              >
                {T.prix}
              </span>
              <p
                style={{
                  fontFamily: fontArabe || 'var(--font-body)',
                  fontSize: estArabe ? '11px' : '9.5px',
                  fontWeight: 400,
                  letterSpacing: estArabe ? 0 : '0.1em',
                  textTransform: estArabe ? 'none' : 'uppercase',
                  color: 'var(--ch-gris-texte)',
                  marginTop: '2px',
                }}
              >
                {T.paiementLivraison}
              </p>
            </div>

            {/* Bouton Découvrir */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                fontFamily: fontArabe || 'var(--font-body)',
                fontSize: estArabe ? '12px' : '9.5px',
                fontWeight: 500,
                letterSpacing: estArabe ? 0 : '0.15em',
                textTransform: estArabe ? 'none' : 'uppercase',
                color: survole ? 'var(--ch-blanc)' : 'var(--ch-noir)',
                background: survole ? 'var(--ch-noir)' : 'transparent',
                border: '1px solid var(--ch-noir)',
                padding: estArabe ? '9px 16px' : '9px 18px',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {T.decouvrir}
              {!estArabe && <IcoArrow />}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

// ── Utilitaire : produit < 30 jours = "Nouveau" ───────────────
function isNouveauProduit(createdAt?: string): boolean {
  if (!createdAt) return false
  const diff = Date.now() - new Date(createdAt).getTime()
  return diff < 30 * 24 * 60 * 60 * 1000
}
