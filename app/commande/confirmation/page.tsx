'use client'

// ============================================================
// app/commande/confirmation/page.tsx — Page de confirmation post-commande
// Design sombre + section blanche — récap commande + étapes livraison
// ============================================================

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/hooks/useLanguage'
import { trackLead } from '@/lib/meta-pixel'

// ── Icônes ────────────────────────────────────────────────────

function IcoCheck() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <path d="M6 15l6.5 6.5 11.5-13" stroke="#C9A84C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IcoWhatsApp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

// ── Contenu de la page ────────────────────────────────────────

function ConfirmationContenu() {
  const searchParams  = useSearchParams()
  const { estArabe }  = useLanguage()

  const numero     = searchParams.get('numero') || ''
  const commandeId = searchParams.get('id') || ''
  const eventId    = searchParams.get('event_id') || ''
  const numero_tel = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''

  // Lead Pixel — même eventId que OrderForm + CAPI → déduplication Meta
  useEffect(() => {
    if (numero && eventId) {
      trackLead({
        eventId,
        commandeNumero: numero,
        montant: 3500,
        quantite: 1,
        varianteId: commandeId,
      })
    }
  }, [numero, eventId, commandeId])

  const fa = estArabe ? 'var(--font-arabic)' : 'var(--font-body)'
  const fd = estArabe ? 'var(--font-arabic)' : 'var(--font-display)'

  // Message WhatsApp client → admin
  const messageClient = encodeURIComponent(
    estArabe
      ? `السلام، كملت طلبي برقم ${numero}. واش تقدرو تأكدوا لي وقت الليفراج؟`
      : `Bonjour, j'ai passé la commande n°${numero}. Pouvez-vous confirmer le délai de livraison ?`
  )

  const etapes = [
    {
      ico: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M3 9l4 4 8-8" stroke="var(--ch-or)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      titre: estArabe ? 'غادي نتصلو بيك للتأكيد' : 'On vous appelle pour confirmer',
      sous:  estArabe ? 'الفريق ديالنا غادي يتصل بك في 24 ساعة' : 'Notre équipe vous contacte sous 24h pour valider la commande',
    },
    {
      ico: (
        <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
          <path d="M1 2h11v8H1V2z" stroke="var(--ch-or)" strokeWidth="1.2" strokeLinejoin="round"/>
          <path d="M12 5h3.5L18 9v4h-6V5z" stroke="var(--ch-or)" strokeWidth="1.2" strokeLinejoin="round"/>
          <circle cx="4" cy="13.5" r="1.5" stroke="var(--ch-or)" strokeWidth="1.2"/>
          <circle cx="14.5" cy="13.5" r="1.5" stroke="var(--ch-or)" strokeWidth="1.2"/>
        </svg>
      ),
      titre: estArabe ? 'الليفراج مجاني لبابك' : 'Livraison offerte à votre porte',
      sous:  estArabe ? '1 إلى 5 أيام في الـ 69 ولاية · الليفراج مجاني' : '1 à 5 jours · 69 wilayas · sans frais',
    },
    {
      ico: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7.5" stroke="var(--ch-or)" strokeWidth="1.2"/>
          <path d="M6 9l2.5 2.5 3.5-4" stroke="var(--ch-or)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      titre: estArabe ? 'الدفع عند الاستلام' : 'Vous payez à la livraison',
      sous:  estArabe ? 'افحص الطلبية قدام الموزع قبل ما تدفع — حقك' : 'Inspectez votre colis devant le livreur. Vous payez seulement si satisfait.',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', direction: estArabe ? 'rtl' : 'ltr' }}>

      {/* ── Section noire — hero confirmation ── */}
      <div style={{
        background: '#0A0A0A',
        padding: '48px 24px 40px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center',
      }}>

        {/* Logo */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 300, color: '#C9A84C', letterSpacing: '0.14em', lineHeight: 1 }}>CH</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '7px', fontWeight: 500, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.5)', marginTop: '4px' }}>ACCESSOIRES</div>
        </div>

        {/* Check circle */}
        <div style={{
          width: '84px', height: '84px',
          border: '1.5px solid #C9A84C',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '24px',
          background: 'rgba(201,168,76,0.07)',
          boxShadow: '0 0 48px rgba(201,168,76,0.1)',
        }}>
          <IcoCheck />
        </div>

        {/* Titre */}
        <h1 style={{
          fontFamily: fd,
          fontSize: estArabe ? '30px' : '36px',
          fontWeight: estArabe ? 500 : 300,
          color: '#FAFAF7',
          letterSpacing: estArabe ? 0 : '0.03em',
          marginBottom: '8px',
          lineHeight: 1.2,
        }}>
          {estArabe ? 'تأكد طلبك!' : 'Commande confirmée !'}
        </h1>
        <p style={{
          fontFamily: fa, fontSize: estArabe ? '15px' : '13px',
          fontWeight: 300, color: 'rgba(250,250,247,0.45)',
          marginBottom: '32px', maxWidth: '320px', lineHeight: 1.6,
        }}>
          {estArabe ? 'شكراً على ثقتك — الطلبية وصلتنا بنجاح' : 'Merci pour votre confiance — votre commande est bien reçue'}
        </p>

        {/* Numéro commande */}
        {numero && (
          <div style={{
            background: 'rgba(201,168,76,0.08)',
            border: '0.5px solid rgba(201,168,76,0.3)',
            padding: '16px 40px',
            marginBottom: '24px',
          }}>
            <p style={{
              fontFamily: fa, fontSize: estArabe ? '11px' : '9px',
              fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'rgba(201,168,76,0.5)', marginBottom: '6px',
            }}>
              {estArabe ? 'رقم الطلبية ديالك' : 'Votre numéro de commande'}
            </p>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400,
              color: '#C9A84C', letterSpacing: '0.1em', lineHeight: 1,
            }}>
              {numero}
            </p>
          </div>
        )}

        {/* WhatsApp auto — confirmation envoyée */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(37,211,102,0.08)',
          border: '0.5px solid rgba(37,211,102,0.22)',
          padding: '9px 16px',
          marginBottom: '8px',
        }}>
          <IcoWhatsApp />
          <p style={{
            fontFamily: fa, fontSize: estArabe ? '13px' : '11px',
            fontWeight: 400, color: 'rgba(37,211,102,0.8)',
          }}>
            {estArabe
              ? 'رسالة واتساب تأكيد تتبعثلك دروك'
              : 'Message WhatsApp de confirmation envoyé'}
          </p>
        </div>
      </div>

      {/* ── Section blanche — étapes + récap + CTA ── */}
      <div style={{
        background: '#FAFAF7',
        borderTop: '1.5px solid #C9A84C',
        padding: '40px 24px 64px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>

        {/* Étapes */}
        <div style={{ width: '100%', maxWidth: '440px', marginBottom: '32px' }}>
          {etapes.map((etape, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '16px',
              padding: '18px 0',
              borderBottom: i < etapes.length - 1 ? 'var(--ch-border)' : 'none',
              direction: estArabe ? 'rtl' : 'ltr',
            }}>
              <div style={{
                width: '38px', height: '38px', flexShrink: 0,
                background: 'rgba(201,168,76,0.07)',
                border: '0.5px solid rgba(201,168,76,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {etape.ico}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: fa, fontSize: estArabe ? '15px' : '13px',
                  fontWeight: 500, color: 'var(--ch-noir)', marginBottom: '4px',
                }}>
                  {etape.titre}
                </p>
                <p style={{
                  fontFamily: fa, fontSize: estArabe ? '13px' : '12px',
                  fontWeight: 300, color: 'var(--ch-gris-texte)', lineHeight: 1.65,
                }}>
                  {etape.sous}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Récap paiement */}
        <div style={{
          width: '100%', maxWidth: '440px',
          background: 'var(--ch-beige)',
          border: 'var(--ch-border)',
          padding: '16px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '28px',
          direction: 'ltr',
        }}>
          <div>
            <p style={{
              fontFamily: fa, fontSize: estArabe ? '12px' : '10px',
              fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--ch-gris-texte)', marginBottom: '2px',
            }}>
              {estArabe ? 'تدفع وقت الاستلام' : 'À payer à la livraison'}
            </p>
            <p style={{
              fontFamily: fa, fontSize: estArabe ? '11px' : '10px',
              fontWeight: 300, color: 'var(--ch-gris-texte)',
            }}>
              {estArabe ? 'الليفراج مجاني' : 'Livraison offerte incluse'}
            </p>
          </div>
          <div dir="ltr">
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '28px',
              fontWeight: 500, color: 'var(--ch-noir)',
            }}>
              3 500
            </span>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '13px',
              fontWeight: 300, color: 'var(--ch-gris-texte)', marginLeft: '4px',
            }}>
              DA
            </span>
          </div>
        </div>

        {/* Boutons */}
        <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* WhatsApp contact admin */}
          {numero_tel && (
            <a
              href={`https://wa.me/${numero_tel}?text=${messageClient}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                background: '#25D366', color: '#fff', textDecoration: 'none',
                padding: '18px 24px',
                fontFamily: fa,
                fontSize: estArabe ? '14px' : '11px',
                fontWeight: 500,
                letterSpacing: estArabe ? 0 : '0.12em',
                textTransform: estArabe ? 'none' : 'uppercase',
              }}
            >
              <IcoWhatsApp />
              {estArabe ? 'تواصلو معانا على WhatsApp' : 'Nous contacter sur WhatsApp'}
            </a>
          )}

          {/* Retour boutique */}
          <Link
            href="/"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid var(--ch-noir)',
              color: 'var(--ch-noir)', textDecoration: 'none',
              padding: '16px 24px',
              fontFamily: fa,
              fontSize: estArabe ? '13px' : '10px',
              fontWeight: 500,
              letterSpacing: estArabe ? 0 : '0.15em',
              textTransform: estArabe ? 'none' : 'uppercase',
            }}
          >
            {estArabe ? 'الرجوع للمتجر' : 'Retour à la boutique'}
          </Link>
        </div>

        {/* Liens légaux */}
        <div style={{ marginTop: '40px', display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { href: '/conditions-generales',         label: estArabe ? 'الشروط العامة' : 'CGV' },
            { href: '/politique-de-confidentialite', label: estArabe ? 'سياسة الخصوصية' : 'Confidentialité' },
          ].map((l) => (
            <a key={l.href} href={l.href} style={{
              fontFamily: fa, fontSize: estArabe ? '11px' : '9.5px',
              fontWeight: 400, letterSpacing: estArabe ? 0 : '0.1em',
              color: 'var(--ch-gris-clair)', textDecoration: 'none',
            }}>
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0A0A0A' }} />}>
      <ConfirmationContenu />
    </Suspense>
  )
}
