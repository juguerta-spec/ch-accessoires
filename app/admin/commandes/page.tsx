'use client'

// ============================================================
// app/admin/commandes/page.tsx — Pipeline Kanban des commandes
// 5 colonnes scrollables + filtres + export CSV
// ============================================================

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Commande } from '@/lib/supabase'

type StatutCommande = 'nouvelle' | 'confirmee' | 'expediee' | 'livree' | 'annulee'

type CommandeEnrichie = Commande & {
  clients?: { nom: string; prenom: string; telephone: string }
  variantes?: { couleur_fr: string }
}

// Définition des colonnes Kanban
const COLONNES: {
  statut: StatutCommande
  label: string
  couleur: string
  bg: string
}[] = [
  { statut: 'nouvelle',  label: 'Nouvelle',  couleur: 'var(--ch-info)',    bg: 'var(--ch-info-bg)' },
  { statut: 'confirmee', label: 'Confirmée', couleur: 'var(--ch-warning)', bg: 'var(--ch-warning-bg)' },
  { statut: 'expediee',  label: 'Expédiée',  couleur: 'var(--ch-warning)', bg: 'var(--ch-warning-bg)' },
  { statut: 'livree',    label: 'Livrée',    couleur: 'var(--ch-succes)',  bg: 'var(--ch-succes-bg)' },
  { statut: 'annulee',   label: 'Annulée',   couleur: 'var(--ch-danger)',  bg: 'var(--ch-danger-bg)' },
]

// Statut suivant dans le pipeline
const STATUT_SUIVANT: Partial<Record<StatutCommande, StatutCommande>> = {
  nouvelle:  'confirmee',
  confirmee: 'expediee',
  expediee:  'livree',
}

const LABELS_SUIVANT: Partial<Record<StatutCommande, string>> = {
  nouvelle:  'Confirmer',
  confirmee: 'Expédier',
  expediee:  'Livrer',
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-DZ', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

// ── Composant principal ───────────────────────────────────────

export default function CommandesPage() {
  const [commandes, setCommandes]   = useState<CommandeEnrichie[]>([])
  const [chargement, setChargement] = useState(true)
  const [filtreWilaya, setFiltreWilaya] = useState('')
  const [filtreDate, setFiltreDate]     = useState('')
  const [majEnCours, setMajEnCours]     = useState<string | null>(null)

  const charger = useCallback(async () => {
    const supabase = createClient()
    let requete = supabase
      .from('commandes')
      .select('*, clients(nom, prenom, telephone), variantes(couleur_fr)')
      .order('created_at', { ascending: false })

    if (filtreWilaya) requete = requete.ilike('wilaya_livraison', `%${filtreWilaya}%`)
    if (filtreDate) {
      const debut = new Date(filtreDate)
      const fin   = new Date(filtreDate)
      fin.setDate(fin.getDate() + 1)
      requete = requete.gte('created_at', debut.toISOString()).lt('created_at', fin.toISOString())
    }

    const { data } = await requete
    setCommandes((data as CommandeEnrichie[]) || [])
    setChargement(false)
  }, [filtreWilaya, filtreDate])

  useEffect(() => { charger() }, [charger])

  // Avancer au statut suivant
  async function avancerStatut(commande: CommandeEnrichie) {
    const suivant = STATUT_SUIVANT[commande.statut]
    if (!suivant || majEnCours) return

    setMajEnCours(commande.id)
    await fetch(`/api/commandes/${commande.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut: suivant }),
    })
    await charger()
    setMajEnCours(null)
  }

  // Export CSV
  function exportCSV() {
    const lignes = [
      ['N°', 'Prénom', 'Nom', 'Téléphone', 'Wilaya', 'Coloris', 'Quantité', 'Montant', 'Statut', 'Date'],
      ...commandes.map((c) => [
        c.numero,
        c.clients?.prenom || '',
        c.clients?.nom || '',
        c.clients?.telephone || '',
        c.wilaya_livraison,
        c.variantes?.couleur_fr || '',
        c.quantite,
        c.montant,
        c.statut,
        new Date(c.created_at).toLocaleString('fr-DZ'),
      ]),
    ]
    const csv  = lignes.map((l) => l.join(';')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `commandes-ch-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const commandesParStatut = (statut: StatutCommande) => commandes.filter((c) => c.statut === statut)
  const totalCommandes = commandes.length

  return (
    <div style={{ padding: '40px', minHeight: '100vh' }}>
      {/* En-tête */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ch-gris-texte)',
              marginBottom: '6px',
            }}
          >
            {totalCommandes} commande{totalCommandes !== 1 ? 's' : ''} au total
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '32px',
              fontWeight: 300,
              color: 'var(--ch-noir)',
              letterSpacing: '0.02em',
              margin: 0,
            }}
          >
            Commandes
          </h1>
        </div>

        {/* Filtres + actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Wilaya..."
            value={filtreWilaya}
            onChange={(e) => setFiltreWilaya(e.target.value)}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--ch-noir)',
              background: 'var(--ch-blanc)',
              border: 'var(--ch-border)',
              borderRadius: '4px',
              padding: '8px 12px',
              outline: 'none',
              width: '140px',
            }}
          />
          <input
            type="date"
            value={filtreDate}
            onChange={(e) => setFiltreDate(e.target.value)}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--ch-noir)',
              background: 'var(--ch-blanc)',
              border: 'var(--ch-border)',
              borderRadius: '4px',
              padding: '8px 12px',
              outline: 'none',
              width: '150px',
            }}
          />
          {(filtreWilaya || filtreDate) && (
            <button
              onClick={() => { setFiltreWilaya(''); setFiltreDate('') }}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                background: 'transparent',
                color: 'var(--ch-gris-texte)',
                border: '0.5px solid var(--ch-gris-clair)',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer',
              }}
            >
              Effacer
            </button>
          )}
          <button
            onClick={exportCSV}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              background: 'var(--ch-noir)',
              color: 'var(--ch-or)',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Pipeline Kanban */}
      {chargement ? (
        <div style={{ display: 'flex', gap: '16px' }}>
          {COLONNES.map((c) => (
            <div
              key={c.statut}
              style={{
                flexShrink: 0,
                width: '230px',
                height: '300px',
                background: 'var(--ch-beige)',
                border: 'var(--ch-border)',
                borderRadius: '4px',
              }}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            gap: '14px',
            overflowX: 'auto',
            paddingBottom: '16px',
            alignItems: 'flex-start',
          }}
        >
          {COLONNES.map(({ statut, label, couleur, bg }) => {
            const items = commandesParStatut(statut)
            return (
              <div
                key={statut}
                style={{
                  flexShrink: 0,
                  width: '235px',
                  background: 'var(--ch-blanc)',
                  border: 'var(--ch-border)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                {/* En-tête colonne */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderBottom: `2px solid ${couleur}`,
                    background: bg,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '10px',
                      fontWeight: 500,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: couleur,
                    }}
                  >
                    {label}
                  </span>
                  {items.length > 0 && (
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: couleur,
                        background: 'rgba(255,255,255,0.7)',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {items.length}
                    </span>
                  )}
                </div>

                {/* Cards commandes */}
                <div
                  style={{
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '7px',
                    maxHeight: '72vh',
                    overflowY: 'auto',
                  }}
                >
                  {items.length === 0 && (
                    <div
                      style={{
                        padding: '24px 8px',
                        textAlign: 'center',
                        fontFamily: 'var(--font-body)',
                        fontSize: '11px',
                        color: 'var(--ch-gris-clair)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Aucune commande
                    </div>
                  )}

                  {items.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        background: 'var(--ch-blanc)',
                        border: 'var(--ch-border)',
                        padding: '12px',
                        borderRadius: '4px',
                        transition: 'border-color 0.1s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = couleur)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--ch-gris-clair)')}
                    >
                      {/* Numéro + montant */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <Link
                          href={`/admin/commandes/${c.id}`}
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--ch-or)',
                            textDecoration: 'none',
                            letterSpacing: '0.03em',
                          }}
                        >
                          {c.numero}
                        </Link>
                        <span
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: 'var(--ch-noir)',
                          }}
                        >
                          {c.montant.toLocaleString('fr-DZ')} <span style={{ fontWeight: 300, fontSize: '10px', color: 'var(--ch-gris-texte)' }}>DA</span>
                        </span>
                      </div>

                      {/* Séparateur */}
                      <div style={{ height: '0.5px', background: 'var(--ch-beige)', marginBottom: '8px' }} />

                      {/* Client */}
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'var(--ch-noir)',
                          marginBottom: '3px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {c.clients ? `${c.clients.prenom} ${c.clients.nom}` : '—'}
                      </p>

                      {/* Détails */}
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11px',
                          color: 'var(--ch-gris-texte)',
                          marginBottom: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {c.wilaya_livraison}
                        {c.variantes?.couleur_fr && (
                          <>
                            <span style={{ margin: '0 4px', opacity: 0.4 }}>·</span>
                            {c.variantes.couleur_fr}
                          </>
                        )}
                      </p>

                      {/* Date */}
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '10px',
                          color: 'var(--ch-gris-clair)',
                          marginBottom: STATUT_SUIVANT[c.statut] ? '10px' : '0',
                        }}
                      >
                        {formatDate(c.created_at)}
                      </p>

                      {/* Bouton avancer statut */}
                      {STATUT_SUIVANT[c.statut] && (
                        <button
                          onClick={() => avancerStatut(c)}
                          disabled={majEnCours === c.id}
                          style={{
                            width: '100%',
                            padding: '7px',
                            fontFamily: 'var(--font-body)',
                            fontSize: '10px',
                            fontWeight: 500,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--ch-blanc)',
                            background: couleur,
                            border: 'none',
                            borderRadius: '4px',
                            cursor: majEnCours === c.id ? 'wait' : 'pointer',
                            opacity: majEnCours === c.id ? 0.6 : 1,
                            transition: 'opacity 0.15s',
                          }}
                        >
                          {majEnCours === c.id ? '…' : `→ ${LABELS_SUIVANT[c.statut]}`}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
