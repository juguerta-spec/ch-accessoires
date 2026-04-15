'use client'

// ============================================================
// components/store/ExitIntentPopup.tsx
// Popup d'intention de sortie — uniquement sur les pages produit
//
// Desktop : détecte quand la souris quitte la fenêtre par le haut
// Mobile  : détecte un scroll rapide vers le haut (comportement "retour")
// Règles  :
//   - Affiché une seule fois par session (sessionStorage)
//   - Non affiché si le formulaire est déjà visible
//   - Délai minimum 5s après chargement (évite l'agressivité)
//   - CTA scroll vers #order-form
// ============================================================

import { useEffect, useState, useRef } from 'react'
import { useLanguage } from '@/hooks/useLanguage'

const CLE_SESSION = 'ch_exit_shown'

type Props = {
  prix: number
  formVisible: boolean  // true si le formulaire est déjà visible à l'écran
}

export default function ExitIntentPopup({ prix, formVisible }: Props) {
  const { estArabe } = useLanguage()
  const [visible, setVisible] = useState(false)
  const [anime, setAnime]     = useState(false)
  const delaiPret             = useRef(false)
  const dernierScrollY        = useRef(0)
  const fa = estArabe ? 'var(--font-arabic)' : 'var(--font-body)'
  const fd = estArabe ? 'var(--font-arabic)' : 'var(--font-display)'

  useEffect(() => {
    // Ne pas afficher si déjà montré cette session
    if (sessionStorage.getItem(CLE_SESSION)) return

    // Délai de 5s avant activation (évite d'agresser un visiteur qui vient d'arriver)
    const t = setTimeout(() => { delaiPret.current = true }, 5000)

    // ── Desktop : exit-intent sur mouseleave vers le haut ──
    function onMouseLeave(e: MouseEvent) {
      if (!delaiPret.current) return
      if (formVisible) return
      if (e.clientY > 20) return  // seulement si la souris sort par le haut
      afficher()
    }

    // ── Mobile : scroll rapide vers le haut = intention de quitter ──
    function onScroll() {
      if (!delaiPret.current) return
      if (formVisible) return
      const currentY = window.scrollY
      const delta = dernierScrollY.current - currentY
      // Scroll vers le haut de plus de 80px rapide = signal de départ
      if (delta > 80 && currentY < 300) afficher()
      dernierScrollY.current = currentY
    }

    document.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      clearTimeout(t)
      document.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('scroll', onScroll)
    }
  }, [formVisible])

  function afficher() {
    if (sessionStorage.getItem(CLE_SESSION)) return
    sessionStorage.setItem(CLE_SESSION, '1')
    setVisible(true)
    // Petite animation d'entrée
    requestAnimationFrame(() => requestAnimationFrame(() => setAnime(true)))
  }

  function fermer() {
    setAnime(false)
    setTimeout(() => setVisible(false), 300)
  }

  function allerAuFormulaire() {
    fermer()
    setTimeout(() => {
      const el = document.getElementById('order-form')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 350)
  }

  if (!visible) return null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={fermer}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(10,10,10,0.7)',
          zIndex: 200,
          opacity: anime ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
        aria-hidden="true"
      />

      {/* Popup */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={estArabe ? 'عرض خاص' : 'Offre spéciale'}
        style={{
          position: 'fixed',
          bottom: anime ? '0' : '-100%',
          left: 0, right: 0,
          zIndex: 201,
          background: '#0A0A0A',
          borderTop: '1.5px solid #C9A84C',
          padding: '36px 24px 40px',
          transition: 'bottom 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          direction: estArabe ? 'rtl' : 'ltr',
          maxWidth: '520px',
          margin: '0 auto',
        }}
      >
        {/* Bouton fermer */}
        <button
          onClick={fermer}
          aria-label={estArabe ? 'إغلاق' : 'Fermer'}
          style={{
            position: 'absolute',
            top: '16px',
            [estArabe ? 'left' : 'right']: '16px',
            background: 'none', border: 'none',
            color: 'rgba(201,168,76,0.5)',
            fontSize: '22px', cursor: 'pointer', lineHeight: 1,
            fontWeight: 200,
          }}
        >
          ×
        </button>

        {/* Badge livraison offerte */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(201,168,76,0.1)',
          border: '0.5px solid rgba(201,168,76,0.35)',
          padding: '4px 12px',
          marginBottom: '16px',
        }}>
          <span style={{
            fontFamily: fa,
            fontSize: estArabe ? '12px' : '10px',
            fontWeight: 500,
            letterSpacing: estArabe ? 0 : '0.12em',
            textTransform: estArabe ? 'none' : 'uppercase',
            color: '#C9A84C',
          }}>
            {estArabe ? '🎁 الليفراج مجاني' : '🎁 Livraison offerte'}
          </span>
        </div>

        {/* Titre */}
        <p style={{
          fontFamily: fd,
          fontSize: estArabe ? '26px' : '26px',
          fontWeight: estArabe ? 500 : 300,
          letterSpacing: estArabe ? 0 : '0.03em',
          color: '#FAFAF7',
          lineHeight: 1.2,
          marginBottom: '8px',
        }}>
          {estArabe ? 'تتركيها؟ 😮' : 'Vous partez déjà ?'}
        </p>

        {/* Sous-titre */}
        <p style={{
          fontFamily: fa,
          fontSize: estArabe ? '15px' : '13px',
          fontWeight: 300,
          color: 'rgba(250,250,247,0.55)',
          lineHeight: 1.65,
          marginBottom: '28px',
        }}>
          {estArabe
            ? 'الشنطة ديالك في الانتظار — ليفراج مجاني ودفع عند الاستلام'
            : 'Votre sac vous attend — livraison gratuite · paiement à la réception'}
        </p>

        {/* Prix */}
        <div dir="ltr" style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '28px' }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 300,
            color: 'rgba(201,168,76,0.35)',
            textDecoration: 'line-through',
          }}>
            4 990 DA
          </span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '32px',
            fontWeight: 500,
            color: '#C9A84C',
            lineHeight: 1,
          }}>
            {prix.toLocaleString('fr-DZ')}
          </span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 300,
            color: 'rgba(201,168,76,0.5)',
          }}>
            DA
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={allerAuFormulaire}
          style={{
            width: '100%',
            background: '#C9A84C',
            color: '#0A0A0A',
            border: 'none',
            padding: '20px 32px',
            fontFamily: fa,
            fontSize: estArabe ? '16px' : '12px',
            fontWeight: 700,
            letterSpacing: estArabe ? 0 : '0.18em',
            textTransform: estArabe ? 'none' : 'uppercase',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#E8D49A')}
          onMouseLeave={e => (e.currentTarget.style.background = '#C9A84C')}
        >
          {estArabe ? 'نبغيها — اطلب دروك' : 'Commander maintenant'}
        </button>

        {/* Garantie */}
        <p style={{
          fontFamily: fa,
          fontSize: estArabe ? '12px' : '11px',
          fontWeight: 300,
          color: 'rgba(250,250,247,0.3)',
          textAlign: 'center',
          marginTop: '14px',
          lineHeight: 1.5,
        }}>
          {estArabe
            ? 'ما كاين دفع مسبق · تدفع وقت ما تستلم'
            : 'Aucun paiement maintenant · Vous payez à la réception'}
        </p>
      </div>
    </>
  )
}
