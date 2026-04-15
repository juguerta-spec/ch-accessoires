'use client'

// ============================================================
// components/store/GiftSection.tsx — Section cadeau (ciblage hommes)
// Fond --ch-blanc, CTA outline noir vers #order-form
// ============================================================

import { useLanguage } from '@/hooks/useLanguage'

export default function GiftSection() {
  const { estArabe } = useLanguage()

  return (
    <section
      style={{
        background: 'var(--ch-blanc)',
        padding: '48px 16px',
        borderTop: 'var(--ch-border)',
        borderBottom: 'var(--ch-border)',
      }}
    >
      <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
        {/* Label supérieur */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ch-or)',
            marginBottom: '16px',
          }}
        >
          {estArabe ? 'للراجل اللي يبغي يهدي' : 'Pour ceux qui veulent offrir'}
        </p>

        {/* Titre H2 */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '26px',
            fontWeight: 300,
            letterSpacing: '0.03em',
            color: 'var(--ch-noir)',
            lineHeight: '1.3',
            marginBottom: '20px',
          }}
        >
          {estArabe
            ? 'عطيها حاجة ما تنساهاش'
            : 'Offrez-lui quelque chose qu\'elle n\'oubliera pas'}
        </h2>

        {/* Corps */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 300,
            color: 'var(--ch-gris-texte)',
            lineHeight: '1.7',
            marginBottom: '32px',
            maxWidth: '360px',
            margin: '0 auto 32px',
          }}
        >
          {estArabe
            ? 'شنطة CH Signature هي الهدية المثالية لعيد الميلاد، الذكرى السنوية أو أي مناسبة خاصة. زيد رسالة شخصية مع طلبك.'
            : 'Le Sac Premium CH Accessoires est le cadeau idéal pour un anniversaire, une fête ou toute occasion spéciale. Ajoutez un message personnel à votre commande.'}
        </p>

        {/* CTA outline */}
        <a
          href="#order-form"
          className="btn-outline"
          style={{ display: 'inline-block', width: 'auto', padding: '16px 40px' }}
        >
          {estArabe ? 'طلب دروك' : 'Commander maintenant'}
        </a>
      </div>
    </section>
  )
}
