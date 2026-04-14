'use client'

// ============================================================
// app/commande/confirmation/page.tsx — Page de confirmation post-commande
// Déclenche trackPurchase + CTA WhatsApp prominent + infos livraison
// ============================================================

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/hooks/useLanguage'
import { trackLead } from '@/lib/meta-pixel'

// ── Icône check ───────────────────────────────────────────────
function IcoCheck() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M6 14l6 6 10-12" stroke="var(--ch-or)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Icône WhatsApp ────────────────────────────────────────────
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

  // Lead Pixel : même eventId que celui envoyé depuis OrderForm et le CAPI
  // Meta déduplique → 1 seul Lead comptabilisé pour cette commande
  // Le vrai Purchase Meta sera déclenché côté CAPI quand l'admin confirme la commande
  useEffect(() => {
    if (numero && eventId) {
      trackLead({
        eventId,
        commandeNumero: numero,
        montant: 2500,
        quantite: 1,
        varianteId: commandeId,
      })
    }
  }, [numero, eventId, commandeId])

  // Message WhatsApp client pré-rempli
  const messageClient = encodeURIComponent(
    estArabe
      ? `السلام، كملت طلبي برقم ${numero}. واش تقدرو تأكدوا لي وقت الليفراج؟`
      : `Bonjour, j'ai passé la commande n°${numero}. Pouvez-vous confirmer le délai de livraison ?`
  )

  const T = {
    titre:      estArabe ? 'تأكد طلبك!' : 'Commande confirmée !',
    sousTitre:  estArabe
      ? 'شكراً على ثقتك في CH Accessoires'
      : 'Merci pour votre confiance',
    numeroLabel: estArabe ? 'رقم الطلبية ديالك' : 'Votre numéro de commande',
    etape1titre: estArabe ? 'غادي نتصلو بيك للتأكيد' : 'On vous appelle pour confirmer',
    etape1sous:  estArabe ? 'الفريق ديالنا غادي يتصل بك في 24 ساعة' : 'Notre équipe vous contacte sous 24h',
    etape2titre: estArabe ? 'الليفراج لبابك' : 'Livraison à votre porte',
    etape2sous:  estArabe
      ? 'الليفراج في 58 ولاية · 1 إلى 5 أيام'
      : 'Livraison dans les 58 wilayas · 1 à 5 jours',
    etape3titre: estArabe ? 'الدفع عند الاستلام' : 'Vous payez à la livraison',
    etape3sous:  estArabe
      ? 'افحص طلبك قدام الموزع قبل ما تدفع'
      : 'Vérifiez votre colis devant le livreur avant de payer',
    whatsappBtn: estArabe ? 'تواصلو معانا على WhatsApp' : 'Nous contacter sur WhatsApp',
    retour:      estArabe ? 'الرجوع للمتجر' : 'Retour à la boutique',
  }

  const font = estArabe ? 'var(--font-arabic)' : undefined

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--ch-blanc)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '48px 16px 64px',
        direction: estArabe ? 'rtl' : 'ltr',
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 300, color: 'var(--ch-noir)', letterSpacing: '0.08em' }}>
          CH
        </div>
        <div style={{ fontFamily: font || 'var(--font-body)', fontSize: '8px', fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ch-gris-texte)', marginTop: '2px' }}>
          {estArabe ? 'أكسسوارات' : 'ACCESSOIRES'}
        </div>
      </div>

      {/* Icône succès */}
      <div
        style={{
          width: '72px',
          height: '72px',
          border: '1.5px solid var(--ch-or)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          background: 'rgba(201,168,76,0.06)',
        }}
      >
        <IcoCheck />
      </div>

      {/* Titre */}
      <h1
        style={{
          fontFamily: estArabe ? 'var(--font-arabic)' : 'var(--font-display)',
          fontSize: estArabe ? '28px' : '32px',
          fontWeight: 300,
          color: 'var(--ch-noir)',
          letterSpacing: estArabe ? '0.01em' : '0.04em',
          textAlign: 'center',
          marginBottom: '8px',
        }}
      >
        {T.titre}
      </h1>
      <p style={{ fontFamily: font || 'var(--font-body)', fontSize: '13px', fontWeight: 300, color: 'var(--ch-gris-texte)', marginBottom: '36px', textAlign: 'center' }}>
        {T.sousTitre}
      </p>

      {/* Numéro de commande */}
      {numero && (
        <div
          style={{
            background: 'var(--ch-noir)',
            padding: '16px 40px',
            marginBottom: '40px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontFamily: font || 'var(--font-body)', fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(201,168,76,0.6)', marginBottom: '6px' }}>
            {T.numeroLabel}
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400, color: 'var(--ch-or)', letterSpacing: '0.06em', lineHeight: 1 }}>
            {numero}
          </p>
        </div>
      )}

      {/* Étapes de livraison */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          marginBottom: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
        }}
      >
        {[
          { titre: T.etape1titre, sous: T.etape1sous,  num: '1' },
          { titre: T.etape2titre, sous: T.etape2sous,  num: '2' },
          { titre: T.etape3titre, sous: T.etape3sous,  num: '3' },
        ].map((etape, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              padding: '16px 0',
              borderBottom: i < 2 ? 'var(--ch-border)' : 'none',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                border: '1px solid var(--ch-or)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--ch-or)',
              }}
            >
              {etape.num}
            </div>
            <div>
              <p style={{ fontFamily: font || 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--ch-noir)', marginBottom: '3px' }}>
                {etape.titre}
              </p>
              <p style={{ fontFamily: font || 'var(--font-body)', fontSize: '12px', fontWeight: 300, color: 'var(--ch-gris-texte)', lineHeight: 1.6 }}>
                {etape.sous}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Boutons */}
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* WhatsApp — principal */}
        {numero_tel && (
          <a
            href={`https://wa.me/${numero_tel}?text=${messageClient}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: '#25D366',
              color: '#fff',
              textDecoration: 'none',
              padding: '16px 24px',
              fontFamily: font || 'var(--font-body)',
              fontSize: estArabe ? '14px' : '11px',
              fontWeight: 500,
              letterSpacing: estArabe ? 0 : '0.12em',
              textTransform: estArabe ? 'none' : 'uppercase',
            }}
          >
            <IcoWhatsApp />
            {T.whatsappBtn}
          </a>
        )}

        {/* Retour boutique */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'var(--ch-border-noir)',
            color: 'var(--ch-noir)',
            textDecoration: 'none',
            padding: '14px 24px',
            fontFamily: font || 'var(--font-body)',
            fontSize: estArabe ? '13px' : '10px',
            fontWeight: 500,
            letterSpacing: estArabe ? 0 : '0.15em',
            textTransform: estArabe ? 'none' : 'uppercase',
          }}
        >
          {T.retour}
        </Link>
      </div>

      {/* Liens légaux */}
      <div style={{ marginTop: '48px', display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { href: '/conditions-generales',         label: estArabe ? 'الشروط العامة' : 'CGV' },
          { href: '/politique-de-confidentialite', label: estArabe ? 'سياسة الخصوصية' : 'Confidentialité' },
        ].map((l) => (
          <a
            key={l.href}
            href={l.href}
            style={{
              fontFamily: font || 'var(--font-body)',
              fontSize: estArabe ? '12px' : '9.5px',
              fontWeight: 400,
              letterSpacing: estArabe ? 0 : '0.1em',
              textTransform: estArabe ? 'none' : 'uppercase',
              color: 'var(--ch-gris-clair)',
              textDecoration: 'none',
            }}
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--ch-blanc)' }} />}>
      <ConfirmationContenu />
    </Suspense>
  )
}
