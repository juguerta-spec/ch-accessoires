'use client'

// ============================================================
// components/store/ColorSelector.tsx — Sélecteur coloris
// Supporte fond clair et fond sombre (prop fondSombre)
// ============================================================

import { useLanguage } from '@/hooks/useLanguage'
import type { Variante } from '@/lib/supabase'

type Props = {
  variantes: Variante[]
  varianteActive: Variante
  onChange: (variante: Variante) => void
  fondSombre?: boolean
}

export default function ColorSelector({ variantes, varianteActive, onChange, fondSombre = false }: Props) {
  const { estArabe } = useLanguage()
  const fa = estArabe ? 'var(--font-arabic)' : 'var(--font-body)'

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
      {variantes.map((v) => {
        const actif = v.id === varianteActive.id
        const nom = estArabe ? v.couleur_ar : v.couleur_fr
        return (
          <button
            key={v.id}
            onClick={() => onChange(v)}
            aria-label={nom}
            aria-pressed={actif}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            {/* Dot coloris */}
            <span style={{
              width: '22px', height: '22px',
              borderRadius: '50%',
              background: v.couleur_hex || '#000',
              border: actif
                ? `2px solid ${fondSombre ? '#C9A84C' : '#0A0A0A'}`
                : `2px solid ${fondSombre ? 'rgba(201,168,76,0.3)' : 'transparent'}`,
              outline: actif ? `2px solid ${v.couleur_hex || '#000'}` : 'none',
              outlineOffset: '2px',
              transition: 'border-color 0.15s',
              display: 'inline-block',
              flexShrink: 0,
            }} />
            {/* Nom couleur */}
            <span style={{
              fontFamily: fa,
              fontSize: estArabe ? '13px' : '11px',
              fontWeight: actif ? 500 : 300,
              letterSpacing: estArabe ? 0 : '0.1em',
              textTransform: estArabe ? 'none' : 'uppercase',
              color: actif
                ? (fondSombre ? '#C9A84C' : '#0A0A0A')
                : (fondSombre ? 'rgba(250,250,247,0.5)' : '#6B6660'),
              transition: 'color 0.15s',
            }}>
              {nom}
            </span>
          </button>
        )
      })}
    </div>
  )
}
