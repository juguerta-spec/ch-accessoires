'use client'

// ============================================================
// components/store/OrderForm.tsx — Formulaire COD
// Design sombre luxe — inputs underline or, CTA gold
// Corrections : prix dir="ltr", sélecteur coloris, polices ++
// ============================================================

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { WILAYAS } from '@/lib/wilayas'
import { trackInitiateCheckout, trackLead, genererEventId } from '@/lib/meta-pixel'
import type { Variante } from '@/lib/supabase'
import ColorSelector from '@/components/store/ColorSelector'

type Props = {
  variante: Variante
  variantes: Variante[]
  onVarianteChange: (v: Variante) => void
  prix: number
  abVariant?: 'A' | 'B'
}

const REGEX_TEL = /^(05|06|07)[0-9]{8}$/

type Champs = {
  nom_complet: string
  telephone: string
  wilaya: string
  type_livraison: 'domicile' | 'bureau'
  adresse: string
  message_cadeau: string
}
type Erreurs = Partial<Record<keyof Champs, string>>

export default function OrderForm({ variante, variantes, onVarianteChange, prix, abVariant = 'A' }: Props) {
  const { estArabe } = useLanguage()
  const router = useRouter()
  const fa = estArabe ? 'var(--font-arabic)' : 'var(--font-body)'
  const fd = estArabe ? 'var(--font-arabic)' : 'var(--font-display)'

  const [champs, setChamps] = useState<Champs>({
    nom_complet: '', telephone: '', wilaya: '',
    type_livraison: 'domicile', adresse: '', message_cadeau: '',
  })
  const [erreurs, setErreurs] = useState<Erreurs>({})
  const [envoi, setEnvoi] = useState(false)
  const [erreurGlobale, setErreurGlobale] = useState('')
  // Pack Duo : Noir + Burgundy à 6 000 DA (vs solo 3 500 DA)
  const [packDuo, setPackDuo] = useState(false)
  const PRIX_PACK = 6000
  const prixFinal = packDuo ? PRIX_PACK : prix

  const checkoutDeclenche = useRef(false)
  const eventIdCheckout = useRef(genererEventId())

  const onFocus = useCallback(() => {
    if (!checkoutDeclenche.current) {
      checkoutDeclenche.current = true
      trackInitiateCheckout({ eventId: eventIdCheckout.current, prix })
    }
  }, [prix])

  function maj(k: keyof Champs, v: string) {
    setChamps(p => ({ ...p, [k]: v }))
    if (erreurs[k]) setErreurs(p => ({ ...p, [k]: undefined }))
  }

  function valider(): boolean {
    const e: Erreurs = {}
    if (!champs.nom_complet.trim())
      e.nom_complet = estArabe ? 'الاسم الكامل مطلوب' : 'Nom obligatoire'
    if (!REGEX_TEL.test(champs.telephone))
      e.telephone = estArabe ? 'رقم التيليفون ماشي صحيح' : 'Format invalide (05/06/07XXXXXXXX)'
    if (!champs.wilaya)
      e.wilaya = estArabe ? 'الولاية مطلوبة' : 'Wilaya obligatoire'
    if (champs.type_livraison === 'domicile' && !champs.adresse.trim())
      e.adresse = estArabe ? 'المدينة مطلوبة' : 'Ville requise'
    setErreurs(e)
    return Object.keys(e).length === 0
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault()
    setErreurGlobale('')
    if (!valider()) return
    setEnvoi(true)

    const params = new URLSearchParams(window.location.search)
    const eventIdAchat = genererEventId()
    const parts = champs.nom_complet.trim().split(' ')
    const prenom = parts[0]
    const nom = parts.length > 1 ? parts.slice(1).join(' ') : '-'

    try {
      const res = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom, prenom, telephone: champs.telephone, wilaya: champs.wilaya,
          adresse: champs.type_livraison === 'domicile'
            ? champs.adresse.trim()
            : `Bureau de poste — ${champs.wilaya}`,
          variante_id: variante.id,
          quantite: packDuo ? 2 : 1,
          pack_duo: packDuo,
          message_cadeau: champs.message_cadeau.trim() || undefined,
          notes: packDuo
            ? `PACK DUO Noir+Burgundy — ${champs.type_livraison === 'bureau' ? 'Bureau' : 'Domicile'}`
            : (champs.type_livraison === 'bureau' ? 'Livraison: Bureau' : 'Livraison: Domicile'),
          fbclid: params.get('fbclid') || undefined,
          utm_source: params.get('utm_source') || undefined,
          utm_campaign: params.get('utm_campaign') || undefined,
          utm_content: params.get('utm_content') || undefined,
          event_id: eventIdAchat,
          ab_variant: abVariant,
        }),
      })
      const json = await res.json()
      if (!json.success) {
        setErreurGlobale(json.error || (estArabe ? 'وقع خطأ' : 'Une erreur est survenue.'))
        setEnvoi(false); return
      }
      // Lead Pixel : commande soumise (COD non confirmée)
      // Le même eventId est envoyé au CAPI server-side → déduplication Meta
      trackLead({ eventId: eventIdAchat, commandeNumero: json.data.numero, montant: prixFinal, quantite: packDuo ? 2 : 1, varianteId: variante.id })
      router.push(`/commande/confirmation?numero=${json.data.numero}&id=${json.data.id}&event_id=${eventIdAchat}`)
    } catch {
      setErreurGlobale(estArabe ? 'مشكل في الاتصال' : 'Erreur de connexion.')
      setEnvoi(false)
    }
  }

  const T = {
    titre:     estArabe ? 'كمل طلبك دروك' : 'Finaliser ma commande',
    sous:      estArabe ? 'دفع عند الاستلام' : 'Paiement à la livraison',
    nom:       estArabe ? 'الاسم الكامل' : 'Nom complet',
    tel:       estArabe ? 'رقم التيليفون' : 'Téléphone',
    wilaya:    estArabe ? 'الولاية' : 'Wilaya',
    livraison: estArabe ? 'طريقة التوصيل' : 'Mode de livraison',
    domicile:  estArabe ? 'لعند الدار' : 'À domicile',
    bureau:    estArabe ? 'مكتب البريد' : 'Bureau de poste',
    adresse:   estArabe ? 'المدينة / الحي' : 'Ville',
    phAdresse: estArabe ? 'مثال: باب الوادي، بئر مراد رايس...' : 'Ex : Kouba, Bab El Oued, Ben Aknoun...',
    coloris:   estArabe ? 'اختاري اللون' : 'Choisir le coloris',
    total:     estArabe ? 'المبلغ الكلي' : 'Total',
    loading:   estArabe ? 'راه يتبعث...' : 'Envoi...',
    secure:    estArabe ? 'ما كاين دفع مسبق · تدفع وقت الاستلام' : 'Aucun paiement maintenant · Vous payez à la réception',
  }

  /* ── Styles réutilisables ── */
  const labelSt: React.CSSProperties = {
    display: 'block',
    fontFamily: fa,
    fontSize: estArabe ? '17px' : '13px',
    fontWeight: 500,
    letterSpacing: estArabe ? 0 : '0.18em',
    textTransform: estArabe ? 'none' : 'uppercase',
    color: '#C9A84C',
    marginBottom: '10px',
  }

  const inputSt: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(201,168,76,0.35)',
    borderRadius: 0,
    padding: '12px 0',
    fontFamily: fa,
    fontSize: estArabe ? '18px' : '15px',
    fontWeight: 300,
    color: '#FAFAF7',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
  }

  return (
    <section id="order-form" style={{ background: '#0A0A0A', padding: '40px 0 48px' }}>

      {/* En-tête formulaire */}
      <div style={{ marginBottom: '36px', paddingBottom: '28px', borderBottom: '0.5px solid rgba(201,168,76,0.2)' }}>
        <p style={{
          fontFamily: fa, fontSize: estArabe ? '16px' : '13px', fontWeight: 500,
          letterSpacing: estArabe ? 0 : '0.22em', textTransform: estArabe ? 'none' : 'uppercase',
          color: '#C9A84C', marginBottom: '10px',
        }}>
          {estArabe ? 'طلب دروك' : 'Commander maintenant'}
        </p>
        <h3 style={{
          fontFamily: fd, fontSize: estArabe ? '28px' : '28px',
          fontWeight: estArabe ? 500 : 300, letterSpacing: estArabe ? 0 : '0.04em',
          color: '#FAFAF7', marginBottom: '8px', lineHeight: 1.2,
        }}>
          {T.titre}
        </h3>
        <p style={{
          fontFamily: fa, fontSize: estArabe ? '18px' : '15px',
          fontWeight: 300, color: 'rgba(201,168,76,0.7)',
          letterSpacing: estArabe ? 0 : '0.08em',
        }}>
          {T.sous}
        </p>
      </div>

      <style>{`
        .form-input:focus { border-bottom-color: #C9A84C !important; }
        .form-input::placeholder { color: rgba(250,250,247,0.2) !important; }
        .form-input option { background: #1a1a1a; color: #FAFAF7; }
      `}</style>

      <form onSubmit={soumettre} noValidate>

        {/* ── Choix de l'offre : Solo ou Pack Duo ── */}
        <div style={{ marginBottom: '32px', paddingBottom: '28px', borderBottom: '0.5px solid rgba(201,168,76,0.15)' }}>
          <label style={labelSt}>{estArabe ? 'اختار عرضك' : 'Votre offre'}</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>

            {/* Option Solo */}
            <button
              type="button"
              onClick={() => setPackDuo(false)}
              style={{
                border: !packDuo ? '1.5px solid #C9A84C' : '0.5px solid rgba(201,168,76,0.25)',
                background: !packDuo ? 'rgba(201,168,76,0.08)' : 'transparent',
                padding: '16px 10px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <p style={{ fontFamily: fa, fontSize: estArabe ? '15px' : '10px', fontWeight: 600, letterSpacing: estArabe ? 0 : '0.1em', textTransform: estArabe ? 'none' : 'uppercase', color: !packDuo ? '#C9A84C' : 'rgba(250,250,247,0.4)', marginBottom: '4px' }}>
                {estArabe ? 'سولو' : 'Solo'}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 300, color: 'rgba(250,250,247,0.35)', marginBottom: '6px', lineHeight: 1.4 }}>
                {estArabe ? 'لون واحد' : '1 sac · 1 coloris'}
              </p>
              <p dir="ltr" style={{ fontFamily: 'var(--font-body)', fontSize: '20px', fontWeight: 500, color: !packDuo ? '#C9A84C' : 'rgba(250,250,247,0.5)', lineHeight: 1 }}>
                {prix.toLocaleString('fr-DZ')} <span style={{ fontSize: '11px', fontWeight: 300 }}>DA</span>
              </p>
            </button>

            {/* Option Pack Duo */}
            <button
              type="button"
              onClick={() => setPackDuo(true)}
              style={{
                border: packDuo ? '1.5px solid #C9A84C' : '0.5px solid rgba(201,168,76,0.25)',
                background: packDuo ? 'rgba(201,168,76,0.08)' : 'transparent',
                padding: '16px 10px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
            >
              {/* Badge "Meilleure valeur" */}
              <span style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#C9A84C',
                color: '#0A0A0A',
                fontFamily: 'var(--font-body)',
                fontSize: '8px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '2px 8px',
                whiteSpace: 'nowrap',
              }}>
                {estArabe ? 'أحسن عرض' : 'Best value'}
              </span>
              <p style={{ fontFamily: fa, fontSize: estArabe ? '15px' : '10px', fontWeight: 600, letterSpacing: estArabe ? 0 : '0.1em', textTransform: estArabe ? 'none' : 'uppercase', color: packDuo ? '#C9A84C' : 'rgba(250,250,247,0.4)', marginBottom: '4px' }}>
                {estArabe ? 'باك دو' : 'Pack Duo'}
              </p>
              <p style={{ fontFamily: fa, fontSize: '13px', fontWeight: 300, color: 'rgba(250,250,247,0.35)', marginBottom: '6px', lineHeight: 1.4 }}>
                {estArabe ? 'كحل + برغاندي' : 'Noir + Burgundy'}
              </p>
              <p dir="ltr" style={{ fontFamily: 'var(--font-body)', fontSize: '20px', fontWeight: 500, color: packDuo ? '#C9A84C' : 'rgba(250,250,247,0.5)', lineHeight: 1 }}>
                {PRIX_PACK.toLocaleString('fr-DZ')} <span style={{ fontSize: '11px', fontWeight: 300 }}>DA</span>
              </p>
              <p dir="ltr" style={{ fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 300, color: 'rgba(201,168,76,0.5)', marginTop: '3px', letterSpacing: '0.04em' }}>
                {estArabe ? 'توفير 1 000 دج' : 'économie 1 000 DA'}
              </p>
            </button>
          </div>
        </div>

        {/* ── Sélecteur coloris (masqué si Pack Duo — les deux sont inclus) ── */}
        {!packDuo && (
        <div style={{ marginBottom: '32px', paddingBottom: '28px', borderBottom: '0.5px solid rgba(201,168,76,0.15)' }}>
          <label style={labelSt}>{T.coloris}</label>
          <div style={{ marginTop: '4px' }}>
            <ColorSelector
              variantes={variantes}
              varianteActive={variante}
              onChange={onVarianteChange}
              fondSombre
            />
          </div>
        </div>
        )}
        {packDuo && (
        <div style={{ marginBottom: '32px', paddingBottom: '28px', borderBottom: '0.5px solid rgba(201,168,76,0.15)' }}>
          <p style={labelSt}>{estArabe ? 'الألوان المشمولة' : 'Coloris inclus'}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#1a1a1a', border: '1.5px solid #C9A84C', display: 'inline-block' }} />
            <span style={{ fontFamily: fa, fontSize: estArabe ? '14px' : '11px', fontWeight: 300, color: 'rgba(250,250,247,0.5)' }}>{estArabe ? 'كحل' : 'Noir'}</span>
            <span style={{ marginLeft: 8, width: 20, height: 20, borderRadius: '50%', background: '#800020', border: '1.5px solid #C9A84C', display: 'inline-block' }} />
            <span style={{ fontFamily: fa, fontSize: estArabe ? '14px' : '11px', fontWeight: 300, color: 'rgba(250,250,247,0.5)' }}>{estArabe ? 'برغاندي' : 'Burgundy'}</span>
          </div>
        </div>
        )}

        {/* ── Nom complet ── */}
        <div style={{ marginBottom: '28px' }}>
          <label style={labelSt}>{T.nom}</label>
          <input
            type="text"
            className="form-input"
            value={champs.nom_complet}
            onChange={e => maj('nom_complet', e.target.value)}
            onFocus={onFocus}
            placeholder={estArabe ? 'مثال: سارة بن علي' : 'Ex : Sarah Benali'}
            autoComplete="name"
            style={inputSt}
          />
          {erreurs.nom_complet && <ErrMsg msg={erreurs.nom_complet} />}
        </div>

        {/* ── Téléphone ── */}
        <div style={{ marginBottom: '28px' }}>
          <label style={labelSt}>{T.tel}</label>
          <input
            type="tel"
            className="form-input"
            value={champs.telephone}
            onChange={e => maj('telephone', e.target.value)}
            placeholder="05XXXXXXXX"
            autoComplete="tel"
            inputMode="numeric"
            dir="ltr"
            style={{ ...inputSt, textAlign: 'left' }}
          />
          {erreurs.telephone && <ErrMsg msg={erreurs.telephone} />}
        </div>

        {/* ── Wilaya ── */}
        <div style={{ marginBottom: '28px' }}>
          <label style={labelSt}>{T.wilaya}</label>
          <select
            className="form-input"
            value={champs.wilaya}
            onChange={e => maj('wilaya', e.target.value)}
            style={{ ...inputSt, cursor: 'pointer' }}
          >
            <option value="">—</option>
            {WILAYAS.map(w => (
              <option key={w.code} value={w.nom_fr}>
                {estArabe ? `${w.nom_ar} — ${w.nom_fr}` : w.nom_fr}
              </option>
            ))}
          </select>
          {erreurs.wilaya && <ErrMsg msg={erreurs.wilaya} />}
        </div>

        {/* ── Mode de livraison ── */}
        <div style={{ marginBottom: '28px' }}>
          <label style={labelSt}>{T.livraison}</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
            {(['domicile', 'bureau'] as const).map(type => {
              const actif = champs.type_livraison === type
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => maj('type_livraison', type)}
                  style={{
                    padding: '16px 8px',
                    border: actif ? '1.5px solid #C9A84C' : '0.5px solid rgba(201,168,76,0.25)',
                    background: actif ? '#C9A84C' : 'transparent',
                    color: actif ? '#0A0A0A' : 'rgba(250,250,247,0.5)',
                    fontFamily: fa,
                    fontSize: estArabe ? '14px' : '11px',
                    fontWeight: 600,
                    letterSpacing: estArabe ? 0 : '0.08em',
                    textTransform: estArabe ? 'none' : 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                  }}
                >
                  {type === 'domicile' ? T.domicile : T.bureau}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Ville (si domicile) — lieu approximatif suffit ── */}
        {champs.type_livraison === 'domicile' && (
          <div style={{ marginBottom: '28px' }}>
            <label style={labelSt}>{T.adresse}</label>
            <input
              type="text"
              className="form-input"
              value={champs.adresse}
              onChange={e => maj('adresse', e.target.value)}
              placeholder={T.phAdresse}
              autoComplete="address-level2"
              style={inputSt}
            />
            {erreurs.adresse && <ErrMsg msg={erreurs.adresse} />}
          </div>
        )}

        {/* Message cadeau supprimé — réduit la friction et améliore le taux de conversion */}

        {/* ── Récap total — prix toujours LTR ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          padding: '20px 0',
          borderTop: '0.5px solid rgba(201,168,76,0.2)',
          borderBottom: '0.5px solid rgba(201,168,76,0.2)',
          marginBottom: '24px',
          flexDirection: estArabe ? 'row-reverse' : 'row',
        }}>
          <span style={{
            fontFamily: fa,
            fontSize: estArabe ? '16px' : '15px',
            fontWeight: 300,
            color: 'rgba(250,250,247,0.5)',
            letterSpacing: estArabe ? 0 : '0.1em',
            textTransform: estArabe ? 'none' : 'uppercase',
          }}>
            {T.total}
          </span>
          {/* dir="ltr" indispensable : empêche l'inversion "DA 500 2" en arabe */}
          <span dir="ltr" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '28px',
            fontWeight: 500,
            color: '#C9A84C',
            letterSpacing: '-0.01em',
            lineHeight: 1,
          }}>
            {prixFinal.toLocaleString('fr-DZ')} <span style={{ fontSize: '14px', fontWeight: 300, color: 'rgba(201,168,76,0.6)' }}>DA</span>
          </span>
        </div>

        {/* ── Erreur globale ── */}
        {erreurGlobale && (
          <div style={{
            background: 'rgba(139,50,50,0.2)',
            border: '0.5px solid rgba(139,50,50,0.5)',
            color: '#F5A0A0',
            fontFamily: fa,
            fontSize: estArabe ? '14px' : '13px',
            padding: '12px 16px',
            marginBottom: '16px',
            lineHeight: 1.6,
          }}>
            {erreurGlobale}
          </div>
        )}

        {/* ── CTA principal ── */}
        <button
          type="submit"
          disabled={envoi}
          style={{
            width: '100%',
            background: envoi ? 'rgba(201,168,76,0.6)' : '#C9A84C',
            color: '#0A0A0A',
            border: 'none',
            padding: '22px 32px',
            fontFamily: fa,
            fontSize: estArabe ? '17px' : '13px',
            fontWeight: 700,
            letterSpacing: estArabe ? 0 : '0.18em',
            textTransform: estArabe ? 'none' : 'uppercase',
            cursor: envoi ? 'default' : 'pointer',
            transition: 'background 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {envoi ? (
            <><span className="spinner" />{T.loading}</>
          ) : estArabe ? (
            /* dir="ltr" sur le prix pour éviter l'inversion "DA 500 2" en RTL */
            packDuo
              ? <>نبغي الباك — <span dir="ltr">{PRIX_PACK.toLocaleString('fr-DZ')} DA</span></>
              : <>نبغيها — <span dir="ltr">{prix.toLocaleString('fr-DZ')} DA</span></>
          ) : (
            packDuo
              ? `Commander le Pack Duo — ${PRIX_PACK.toLocaleString('fr-DZ')} DA`
              : `Je veux ce sac — ${prix.toLocaleString('fr-DZ')} DA`
          )}
        </button>

        {/* ── Badge sécurité ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '18px' }}>
          <svg width="12" height="14" viewBox="0 0 12 14" fill="none" style={{ flexShrink: 0 }}>
            <path d="M6 0L0 2.5v4C0 9.65 2.55 12.85 6 14c3.45-1.15 6-4.35 6-7.5v-4L6 0z" fill="rgba(201,168,76,0.5)" />
          </svg>
          <p style={{
            fontFamily: fa,
            fontSize: estArabe ? '13px' : '12px',
            fontWeight: 300,
            color: 'rgba(250,250,247,0.4)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}>
            {T.secure}
          </p>
        </div>

      </form>
    </section>
  )
}

function ErrMsg({ msg }: { msg: string }) {
  return (
    <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#F5A0A0', marginTop: '6px' }}>
      {msg}
    </p>
  )
}
