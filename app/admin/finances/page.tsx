'use client'

// ============================================================
// app/admin/finances/page.tsx — Calcul de rentabilité
// CA (commandes livrées en DB) + dépenses manuelles (localStorage)
// Architecture prête pour multi-produits : coût par unité extensible
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

// ── Types ─────────────────────────────────────────────────────

type Periode = 'today' | 'week' | 'month' | '30days'

type StatsPeriode = {
  ca:           number  // Somme des montants livrés
  nbCommandes:  number  // Nombre de commandes livrées
  nbUnites:     number  // Somme des quantités livrées
}

// Dépenses sauvegardées localement (saisie manuelle admin)
type Depenses = {
  coutParUnite: number                  // Coût d'achat par sac en DA (global, modifiable)
  pub:          Record<Periode, number> // Budget pub Facebook par période
}

const DEPENSES_DEFAUT: Depenses = {
  coutParUnite: 1300,
  pub: { today: 0, week: 0, month: 0, '30days': 0 },
}

const PERIODES: { id: Periode; label: string; court: string }[] = [
  { id: 'today',  label: "Aujourd'hui",       court: 'Auj.' },
  { id: 'week',   label: 'Cette semaine',      court: 'Semaine' },
  { id: 'month',  label: 'Ce mois',            court: 'Mois' },
  { id: '30days', label: '30 derniers jours',  court: '30 j.' },
]

// ── Helpers ───────────────────────────────────────────────────

function dateDebut(p: Periode): Date {
  const now = new Date()
  switch (p) {
    case 'today':  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case 'week':   return new Date(now.getTime() - 7  * 86_400_000)
    case 'month':  return new Date(now.getFullYear(), now.getMonth(), 1)
    case '30days': return new Date(now.getTime() - 30 * 86_400_000)
  }
}

function fmt(n: number) {
  return n.toLocaleString('fr-DZ')
}

// ── Page ──────────────────────────────────────────────────────

export default function FinancesPage() {
  const [periode,    setPeriode]   = useState<Periode>('month')
  const [stats,      setStats]     = useState<StatsPeriode>({ ca: 0, nbCommandes: 0, nbUnites: 0 })
  const [loading,    setLoading]   = useState(true)
  const [depenses,   setDepenses]  = useState<Depenses>(DEPENSES_DEFAUT)
  const [editCout,   setEditCout]  = useState(false)
  const [coutInput,  setCoutInput] = useState('')

  // ── Charger dépenses depuis localStorage ──
  useEffect(() => {
    try {
      const s = localStorage.getItem('ch_finances_depenses')
      if (s) {
        const parsed = JSON.parse(s) as Depenses
        setDepenses(parsed)
        setCoutInput(String(parsed.coutParUnite))
      } else {
        setCoutInput(String(DEPENSES_DEFAUT.coutParUnite))
      }
    } catch {
      setCoutInput(String(DEPENSES_DEFAUT.coutParUnite))
    }
  }, [])

  function sauvegarder(d: Depenses) {
    setDepenses(d)
    localStorage.setItem('ch_finances_depenses', JSON.stringify(d))
  }

  // ── Charger stats depuis Supabase ──
  const charger = useCallback(async () => {
    const supabase = createClient()
    setLoading(true)
    try {
      const { data } = await supabase
        .from('commandes')
        .select('montant, quantite')
        .eq('statut', 'livree')
        .gte('created_at', dateDebut(periode).toISOString())

      if (data) {
        setStats({
          ca:          data.reduce((s, c) => s + (c.montant  || 0), 0),
          nbCommandes: data.length,
          nbUnites:    data.reduce((s, c) => s + (c.quantite || 0), 0),
        })
      }
    } catch (err) {
      console.error('[Finances] Erreur chargement:', err)
    }
    setLoading(false)
  }, [periode])

  useEffect(() => { charger() }, [charger])

  // ── Calculs ──
  const pub          = depenses.pub[periode] || 0
  const coutProduits = depenses.coutParUnite * stats.nbUnites
  const coutTotal    = coutProduits + pub
  const benefice     = stats.ca - coutTotal
  const marge        = stats.ca > 0 ? (benefice / stats.ca) * 100 : 0
  const roas         = pub > 0 ? stats.ca / pub : null

  // ── Styles réutilisables ──
  const card: React.CSSProperties = {
    background: '#fff',
    border: '0.5px solid #E0DDD8',
    borderRadius: '4px',
    padding: '24px 28px',
  }

  const labelSt: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--ch-gris-texte)',
    marginBottom: '8px',
    display: 'block',
  }

  const inputSt: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    fontWeight: 400,
    color: 'var(--ch-noir)',
    background: 'var(--ch-beige)',
    border: '0.5px solid var(--ch-gris-clair)',
    borderRadius: '3px',
    padding: '10px 12px',
    outline: 'none',
    width: '180px',
  }

  const bigNum: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '28px',
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    color: 'var(--ch-noir)',
  }

  return (
    <div style={{ padding: '36px 32px', maxWidth: '900px' }}>

      {/* ── En-tête ── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-body)', fontSize: '19px', fontWeight: 500, color: 'var(--ch-noir)', letterSpacing: '0.02em', marginBottom: '6px' }}>
          Rentabilité
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 300, color: 'var(--ch-gris-texte)', lineHeight: 1.6 }}>
          CA encaissé (commandes livrées) moins coût produits et dépenses pub = bénéfice net.
        </p>
      </div>

      {/* ── Sélecteur période ── */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {PERIODES.map(p => {
          const actif = periode === p.id
          return (
            <button
              key={p.id}
              onClick={() => setPeriode(p.id)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                fontWeight: actif ? 600 : 400,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '9px 16px',
                border: actif ? '1.5px solid var(--ch-noir)' : '0.5px solid var(--ch-gris-clair)',
                background: actif ? 'var(--ch-noir)' : 'transparent',
                color: actif ? 'var(--ch-or)' : 'var(--ch-gris-texte)',
                borderRadius: '3px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {p.label}
            </button>
          )
        })}
        <button
          onClick={charger}
          disabled={loading}
          style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            fontWeight: 400,
            letterSpacing: '0.1em',
            padding: '9px 14px',
            border: '0.5px solid var(--ch-gris-clair)',
            background: 'transparent',
            color: 'var(--ch-gris-texte)',
            borderRadius: '3px',
            cursor: 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          ↻ Actualiser
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '64px', textAlign: 'center', color: 'var(--ch-gris-texte)', fontFamily: 'var(--font-body)', fontSize: '13px' }}>
          Chargement des données…
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* ── REVENUS (source DB) ── */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '3px', height: '18px', background: 'var(--ch-or)', borderRadius: '2px' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ch-noir)' }}>
                Revenus — commandes livrées
              </span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 300, color: 'var(--ch-gris-texte)' }}>
                Temps réel · Supabase
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div>
                <span style={labelSt}>CA encaissé</span>
                <p style={{ ...bigNum, color: 'var(--ch-or-dark)' }}>{fmt(stats.ca)} <span style={{ fontSize: '13px', fontWeight: 300, color: 'var(--ch-gris-texte)' }}>DA</span></p>
              </div>
              <div>
                <span style={labelSt}>Commandes livrées</span>
                <p style={bigNum}>{stats.nbCommandes}</p>
              </div>
              <div>
                <span style={labelSt}>Unités vendues</span>
                <p style={bigNum}>{stats.nbUnites}</p>
                {stats.nbUnites > 0 && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 300, color: 'var(--ch-gris-texte)', marginTop: '4px' }}>
                    Moy. {fmt(Math.round(stats.ca / stats.nbUnites))} DA/sac
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── DÉPENSES (saisie manuelle) ── */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '3px', height: '18px', background: 'var(--ch-danger)', borderRadius: '2px' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ch-noir)' }}>
                Dépenses — saisie manuelle
              </span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 300, color: 'var(--ch-gris-texte)' }}>
                Sauvegardé dans le navigateur
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>

              {/* Coût d'achat par sac */}
              <div>
                <span style={labelSt}>Coût d'achat par sac (DA)</span>
                {editCout ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={coutInput}
                      onChange={e => setCoutInput(e.target.value)}
                      style={inputSt}
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        const v = Number(coutInput)
                        if (!isNaN(v) && v >= 0) sauvegarder({ ...depenses, coutParUnite: v })
                        setEditCout(false)
                      }}
                      style={{
                        fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        padding: '10px 14px', background: 'var(--ch-noir)', color: 'var(--ch-or)',
                        border: 'none', borderRadius: '3px', cursor: 'pointer',
                      }}
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => { setCoutInput(String(depenses.coutParUnite)); setEditCout(true) }}
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'baseline', gap: '4px' }}
                    title="Cliquer pour modifier"
                  >
                    <span style={{ ...bigNum, color: 'var(--ch-danger)' }}>{fmt(depenses.coutParUnite)}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 300, color: 'var(--ch-gris-texte)' }}>DA</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--ch-gris-texte)', marginLeft: '6px', opacity: 0.6 }}>✎</span>
                  </div>
                )}
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 300, color: 'var(--ch-gris-texte)', marginTop: '8px', lineHeight: 1.5 }}>
                  Coût total période : <strong style={{ color: 'var(--ch-danger)' }}>{fmt(coutProduits)} DA</strong>
                  <span style={{ opacity: 0.6 }}> ({stats.nbUnites} unité{stats.nbUnites > 1 ? 's' : ''} × {fmt(depenses.coutParUnite)} DA)</span>
                </p>
              </div>

              {/* Pub Facebook */}
              <div>
                <span style={labelSt}>Dépenses pub Facebook — période</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <input
                    type="number"
                    value={pub || ''}
                    placeholder="0"
                    onChange={e => sauvegarder({
                      ...depenses,
                      pub: { ...depenses.pub, [periode]: Number(e.target.value) || 0 },
                    })}
                    style={inputSt}
                  />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ch-gris-texte)' }}>DA</span>
                </div>

                {/* ROAS */}
                {roas !== null && pub > 0 && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 300, color: 'var(--ch-gris-texte)', marginTop: '8px', lineHeight: 1.5 }}>
                    ROAS :{' '}
                    <strong style={{ color: roas >= 3 ? 'var(--ch-succes)' : roas >= 2 ? 'var(--ch-warning)' : 'var(--ch-danger)' }}>
                      ×{roas.toFixed(2)}
                    </strong>
                    <span style={{ opacity: 0.6 }}> · Pour 1 DA de pub → {roas.toFixed(2)} DA de CA</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── RÉSULTAT NET ── */}
          <div style={{
            ...card,
            borderColor: benefice >= 0 ? 'rgba(58,107,54,0.35)' : 'rgba(139,50,50,0.35)',
            background:   benefice >= 0 ? 'rgba(58,107,54,0.03)' : 'rgba(139,50,50,0.03)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '3px', height: '18px', background: benefice >= 0 ? 'var(--ch-succes)' : 'var(--ch-danger)', borderRadius: '2px' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ch-noir)' }}>
                Résultat net — {PERIODES.find(p => p.id === periode)?.label}
              </span>
            </div>

            {/* Lignes de décomposition */}
            <div style={{ borderTop: '0.5px solid var(--ch-gris-clair)' }}>
              {[
                { label: 'CA encaissé (livraisons)',  valeur: stats.ca,       signe: '+', couleur: 'var(--ch-noir)' },
                { label: `Coût produits (${stats.nbUnites} × ${fmt(depenses.coutParUnite)} DA)`, valeur: coutProduits, signe: '−', couleur: 'var(--ch-danger)' },
                { label: 'Dépenses pub Facebook',     valeur: pub,            signe: '−', couleur: 'var(--ch-danger)' },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', borderBottom: '0.5px solid var(--ch-gris-clair)',
                }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 300, color: 'var(--ch-gris-texte)' }}>
                    {row.label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 500, color: row.couleur }}>
                    {row.signe} {fmt(Math.abs(row.valeur))} DA
                  </span>
                </div>
              ))}

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '20px' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ch-gris-texte)', marginBottom: '4px' }}>
                    Bénéfice net
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 300, color: 'var(--ch-gris-texte)' }}>
                    Marge brute : <strong>{marge.toFixed(1)}%</strong>
                    {roas !== null && <span style={{ marginLeft: '12px' }}>ROAS : <strong>×{roas.toFixed(2)}</strong></span>}
                  </p>
                </div>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '40px',
                  fontWeight: 600,
                  color: benefice >= 0 ? 'var(--ch-succes)' : 'var(--ch-danger)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}>
                  {benefice >= 0 ? '+' : '−'}{fmt(Math.abs(benefice))}
                  <span style={{ fontSize: '16px', fontWeight: 300, marginLeft: '6px', color: 'var(--ch-gris-texte)' }}>DA</span>
                </p>
              </div>
            </div>
          </div>

          {/* ── Note architecture multi-produit ── */}
          <div style={{
            background: 'var(--ch-beige)',
            border: '0.5px solid rgba(139,111,46,0.25)',
            borderRadius: '4px',
            padding: '18px 22px',
          }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ch-or-dark)', marginBottom: '8px' }}>
              Prêt pour de nouveaux modèles
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 300, color: 'var(--ch-gris-texte)', lineHeight: 1.75 }}>
              La base de données supporte déjà plusieurs produits (table <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: '2px' }}>produits</code>, variantes et prix individuels par produit).
              Pour ajouter un nouveau sac : Admin → Produits → Catalogue → Nouveau produit.
              La page de vente s'adapte automatiquement via <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 5px', borderRadius: '2px' }}>/produits/[slug]</code>.
              <br />
              <span style={{ opacity: 0.7 }}>Prochaine évolution : coût d'achat configurable par modèle de sac dans cette page.</span>
            </p>
          </div>

        </div>
      )}
    </div>
  )
}
