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

export default function OrderForm({ variante, variantes, onVarianteChange, prix }: Props) {
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
  // Toggle message cadeau : masqué par défaut pour alléger le formulaire
  const [afficherMessage, setAfficherMessage] = useState(false)

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
      e.telephone = estArabe ? 'رقم الهاتف غير صحيح' : 'Format invalide (05/06/07XXXXXXXX)'
    if (!champs.wilaya)
      e.wilaya = estArabe ? 'الولاية مطلوبة' : 'Wilaya obligatoire'
    if (champs.type_livraison === 'domicile' && !champs.adresse.trim())
      e.adresse = estArabe ? 'العنوان مطلوب' : 'Adresse requise'
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
          variante_id: variante.id, quantite: 1,
          message_cadeau: champs.message_cadeau.trim() || undefined,
          notes: champs.type_livraison === 'bureau' ? 'Livraison: Bureau de poste' : 'Livraison: A domicile',
          fbclid: params.get('fbclid') || undefined,
          utm_source: params.get('utm_source') || undefined,
          utm_campaign: params.get('utm_campaign') || undefined,
          utm_content: params.get('utm_content') || undefined,
          event_id: eventIdAchat,
        }),
      })
      const json = await res.json()
      if (!json.success) {
        setErreurGlobale(json.error || (estArabe ? 'حدث خطأ' : 'Une erreur est survenue.'))
        setEnvoi(false); return
      }
      // Lead Pixel : commande soumise (COD non confirmée)
      // Le même eventId est envoyé au CAPI server-side → déduplication Meta
      trackLead({ eventId: eventIdAchat, commandeNumero: json.data.numero, montant: prix, quantite: 1, varianteId: variante.id })
      router.push(`/commande/confirmation?numero=${json.data.numero}&id=${json.data.id}&event_id=${eventIdAchat}`)
    } catch {
      setErreurGlobale(estArabe ? 'خطأ في الاتصال' : 'Erreur de connexion.')
      setEnvoi(false)
    }
  }

  const T = {
    titre:     estArabe ? 'أكمل طلبك الآن' : 'Finaliser ma commande',
    sous:      estArabe ? 'دفع عند الاستلام — بدون بطاقة' : 'Paiement à la livraison — sans carte',
    nom:       estArabe ? 'الاسم الكامل' : 'Nom complet',
    tel:       estArabe ? 'رقم الهاتف' : 'Téléphone',
    wilaya:    estArabe ? 'الولاية' : 'Wilaya',
    livraison: estArabe ? 'طريقة التوصيل' : 'Mode de livraison',
    domicile:  estArabe ? 'إلى المنزل' : 'À domicile',
    bureau:    estArabe ? 'مكتب البريد' : 'Bureau de poste',
    adresse:   estArabe ? 'العنوان' : 'Adresse',
    phAdresse: estArabe ? 'حي، بناية، رقم...' : 'Cité, bâtiment, appartement...',
    message:   estArabe ? 'رسالة هدية (اختياري)' : 'Message cadeau (optionnel)',
    phMsg:     estArabe ? 'رسالتك هنا...' : 'Votre message ici...',
    coloris:   estArabe ? 'اختار اللون' : 'Choisir le coloris',
    total:     estArabe ? 'المبلغ الإجمالي' : 'Total',
    loading:   estArabe ? 'جاري الإرسال...' : 'Envoi...',
    secure:    estArabe ? 'لا دفع مسبق · تدفع عند استلامك' : 'Aucun paiement maintenant · Vous payez à la réception',
  }

  /* ── Styles réutilisables ── */
  const labelSt: React.CSSProperties = {
    display: 'block',
    fontFamily: fa,
    fontSize: estArabe ? '16px' : '11px',
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
          fontFamily: fa, fontSize: estArabe ? '15px' : '11px', fontWeight: 500,
          letterSpacing: estArabe ? 0 : '0.22em', textTransform: estArabe ? 'none' : 'uppercase',
          color: '#C9A84C', marginBottom: '10px',
        }}>
          {estArabe ? 'اطلب الآن' : 'Commander maintenant'}
        </p>
        <h3 style={{
          fontFamily: fd, fontSize: estArabe ? '28px' : '28px',
          fontWeight: estArabe ? 500 : 300, letterSpacing: estArabe ? 0 : '0.04em',
          color: '#FAFAF7', marginBottom: '8px', lineHeight: 1.2,
        }}>
          {T.titre}
        </h3>
        <p style={{
          fontFamily: fa, fontSize: estArabe ? '17px' : '12px',
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

        {/* ── Sélecteur coloris ── */}
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

        {/* ── Adresse (si domicile) ── */}
        {champs.type_livraison === 'domicile' && (
          <div style={{ marginBottom: '28px' }}>
            <label style={labelSt}>{T.adresse}</label>
            <textarea
              className="form-input"
              value={champs.adresse}
              onChange={e => maj('adresse', e.target.value)}
              placeholder={T.phAdresse}
              rows={2}
              style={{ ...inputSt, resize: 'none' }}
            />
            {erreurs.adresse && <ErrMsg msg={erreurs.adresse} />}
          </div>
        )}

        {/* ── Message cadeau (toggle) — masqué par défaut ── */}
        <div style={{ marginBottom: '36px' }}>
          <button
            type="button"
            onClick={() => setAfficherMessage(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'none', border: 'none', cursor: 'pointer', padding: '0',
            }}
          >
            {/* Case à cocher style luxe */}
            <span style={{
              width: '16px', height: '16px', flexShrink: 0,
              border: afficherMessage ? '1.5px solid #C9A84C' : '0.5px solid rgba(201,168,76,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: afficherMessage ? 'rgba(201,168,76,0.1)' : 'transparent',
              transition: 'all 0.15s ease',
            }}>
              {afficherMessage && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                  <path d="M1 4l2.5 2.5 5.5-6" stroke="#C9A84C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            <span style={{
              fontFamily: fa, fontSize: estArabe ? '15px' : '11px', fontWeight: 500,
              letterSpacing: estArabe ? 0 : '0.15em',
              textTransform: estArabe ? 'none' : 'uppercase',
              color: afficherMessage ? 'rgba(201,168,76,0.9)' : 'rgba(201,168,76,0.55)',
              transition: 'color 0.15s ease',
            }}>
              {estArabe ? 'إضافة رسالة هدية (اختياري)' : 'Ajouter un message cadeau (optionnel)'}
            </span>
          </button>
          {afficherMessage && (
            <div style={{ marginTop: '16px' }}>
              <textarea
                className="form-input"
                value={champs.message_cadeau}
                onChange={e => maj('message_cadeau', e.target.value)}
                placeholder={T.phMsg}
                rows={2}
                style={{ ...inputSt, resize: 'none' }}
              />
            </div>
          )}
        </div>

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
            fontSize: estArabe ? '15px' : '12px',
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
            2 500 <span style={{ fontSize: '14px', fontWeight: 300, color: 'rgba(201,168,76,0.6)' }}>DA</span>
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
            <>أريد هذه الحقيبة — <span dir="ltr">2 500 DA</span></>
          ) : (
            'Je veux ce sac — 2 500 DA'
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
