'use client'

// ============================================================
// components/store/WhyChooseUs.tsx — 5 raisons de choisir CH Accessoires
// Fond --ch-beige, titre Cormorant, corps DM Sans 300
// ============================================================

import { useLanguage } from '@/hooks/useLanguage'

const POINTS_FR = [
  {
    icone: '✦',
    titre: 'Qualité premium',
    corps: 'Cuir synthétique haut de gamme, finitions soignées et doublure robuste pour durer dans le temps.',
  },
  {
    icone: '✦',
    titre: 'Prix accessible',
    corps: 'Le luxe à 3 500 DA. Qualité premium sans compromis sur votre budget.',
  },
  {
    icone: '✦',
    titre: 'Livraison rapide',
    corps: 'Livraison dans toute l\'Algérie sous 3 à 7 jours ouvrables. Suivi de votre commande par téléphone.',
  },
  {
    icone: '✦',
    titre: 'Vérifiez avant de payer',
    corps: 'Inspectez votre colis devant le livreur avant de régler. Aucun paiement si le produit ne vous convient pas.',
  },
  {
    icone: '✦',
    titre: 'Cadeau parfait',
    corps: 'Emballage soigné disponible sur demande. Offrez quelque chose qu\'elle n\'oubliera pas.',
  },
]

const POINTS_AR = [
  {
    icone: '✦',
    titre: 'جودة عالية',
    corps: 'جلد صناعي هاي-إند، تشطيبات أنيقة وبطانة متينة تبقى معاك مدة طويلة.',
  },
  {
    icone: '✦',
    titre: 'ثمن في المتناول',
    corps: 'الفاخر بـ 3500 دج. جودة عالية بلا ما تتجاوز الميزانية.',
  },
  {
    icone: '✦',
    titre: 'توصيل سريع',
    corps: 'التوصيل لقاع الجزائر في 3 إلى 7 أيام. متابعة هاتفية قبل التسليم.',
  },
  {
    icone: '✦',
    titre: 'افحصي قبل ما تدفعي',
    corps: 'افتحي الطلب قدام الموزع وافحصيه. إذا ما عجبكيش، ترديه وما تدفعيش ولا دينار.',
  },
  {
    icone: '✦',
    titre: 'هدية مثالية',
    corps: 'تغليف أنيق متوفر عند الطلب. عطيها حاجة ما تنساهاش.',
  },
]

export default function WhyChooseUs() {
  const { estArabe } = useLanguage()
  const points = estArabe ? POINTS_AR : POINTS_FR

  return (
    <section
      style={{
        background: 'var(--ch-beige)',
        padding: '48px 16px',
      }}
    >
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        {/* Titre H2 */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 400,
            letterSpacing: '0.03em',
            color: 'var(--ch-noir)',
            marginBottom: '32px',
            textAlign: 'center',
          }}
        >
          {estArabe ? 'علاش تختاري CH Accessoires؟' : 'Pourquoi choisir CH Accessoires ?'}
        </h2>

        {/* Liste des 5 points */}
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {points.map((point, idx) => (
            <li
              key={idx}
              style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
              }}
            >
              {/* Icône or */}
              <span
                style={{
                  color: 'var(--ch-or)',
                  fontSize: '12px',
                  marginTop: '3px',
                  flexShrink: 0,
                }}
              >
                {point.icone}
              </span>

              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--ch-noir)',
                    marginBottom: '4px',
                  }}
                >
                  {point.titre}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '16px',
                    fontWeight: 300,
                    color: 'var(--ch-gris-texte)',
                    lineHeight: '1.65',
                  }}
                >
                  {point.corps}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
