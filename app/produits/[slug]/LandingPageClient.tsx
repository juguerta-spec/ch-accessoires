'use client'

// ============================================================
// app/produits/[slug]/LandingPageClient.tsx
// CRO amélioré : prix barré, CTA sticky mobile, stock visible,
// preuve sociale commandes/jour, "Comment ça marche",
// bannière garanties, WhatsApp header, message cadeau toggle
// ============================================================

import { useState, useEffect, useRef } from 'react'
import type { Produit, Variante } from '@/lib/supabase'
import { useLanguage } from '@/hooks/useLanguage'
import { trackViewContent, trackAddToCart, genererEventId } from '@/lib/meta-pixel'

import UrgencyBanner from '@/components/store/UrgencyBanner'
import ProductGallery from '@/components/store/ProductGallery'
import ColorSelector from '@/components/store/ColorSelector'
import SocialProof from '@/components/store/SocialProof'
import OrderForm from '@/components/store/OrderForm'
import LanguageToggle from '@/components/store/LanguageToggle'

const FAQ_FR = [
  { q: 'Quel est le délai de livraison ?', r: "Livraison sous 1 à 5 jours ouvrables dans les 58 wilayas. Vous serez contacté par téléphone avant la livraison." },
  { q: 'Comment fonctionne le paiement ?', r: "Vous payez uniquement à la réception. Aucune carte bancaire requise — paiement Cash on Delivery (COD) uniquement." },
  { q: 'Puis-je vérifier le produit avant de payer ?', r: "Oui, absolument. Inspectez votre colis devant le livreur avant de régler. C'est votre droit." },
  { q: 'Le sac existe en d\'autres tailles ?', r: "Le Sac CH Signature est en taille unique standard, conçue pour un usage quotidien polyvalent et élégant." },
  { q: 'Comment choisir le coloris ?', r: "Le Noir est intemporel et polyvalent. Le Burgundy est profond et élégant — parfait pour se démarquer." },
]

const FAQ_AR = [
  { q: 'قداش يأخذ الليفراج؟', r: "الليفراج يأخذ 1 إلى 5 أيام في قاع الـ 58 ولاية. غادي يتصلو بيك بالتيليفون قبل التسليم." },
  { q: 'كيفاش يتم الدفع؟', r: "تدفع غير وقت تستلم طلبك. ما كاين بطاقة — الدفع عند الاستلام (COD) غير." },
  { q: 'واش نقدر نفحص المنتج قبل ما ندفع؟', r: "آه، بالطبع. افحص طلبك قدام الموزع قبل ما تدفع. هذا حقك." },
  { q: 'واش الشنطة متوفرة بأحجام أخرى؟', r: "شنطة CH Signature متوفرة بحجم قياسي واحد، مصنوعة للاستعمال اليومي الأنيق." },
  { q: 'كيفاش نختار اللون؟', r: "الكحل كلاسيكي وعملي. البورغاندي عميق وأنيق — مثالي باش تتميزي." },
]

function FaqItem({ q, r, open, onToggle, isAr }: { q: string; r: string; open: boolean; onToggle: () => void; isAr: boolean }) {
  const font = isAr ? 'var(--font-arabic)' : 'var(--font-body)'
  return (
    <div style={{ borderBottom: '0.5px solid rgba(201,168,76,0.15)' }}>
      <button onClick={onToggle} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '24px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 20,
        textAlign: isAr ? 'right' : 'left',
      }}>
        <span style={{ fontFamily: font, fontSize: isAr ? '18px' : '14px', fontWeight: 400, color: '#FAFAF7', lineHeight: 1.5 }}>{q}</span>
        <span style={{
          color: '#C9A84C', fontSize: 24, flexShrink: 0,
          transition: 'transform 0.25s ease', transform: open ? 'rotate(45deg)' : 'none', lineHeight: 1,
          fontWeight: 200,
        }}>+</span>
      </button>
      {open && (
        <p style={{ fontFamily: font, fontSize: isAr ? '17px' : '13px', fontWeight: 300, color: 'rgba(250,250,247,0.6)', lineHeight: 1.9, paddingBottom: 24 }}>{r}</p>
      )}
    </div>
  )
}

// ── Icônes SVG pour la bannière garanties ─────────────────────
function IcoShield() {
  return (
    <svg width="20" height="22" viewBox="0 0 20 22" fill="none" aria-hidden="true">
      <path d="M10 1L2 5v7c0 5 3.55 9.35 8 10.5C14.45 21.35 18 17 18 12V5L10 1z" stroke="#C9A84C" strokeWidth="1.2" fill="rgba(201,168,76,0.08)" strokeLinejoin="round"/>
      <path d="M6.5 11l2.5 2.5 4.5-5" stroke="#C9A84C" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IcoTruck() {
  return (
    <svg width="22" height="18" viewBox="0 0 22 18" fill="none" aria-hidden="true">
      <path d="M1 2h13v10H1V2z" stroke="#C9A84C" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M14 6h4.5L21 10v4h-7V6z" stroke="#C9A84C" strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="5" cy="15" r="2" stroke="#C9A84C" strokeWidth="1.2"/>
      <circle cx="17" cy="15" r="2" stroke="#C9A84C" strokeWidth="1.2"/>
    </svg>
  )
}

function IcoCheckCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="#C9A84C" strokeWidth="1.2"/>
      <path d="M6.5 10l2.5 2.5 4.5-5" stroke="#C9A84C" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

type Props = { produit: Produit; variantes: Variante[]; commandesToday: number }

export default function LandingPageClient({ produit, variantes, commandesToday }: Props) {
  const { estArabe } = useLanguage()
  const [varianteActive, setVarianteActive] = useState<Variante>(variantes[0])
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [montrerCTASticky, setMontrerCTASticky] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const formWrapRef = useRef<HTMLDivElement>(null)
  const addToCartFired = useRef(false)
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''

  // Tracking ViewContent Meta Pixel
  useEffect(() => {
    trackViewContent({ eventId: genererEventId(), produitId: produit.id, nomProduit: produit.nom_fr, prix: produit.prix })
  }, [produit.id, produit.nom_fr, produit.prix])

  // Tracking AddToCart quand le panneau info est visible
  useEffect(() => {
    const el = formRef.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !addToCartFired.current) {
        addToCartFired.current = true
        trackAddToCart({ eventId: genererEventId(), varianteId: varianteActive.id, nomProduit: produit.nom_fr, prix: produit.prix })
      }
    }, { threshold: 0.2 })
    obs.observe(el); return () => obs.disconnect()
  }, [varianteActive.id, produit.nom_fr, produit.prix])

  // CTA sticky mobile — apparaît après 350px de scroll
  useEffect(() => {
    function onScroll() { setMontrerCTASticky(window.scrollY > 350) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Masquer le CTA sticky quand le formulaire est à l'écran
  useEffect(() => {
    const el = formWrapRef.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => setFormVisible(e.isIntersecting), { threshold: 0.1 })
    obs.observe(el); return () => obs.disconnect()
  }, [])

  const nomProduit = estArabe ? produit.nom_ar : produit.nom_fr
  const description = estArabe ? produit.description_ar : produit.description_fr
  const faq = estArabe ? FAQ_AR : FAQ_FR
  const fa = estArabe ? 'var(--font-arabic)' : 'var(--font-body)'
  const fd = estArabe ? 'var(--font-arabic)' : 'var(--font-display)'

  const WHY = estArabe ? [
    { n: '01', t: 'جودة فاخرة', c: 'جلد صناعي هاي-إند وبطانة متينة تبقى مدة طويلة. كل تفصيلة مختارة بعناية.' },
    { n: '02', t: 'ثمن في المتناول', c: 'الفاخر بـ 2500 دج. جودة عالية بثمن عادل — بلا تنازل.' },
    { n: '03', t: 'توصيل سريع', c: '1–5 أيام في الـ 58 ولاية. متابعة هاتفية شخصية قبل التسليم.' },
    { n: '04', t: 'راضٍ أو مسترد', c: 'افحص طلبك قدام الموزع قبل ما تدفع. رضاك الأولوية.' },
    { n: '05', t: 'هدية مثالية', c: 'تغليف أنيق وبطاقة هدية مخصصة عند الطلب. لحظة ما تنساهاش.' },
  ] : [
    { n: '01', t: 'Qualité premium', c: 'Cuir synthétique haut de gamme, doublure robuste. Chaque détail est pensé pour durer.' },
    { n: '02', t: 'Prix accessible', c: 'Le luxe à 2 500 DA — sans compromis sur la qualité ni le style.' },
    { n: '03', t: 'Livraison rapide', c: 'Livraison en 1–5 jours dans les 58 wilayas. Suivi téléphonique personnalisé.' },
    { n: '04', t: 'Vérifiez avant de payer', c: 'Inspectez votre colis devant le livreur. Vous payez seulement si vous êtes satisfait.' },
    { n: '05', t: 'Le cadeau parfait', c: 'Emballage soigné et message personnalisé disponibles sur demande.' },
  ]

  const etapesCM = estArabe ? [
    { n: '1', t: 'اختاري لونك', c: 'كحل كلاسيكي أو بورغاندي عميق' },
    { n: '2', t: 'دخلي معلوماتك', c: 'الاسم والتيليفون والولاية — دقيقتين بصح' },
    { n: '3', t: 'استلمي وادفعي', c: 'الموزع يجي، تفحصي، تدفعي عند الاستلام' },
  ] : [
    { n: '1', t: 'Choisissez votre coloris', c: 'Noir intemporel ou Burgundy profond' },
    { n: '2', t: 'Entrez vos coordonnées', c: 'Nom, téléphone, wilaya — 2 minutes chrono' },
    { n: '3', t: 'Recevez et payez', c: 'Le livreur livre, vous vérifiez, vous payez à la réception' },
  ]

  const garanties = estArabe ? [
    { ico: <IcoShield />, t: 'دفع عند الاستلام', c: 'ما كاين دفع مسبق' },
    { ico: <IcoTruck />, t: 'ليفراج 1–5 أيام', c: '58 ولاية' },
    { ico: <IcoCheckCircle />, t: 'افحص قبل ما تدفع', c: 'قدام الموزع' },
  ] : [
    { ico: <IcoShield />, t: 'Paiement à la réception', c: 'Aucun paiement avant' },
    { ico: <IcoTruck />, t: 'Livraison 1–5 jours', c: '58 wilayas' },
    { ico: <IcoCheckCircle />, t: 'Vérifiez avant de payer', c: 'Devant le livreur' },
  ]

  return (
    <div style={{ background: '#FAFAF7', minHeight: '100vh' }}>

      {/* ── CTA STICKY MOBILE — slides in after scroll, hidden on desktop ── */}
      <style>{`
        .sticky-cta-bar {
          display: flex;
          position: fixed; bottom: 0; left: 0; right: 0;
          background: #0A0A0A;
          border-top: 0.5px solid rgba(201,168,76,0.4);
          padding: 10px 16px;
          align-items: center;
          gap: 12px;
          z-index: 100;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        @media(min-width: 768px){ .sticky-cta-bar { display: none !important; } }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
      <div
        className="sticky-cta-bar"
        style={{
          transform: montrerCTASticky && !formVisible ? 'translateY(0)' : 'translateY(100%)',
          opacity: montrerCTASticky && !formVisible ? 1 : 0,
          pointerEvents: montrerCTASticky && !formVisible ? 'auto' : 'none',
        }}
      >
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)', marginBottom: '2px' }}>
            {estArabe ? 'دفع عند الاستلام' : 'Paiement à la livraison'}
          </p>
          <p dir="ltr" style={{ fontFamily: 'var(--font-body)', fontSize: '22px', fontWeight: 500, color: '#C9A84C', lineHeight: 1 }}>
            2 500 <span style={{ fontSize: '12px', fontWeight: 300 }}>DA</span>
          </p>
        </div>
        <a
          href="#order-form"
          style={{
            background: '#C9A84C', color: '#0A0A0A',
            fontFamily: fa,
            fontSize: estArabe ? '14px' : '10px',
            fontWeight: 700,
            letterSpacing: estArabe ? 0 : '0.15em',
            textTransform: estArabe ? 'none' : 'uppercase',
            padding: '14px 20px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {estArabe ? 'طلبي دروك' : 'Commander'}
        </a>
      </div>

      {/* ── URGENCY BAR ── */}
      <UrgencyBanner />

      {/* ── HEADER ── */}
      <header style={{
        background: '#0A0A0A',
        padding: '0 28px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: '40px',
        zIndex: 40,
        borderBottom: '0.5px solid rgba(201,168,76,0.15)',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 300, color: '#C9A84C', letterSpacing: '0.14em', lineHeight: 1 }}>CH</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '6.5px', fontWeight: 500, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.7)', marginTop: '3px' }}>ACCESSOIRES</div>
        </div>
        {/* Droite header : WhatsApp + toggle langue */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {wa && (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 500,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'rgba(201,168,76,0.7)', textDecoration: 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(201,168,76,0.7)" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          )}
          <LanguageToggle />
        </div>
      </header>

      {/* ──────────────────────────────────────────────
          SECTION PRODUIT — 2 colonnes desktop
      ────────────────────────────────────────────── */}
      <div className="product-layout">

        {/* Galerie sticky desktop */}
        <div className="gallery-panel">
          <ProductGallery variante={varianteActive} nomProduit={nomProduit} />
        </div>

        {/* Colonne infos + formulaire — fond noir */}
        <div className="info-panel" ref={formRef} style={{ background: '#0A0A0A' }}>

          {/* Tag collection */}
          <p style={{ fontFamily: fa, fontSize: estArabe ? '15px' : '11px', fontWeight: 500, letterSpacing: estArabe ? 0 : '0.24em', textTransform: estArabe ? 'none' : 'uppercase', color: '#C9A84C', marginBottom: '18px' }}>
            {estArabe ? 'كوليكسيون 2025' : 'Collection 2025'}
          </p>

          {/* Nom produit */}
          <h1 style={{
            fontFamily: fd,
            fontSize: estArabe ? '40px' : '44px',
            fontWeight: estArabe ? 400 : 300,
            letterSpacing: estArabe ? 0 : '0.03em',
            color: '#FAFAF7',
            lineHeight: 1.12,
            marginBottom: '12px',
          }}>
            {nomProduit}
          </h1>

          {/* Coloris actif */}
          <p style={{ fontFamily: fa, fontSize: estArabe ? '17px' : '12px', fontWeight: 400, letterSpacing: estArabe ? 0 : '0.14em', textTransform: estArabe ? 'none' : 'uppercase', color: 'rgba(250,250,247,0.45)', marginBottom: '26px' }}>
            {estArabe ? varianteActive.couleur_ar : varianteActive.couleur_fr}
          </p>

          {/* Sélecteur coloris */}
          <div style={{ marginBottom: '10px' }}>
            <ColorSelector variantes={variantes} varianteActive={varianteActive} onChange={setVarianteActive} fondSombre />
          </div>

          {/* Stock count — toujours visible sous le sélecteur */}
          <p style={{
            fontFamily: fa,
            fontSize: estArabe ? '13px' : '11px',
            fontWeight: 400,
            color: varianteActive.stock <= 10 ? '#E88080' : 'rgba(201,168,76,0.55)',
            letterSpacing: estArabe ? 0 : '0.06em',
            marginBottom: '28px',
          }}>
            {varianteActive.stock <= 0
              ? (estArabe ? 'مش متوفر دروك' : 'Rupture de stock')
              : varianteActive.stock <= 10
                ? (estArabe ? `${varianteActive.stock} قطع بقاو غير — طلبي دروك` : `Seulement ${varianteActive.stock} pièce(s) disponible(s) — Commandez vite`)
                : (estArabe ? `${varianteActive.stock} قطعة متوفرة` : `${varianteActive.stock} pièces disponibles`)}
          </p>

          {/* Séparateur or */}
          <div style={{ borderTop: '0.5px solid rgba(201,168,76,0.18)', marginBottom: '26px' }} />

          {/* Prix barré + prix actuel — dir="ltr" empêche l'inversion en RTL */}
          <div dir="ltr" style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            {/* Prix barré — valeur de référence */}
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '18px', fontWeight: 300, color: 'rgba(201,168,76,0.35)', textDecoration: 'line-through', letterSpacing: '0.02em' }}>
              3 990 DA
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '34px', fontWeight: 500, color: '#C9A84C', lineHeight: 1, letterSpacing: '-0.01em' }}>
              {produit.prix.toLocaleString('fr-DZ')}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 300, color: 'rgba(201,168,76,0.5)' }}>DA</span>
          </div>
          <p style={{ fontFamily: fa, fontSize: estArabe ? '16px' : '12px', fontWeight: 400, letterSpacing: estArabe ? 0 : '0.14em', textTransform: estArabe ? 'none' : 'uppercase', color: 'rgba(250,250,247,0.35)', marginBottom: '14px' }}>
            {estArabe ? 'دفع عند الاستلام — بلا بطاقة' : 'Paiement à la livraison — sans carte'}
          </p>

          {/* Badge social proof — commandes du jour */}
          {commandesToday > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: 'rgba(201,168,76,0.08)',
              border: '0.5px solid rgba(201,168,76,0.22)',
              padding: '5px 12px',
              marginBottom: '20px',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#C9A84C', display: 'inline-block',
                animation: 'pulse-dot 2s infinite',
                flexShrink: 0,
              }} />
              <span style={{ fontFamily: fa, fontSize: estArabe ? '14px' : '11px', fontWeight: 400, color: 'rgba(201,168,76,0.8)', letterSpacing: estArabe ? 0 : '0.05em' }}>
                {estArabe
                  ? `${commandesToday} شخص طلبوا اليوم`
                  : `${commandesToday} personnes ont commandé aujourd'hui`}
              </span>
            </div>
          )}

          {/* Description */}
          {description && (
            <p style={{ fontFamily: fa, fontSize: estArabe ? '19px' : '15px', fontWeight: 300, color: 'rgba(250,250,247,0.6)', lineHeight: 1.85, marginBottom: '34px', maxWidth: '420px' }}>
              {description}
            </p>
          )}

          {/* Séparateur or */}
          <div style={{ borderTop: '0.5px solid rgba(201,168,76,0.18)', marginBottom: '34px' }} />

          {/* ── Comment ça marche — 3 étapes avant le formulaire ── */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontFamily: fa, fontSize: estArabe ? '15px' : '10px', fontWeight: 500, letterSpacing: estArabe ? 0 : '0.2em', textTransform: estArabe ? 'none' : 'uppercase', color: 'rgba(201,168,76,0.6)', marginBottom: '16px' }}>
              {estArabe ? 'كيفاش يعمل هذا' : 'Comment ça marche'}
            </p>
            <div>
              {etapesCM.map((step, i) => (
                <div key={step.n} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  padding: '12px 0',
                  borderBottom: i < etapesCM.length - 1 ? '0.5px solid rgba(201,168,76,0.1)' : 'none',
                  direction: estArabe ? 'rtl' : 'ltr',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
                    color: '#C9A84C', background: 'rgba(201,168,76,0.12)',
                    width: '24px', height: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {step.n}
                  </span>
                  <div>
                    <p style={{ fontFamily: fa, fontSize: estArabe ? '16px' : '12px', fontWeight: 500, color: '#FAFAF7', letterSpacing: estArabe ? 0 : '0.05em', marginBottom: '2px' }}>{step.t}</p>
                    <p style={{ fontFamily: fa, fontSize: estArabe ? '14px' : '12px', fontWeight: 300, color: 'rgba(250,250,247,0.45)', lineHeight: 1.6 }}>{step.c}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bannière garanties — 3 piliers ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            background: 'rgba(201,168,76,0.18)',
            marginBottom: '32px',
          }}>
            {garanties.map((g, i) => (
              <div key={i} style={{ background: '#111', padding: '18px 8px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>{g.ico}</div>
                <p style={{ fontFamily: fa, fontSize: estArabe ? '12px' : '9.5px', fontWeight: 600, color: '#FAFAF7', letterSpacing: estArabe ? 0 : '0.06em', textTransform: estArabe ? 'none' : 'uppercase', lineHeight: 1.3, marginBottom: '3px' }}>{g.t}</p>
                <p style={{ fontFamily: fa, fontSize: estArabe ? '11px' : '10px', fontWeight: 300, color: 'rgba(250,250,247,0.4)', lineHeight: 1.4 }}>{g.c}</p>
              </div>
            ))}
          </div>

          {/* Formulaire COD — ref pour masquer le CTA sticky */}
          <div ref={formWrapRef}>
            <OrderForm
              variante={varianteActive}
              variantes={variantes}
              onVarianteChange={setVarianteActive}
              prix={produit.prix}
            />
          </div>

        </div>
      </div>

      {/* ──────────────────────────────────────────────
          BANDE SIGNATURE — 3 piliers, fond noir
      ────────────────────────────────────────────── */}
      <section style={{ background: '#0A0A0A', borderTop: '0.5px solid rgba(201,168,76,0.2)', borderBottom: '0.5px solid rgba(201,168,76,0.2)' }}>
        <style>{`
          .signature-grid { display: grid; grid-template-columns: 1fr; }
          @media(min-width: 768px){ .signature-grid { grid-template-columns: repeat(3,1fr); } }
          .signature-item { padding: 52px 40px; border-bottom: 0.5px solid rgba(201,168,76,0.12); }
          @media(min-width: 768px){
            .signature-item { border-bottom: none; border-right: 0.5px solid rgba(201,168,76,0.12); }
            .signature-item:last-child { border-right: none; }
          }
        `}</style>
        <div className="signature-grid" style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {[
            {
              n: estArabe ? '— ١ —' : '— I —',
              titre: estArabe ? 'جودة عالية' : 'Qualité premium',
              corps: estArabe ? 'خامات مختارة وتشطيبات يدوية دقيقة' : 'Matières sélectionnées, finitions artisanales',
            },
            {
              n: estArabe ? '— ٢ —' : '— II —',
              titre: estArabe ? 'ليفراج لقاع الجزائر' : 'Livraison nationale',
              corps: estArabe ? '1–5 أيام في الـ 58 ولاية' : '1–5 jours ouvrables · 58 wilayas',
            },
            {
              n: estArabe ? '— ٣ —' : '— III —',
              titre: estArabe ? 'دفع عند الاستلام' : 'Paiement COD',
              corps: estArabe ? 'ما تدفعش غير وقت تستلم' : 'Aucun paiement avant réception',
            },
          ].map((item, i) => (
            <div key={i} className="signature-item" style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontStyle: 'italic', fontWeight: 300, color: '#C9A84C', letterSpacing: '0.2em', marginBottom: '20px', opacity: 0.7 }}>{item.n}</p>
              <p style={{ fontFamily: fa, fontSize: estArabe ? '20px' : '12px', fontWeight: 500, letterSpacing: estArabe ? 0 : '0.18em', textTransform: estArabe ? 'none' : 'uppercase', color: '#FAFAF7', marginBottom: '10px' }}>{item.titre}</p>
              <p style={{ fontFamily: fa, fontSize: estArabe ? '17px' : '13px', fontWeight: 300, color: 'rgba(250,250,247,0.45)', lineHeight: 1.75 }}>{item.corps}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          POURQUOI CH — liste éditoriale sur beige
      ────────────────────────────────────────────── */}
      <section style={{ background: '#F0EDE8', padding: '100px 24px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>

          <div style={{ marginBottom: '64px', textAlign: estArabe ? 'right' : 'left' }}>
            <p style={{ fontFamily: fa, fontSize: estArabe ? '15px' : '11px', fontWeight: 500, letterSpacing: estArabe ? 0 : '0.24em', textTransform: estArabe ? 'none' : 'uppercase', color: '#C9A84C', marginBottom: '14px' }}>
              {estArabe ? 'مميزاتنا' : 'Notre promesse'}
            </p>
            <h2 style={{ fontFamily: fd, fontSize: estArabe ? '36px' : '42px', fontWeight: estArabe ? 400 : 300, letterSpacing: estArabe ? 0 : '0.03em', color: '#0A0A0A', lineHeight: 1.15 }}>
              {estArabe ? 'علاش CH Accessoires؟' : 'Pourquoi CH Accessoires ?'}
            </h2>
          </div>

          <div style={{ borderTop: '0.5px solid rgba(10,10,10,0.15)' }}>
            {WHY.map((item) => (
              <div key={item.n} style={{
                display: 'grid',
                gridTemplateColumns: '64px 1fr',
                gap: '32px',
                padding: '36px 0',
                borderBottom: '0.5px solid rgba(10,10,10,0.15)',
                alignItems: 'start',
                direction: estArabe ? 'rtl' : 'ltr',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: '42px', fontWeight: 300, color: '#C9A84C',
                  lineHeight: 1, opacity: 0.75,
                  textAlign: estArabe ? 'right' : 'left',
                }}>
                  {item.n}
                </span>
                <div>
                  <p style={{ fontFamily: fa, fontSize: estArabe ? '20px' : '12px', fontWeight: 500, letterSpacing: estArabe ? 0 : '0.14em', textTransform: estArabe ? 'none' : 'uppercase', color: '#0A0A0A', marginBottom: '10px' }}>
                    {item.t}
                  </p>
                  <p style={{ fontFamily: fa, fontSize: estArabe ? '18px' : '14px', fontWeight: 300, color: '#6B6660', lineHeight: 1.85 }}>
                    {item.c}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AVIS CLIENTS ── */}
      <SocialProof />

      {/* ──────────────────────────────────────────────
          FAQ — fond noir
      ────────────────────────────────────────────── */}
      <section style={{ background: '#0A0A0A', padding: '96px 24px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontFamily: fa, fontSize: estArabe ? '15px' : '11px', fontWeight: 500, letterSpacing: estArabe ? 0 : '0.24em', textTransform: estArabe ? 'none' : 'uppercase', color: '#C9A84C', marginBottom: '14px' }}>
              {estArabe ? 'مساعدة' : 'Support'}
            </p>
            <h2 style={{ fontFamily: fd, fontSize: estArabe ? '34px' : '38px', fontWeight: estArabe ? 400 : 300, letterSpacing: estArabe ? 0 : '0.03em', color: '#FAFAF7' }}>
              {estArabe ? 'الأسئلة الشائعة' : 'Questions fréquentes'}
            </h2>
          </div>

          <div style={{ borderTop: '0.5px solid rgba(201,168,76,0.15)' }}>
            {faq.map((item, i) => (
              <FaqItem key={i} q={item.q} r={item.r} open={faqOpen === i} onToggle={() => setFaqOpen(faqOpen === i ? null : i)} isAr={estArabe} />
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          CTA FINAL — fond noir dramatique
      ────────────────────────────────────────────── */}
      <section style={{ background: '#0A0A0A', padding: '100px 24px', textAlign: 'center', borderTop: '0.5px solid rgba(201,168,76,0.2)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ width: '48px', height: '0.5px', background: '#C9A84C', margin: '0 auto 36px', opacity: 0.8 }} />

          <p style={{ fontFamily: fa, fontSize: estArabe ? '15px' : '11px', fontWeight: 500, letterSpacing: estArabe ? 0 : '0.24em', textTransform: estArabe ? 'none' : 'uppercase', color: '#C9A84C', marginBottom: '18px', opacity: 0.9 }}>
            {estArabe ? 'طلبي دروك' : 'Commander maintenant'}
          </p>

          <h2 style={{ fontFamily: fd, fontSize: estArabe ? '38px' : '48px', fontWeight: estArabe ? 400 : 300, fontStyle: estArabe ? 'normal' : 'italic', letterSpacing: estArabe ? 0 : '0.02em', color: '#FAFAF7', marginBottom: '16px', lineHeight: 1.2 }}>
            {estArabe ? 'أضيفي اللمسة الأنيقة لإطلالتك' : "L'élégance qui vous ressemble"}
          </h2>

          <p style={{ fontFamily: fa, fontSize: estArabe ? '18px' : '14px', fontWeight: 300, color: 'rgba(250,250,247,0.4)', marginBottom: '48px', lineHeight: 1.8, letterSpacing: estArabe ? 0 : '0.03em' }}>
            {estArabe ? '2 500 دج — دفع عند الاستلام — توصيل لجميع الولايات' : "2 500 DA · Paiement à la livraison · Livraison dans toute l'Algérie"}
          </p>

          <a
            href="#order-form"
            style={{
              display: 'block',
              maxWidth: '360px',
              margin: '0 auto',
              background: '#C9A84C',
              color: '#0A0A0A',
              fontFamily: fa,
              fontSize: estArabe ? '20px' : '11px',
              fontWeight: estArabe ? 600 : 700,
              letterSpacing: estArabe ? 0 : '0.18em',
              textTransform: estArabe ? 'none' : 'uppercase',
              padding: '20px 40px',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'background 0.15s ease',
            }}
          >
            {estArabe ? <>اطلبي الآن — <span dir="ltr">2 500 DA</span></> : 'Je veux ce sac — 2 500 DA'}
          </a>

          <p style={{ fontFamily: fa, fontSize: estArabe ? '16px' : '12px', fontWeight: 300, color: 'rgba(250,250,247,0.3)', marginTop: '20px', letterSpacing: estArabe ? 0 : '0.04em' }}>
            {estArabe ? 'لا دفع مسبق · تدفع عند الاستلام' : 'Aucun paiement maintenant · Vous payez à la réception'}
          </p>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          FOOTER
      ────────────────────────────────────────────── */}
      <footer style={{ background: '#060606', padding: '56px 28px', borderTop: '0.5px solid rgba(201,168,76,0.15)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '28px' }}>

          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 300, color: '#C9A84C', letterSpacing: '0.14em', lineHeight: 1 }}>CH</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '6.5px', fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.55)', marginTop: '4px' }}>ACCESSOIRES</div>
          </div>

          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
            {wa && (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(250,250,247,0.45)', textDecoration: 'none' }}>
                WhatsApp
              </a>
            )}
            <a href="https://instagram.com/ch.accessoires" target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(250,250,247,0.45)', textDecoration: 'none' }}>
              Instagram
            </a>
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 300, color: 'rgba(250,250,247,0.2)', letterSpacing: '0.08em' }}>
            © 2026 CH Accessoires — Tous droits réservés
          </p>
        </div>
      </footer>

    </div>
  )
}
