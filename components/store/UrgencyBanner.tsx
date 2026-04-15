'use client'

// ============================================================
// components/store/UrgencyBanner.tsx — Barre d'urgence sticky
// Fond noir, texte or, sticky top, z-index 50
// ============================================================

import { useLanguage } from '@/hooks/useLanguage'

export default function UrgencyBanner() {
  const { estArabe } = useLanguage()

  return (
    <div className="urgency-bar">
      {estArabe
        ? '🎁 التوصيل مجاني لقاع الجزائر\u00a0·\u00a0⚡ الكمية محدودة'
        : '🎁 Livraison offerte dans toute l\'Algérie\u00a0·\u00a0⚡ Stock limité'}
    </div>
  )
}
