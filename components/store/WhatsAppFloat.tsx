'use client'

// ============================================================
// components/store/WhatsAppFloat.tsx — Bouton WhatsApp flottant
// Affiché sur les pages storefront uniquement (masqué sur admin)
// Masqué sur mobile (lien WA disponible dans le header landing)
// Message pré-rempli selon la langue active
// ============================================================

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'

export default function WhatsAppFloat() {
  const { estArabe } = useLanguage()
  const [survole, setSurvole] = useState(false)
  const pathname = usePathname()

  const numero = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''

  // Ne pas afficher sur les pages admin ou si numéro absent
  if (!numero || pathname?.startsWith('/admin')) return null

  const message = encodeURIComponent(
    estArabe
      ? 'مرحباً، أريد الاستفسار عن منتجاتكم'
      : 'Bonjour, je souhaite me renseigner sur vos produits'
  )

  const label = estArabe ? 'تواصل معنا' : 'Nous contacter'

  return (
    <>
      {/* Masqué sur mobile — lien WA déjà présent dans le header et la confirmation */}
      <style>{`
        .wa-float { display: none; }
        @media(min-width: 768px){ .wa-float { display: flex; } }
      `}</style>
      <a
        className="wa-float"
        href={`https://wa.me/${numero}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        onMouseEnter={() => setSurvole(true)}
        onMouseLeave={() => setSurvole(false)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 90,
          alignItems: 'center',
          gap: '10px',
          background: '#25D366',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '50px',
          padding: survole ? '13px 20px 13px 16px' : '13px',
          transition: 'padding 0.25s ease',
          overflow: 'hidden',
          maxWidth: survole ? '240px' : '50px',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Icône WhatsApp SVG officielle */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="white"
          style={{ flexShrink: 0 }}
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>

        {/* Label — visible au survol */}
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: estArabe ? 0 : '0.06em',
            opacity: survole ? 1 : 0,
            transition: 'opacity 0.2s ease 0.05s',
            direction: estArabe ? 'rtl' : 'ltr',
          }}
        >
          {label}
        </span>
      </a>
    </>
  )
}
