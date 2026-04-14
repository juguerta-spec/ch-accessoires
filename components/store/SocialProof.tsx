'use client'

// ============================================================
// components/store/SocialProof.tsx — Avis clients
// Design dark luxe — fond noir, Cormorant italic, accents or
// ============================================================

import { useLanguage } from '@/hooks/useLanguage'

const AVIS = [
  { prenom: 'Samira B.', wilaya: 'Alger', note: 5, fr: 'Qualité exceptionnelle, exactement comme sur les photos. Je suis ravie de mon achat.', ar: 'جودة عالية بزاف، بالضبط كيما في الصور. عجبتني بزاف!' },
  { prenom: 'Karim M.', wilaya: 'Oran', note: 5, fr: "Cadeau parfait pour ma femme. Elle a adoré, livraison rapide et soignée.", ar: 'هدية زوينة لمراتي. عجبتها بزاف، الليفراج كان سريع ومرتب.' },
  { prenom: 'Fatima Z.', wilaya: 'Constantine', note: 5, fr: "Je l'utilise tous les jours depuis un mois, très solide et élégant.", ar: 'نستعملها كل يوم من شهر، متينة بزاف وأنيقة.' },
  { prenom: 'Amira K.', wilaya: 'Annaba', note: 4, fr: 'Très beau sac, finitions soignées. Je le recommande vivement à toutes.', ar: 'شنطة زوينة بزاف، تشطيبات أنيقة. نوصي بيها لكل واحدة.' },
  { prenom: 'Yacine D.', wilaya: 'Blida', note: 5, fr: "Commandé pour offrir, elle était ravie. Le sac est vraiment beau en vrai.", ar: 'طلبتها هدية، كانت فرحانة بزاف. الشنطة زوينة حقيقي.' },
  { prenom: 'Nadia H.', wilaya: 'Sétif', note: 5, fr: 'Le coloris Burgundy est magnifique en vrai, encore plus beau que sur les photos !', ar: 'لون البورغاندي رائع في الواقع، أحلى مما توقعت. جودة عالية.' },
]

function Etoiles({ note }: { note: number }) {
  return (
    <div style={{ display: 'flex', gap: '3px', marginBottom: '18px' }}>
      {Array.from({ length: 5 }, (_, j) => (
        <span key={j} style={{ color: j < note ? '#C9A84C' : 'rgba(201,168,76,0.25)', fontSize: '12px' }}>★</span>
      ))}
    </div>
  )
}

export default function SocialProof() {
  const { estArabe } = useLanguage()
  const fa = estArabe ? 'var(--font-arabic)' : 'var(--font-body)'
  const fd = estArabe ? 'var(--font-arabic)' : 'var(--font-display)'

  /* Avis hero — le premier (grand format) */
  const hero = AVIS[0]
  /* 3 autres en grille propre — 1 rangée complète */
  const reste = AVIS.slice(1, 4)

  return (
    <section style={{ background: '#0A0A0A', padding: '100px 24px', borderTop: '0.5px solid rgba(201,168,76,0.15)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* En-tête section */}
        <div style={{ textAlign: 'center', marginBottom: '72px' }}>
          <p style={{ fontFamily: fa, fontSize: estArabe ? '13px' : '9px', fontWeight: 500, letterSpacing: estArabe ? 0 : '0.24em', textTransform: estArabe ? 'none' : 'uppercase', color: '#C9A84C', marginBottom: '14px' }}>
            {estArabe ? 'آراء عملاؤنا' : 'Témoignages'}
          </p>
          <h2 style={{ fontFamily: fd, fontSize: estArabe ? '34px' : '40px', fontWeight: estArabe ? 400 : 300, letterSpacing: estArabe ? 0 : '0.03em', color: '#FAFAF7', lineHeight: 1.2 }}>
            {estArabe ? 'واش يقولو عملاؤنا' : 'Ce que disent nos clientes'}
          </h2>
          {/* Étoiles globales */}
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '20px' }}>
            {Array.from({ length: 5 }, (_, j) => (
              <span key={j} style={{ color: '#C9A84C', fontSize: '16px' }}>★</span>
            ))}
          </div>
          <p style={{ fontFamily: fa, fontSize: estArabe ? '14px' : '11px', fontWeight: 300, color: 'rgba(250,250,247,0.4)', marginTop: '8px', letterSpacing: estArabe ? 0 : '0.08em' }}>
            {estArabe ? '4.9/5 — +200 عميلة راضية' : '4.9/5 · Plus de 200 clientes satisfaites'}
          </p>
        </div>

        {/* Avis hero — citation large */}
        <div style={{
          maxWidth: '720px',
          margin: '0 auto 80px',
          textAlign: 'center',
          padding: '0 24px',
        }}>
          <Etoiles note={hero.note} />
          <p style={{
            fontFamily: fd,
            fontSize: estArabe ? '24px' : '24px',
            fontStyle: estArabe ? 'normal' : 'italic',
            fontWeight: estArabe ? 400 : 300,
            color: '#FAFAF7',
            lineHeight: 1.7,
            marginBottom: '28px',
            letterSpacing: estArabe ? 0 : '0.01em',
          }}>
            &ldquo;{estArabe ? hero.ar : hero.fr}&rdquo;
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '0.5px', background: '#C9A84C', opacity: 0.6 }} />
            <div>
              <p style={{ fontFamily: fa, fontSize: estArabe ? '14px' : '11px', fontWeight: 500, letterSpacing: estArabe ? 0 : '0.12em', textTransform: estArabe ? 'none' : 'uppercase', color: 'rgba(250,250,247,0.8)' }}>{hero.prenom}</p>
              <p style={{ fontFamily: fa, fontSize: estArabe ? '13px' : '10px', fontWeight: 300, color: 'rgba(250,250,247,0.35)', marginTop: '3px' }}>{hero.wilaya}</p>
            </div>
            <div style={{ width: '32px', height: '0.5px', background: '#C9A84C', opacity: 0.6 }} />
          </div>
        </div>

        {/* Séparateur */}
        <div style={{ borderTop: '0.5px solid rgba(201,168,76,0.12)', marginBottom: '60px' }} />

        {/* Grille 5 autres avis */}
        <style>{`
          .avis-grid-dark { display: grid; grid-template-columns: 1fr; gap: 1px; background: rgba(201,168,76,0.1); }
          @media(min-width: 640px){ .avis-grid-dark { grid-template-columns: repeat(2,1fr); } }
          @media(min-width: 1024px){ .avis-grid-dark { grid-template-columns: repeat(3,1fr); } }
        `}</style>
        <div className="avis-grid-dark">
          {reste.map((a, i) => (
            <div key={i} style={{ background: '#0A0A0A', padding: '32px 28px' }}>
              <Etoiles note={a.note} />
              <p style={{
                fontFamily: fd,
                fontSize: estArabe ? '17px' : '15px',
                fontStyle: estArabe ? 'normal' : 'italic',
                fontWeight: estArabe ? 400 : 300,
                color: 'rgba(250,250,247,0.75)',
                lineHeight: 1.65,
                marginBottom: '20px',
              }}>
                &ldquo;{estArabe ? a.ar : a.fr}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: estArabe ? 'row-reverse' : 'row' }}>
                <div style={{ width: '20px', height: '0.5px', background: '#C9A84C', opacity: 0.6 }} />
                <div style={{ textAlign: estArabe ? 'right' : 'left' }}>
                  <p style={{ fontFamily: fa, fontSize: estArabe ? '13px' : '10px', fontWeight: 500, letterSpacing: estArabe ? 0 : '0.1em', textTransform: estArabe ? 'none' : 'uppercase', color: 'rgba(250,250,247,0.6)' }}>{a.prenom}</p>
                  <p style={{ fontFamily: fa, fontSize: estArabe ? '12px' : '9px', fontWeight: 300, color: 'rgba(250,250,247,0.3)', marginTop: '2px' }}>{a.wilaya}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
