'use client'

// ============================================================
// app/admin/clients/page.tsx — Liste des clients avec recherche et modal
// ============================================================

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Client, Commande } from '@/lib/supabase'

type ClientEnrichi = Client & {
  ca_total?: number
  derniere_commande?: string
}

const BADGE_STATUT: Record<string, { cls: string; label: string }> = {
  nouvelle:  { cls: 'badge badge-info',    label: 'Nouvelle' },
  confirmee: { cls: 'badge badge-warning', label: 'Confirmée' },
  expediee:  { cls: 'badge badge-warning', label: 'Expédiée' },
  livree:    { cls: 'badge badge-succes',  label: 'Livrée' },
  annulee:   { cls: 'badge badge-danger',  label: 'Annulée' },
}

// Initiales à partir du prénom + nom
function initiales(prenom: string, nom: string): string {
  return `${prenom[0] || ''}${nom[0] || ''}`.toUpperCase()
}

// Couleur déterministe basée sur l'id client (pour l'avatar)
function couleurAvatar(id: string): string {
  const palettes = [
    { bg: 'var(--ch-info-bg)',    color: 'var(--ch-info)' },
    { bg: 'var(--ch-succes-bg)', color: 'var(--ch-succes)' },
    { bg: 'var(--ch-warning-bg)',color: 'var(--ch-warning)' },
    { bg: 'var(--ch-or-clair)',  color: 'var(--ch-or-dark)' },
    { bg: 'var(--ch-beige)',     color: 'var(--ch-gris-texte)' },
  ]
  const idx = id.charCodeAt(0) % palettes.length
  return JSON.stringify(palettes[idx])
}

// ── Composant principal ───────────────────────────────────────

export default function ClientsPage() {
  const [clients, setClients]         = useState<ClientEnrichi[]>([])
  const [recherche, setRecherche]     = useState('')
  const [clientModal, setClientModal] = useState<ClientEnrichi | null>(null)
  const [commandesModal, setCommandesModal] = useState<Commande[]>([])
  const [chargementModal, setChargementModal] = useState(false)
  const [chargement, setChargement]   = useState(true)

  useEffect(() => {
    async function charger() {
      const supabase    = createClient()
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (!clientsData) { setChargement(false); return }

      const enrichis: ClientEnrichi[] = await Promise.all(
        clientsData.map(async (client) => {
          const { data: cmds } = await supabase
            .from('commandes')
            .select('montant, created_at, statut')
            .eq('client_id', client.id)
            .order('created_at', { ascending: false })

          const caTotal          = cmds?.filter((c) => c.statut === 'livree').reduce((s, c) => s + c.montant, 0) || 0
          const derniereCommande = cmds?.[0]?.created_at || null

          return { ...client, ca_total: caTotal, derniere_commande: derniereCommande }
        })
      )

      setClients(enrichis)
      setChargement(false)
    }

    charger()
  }, [])

  // Ouvrir la modal d'un client
  async function ouvrirModal(client: ClientEnrichi) {
    setClientModal(client)
    setChargementModal(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('commandes')
      .select('*, variantes(couleur_fr)')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false })

    setCommandesModal((data as Commande[]) || [])
    setChargementModal(false)
  }

  // Filtre recherche
  const clientsFiltres = clients.filter((c) => {
    const q = recherche.toLowerCase()
    return (
      `${c.nom} ${c.prenom}`.toLowerCase().includes(q) ||
      c.telephone.includes(q) ||
      c.wilaya.toLowerCase().includes(q)
    )
  })

  return (
    <div style={{ padding: '40px', maxWidth: '1200px' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
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
            {clients.length} client{clients.length !== 1 ? 's' : ''} enregistré{clients.length !== 1 ? 's' : ''}
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
            Clients
          </h1>
        </div>

        {/* Recherche */}
        <div style={{ position: 'relative' }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ch-gris-clair)', pointerEvents: 'none' }}
          >
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Nom, téléphone, wilaya..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--ch-noir)',
              background: 'var(--ch-blanc)',
              border: 'var(--ch-border)',
              borderRadius: '4px',
              padding: '9px 12px 9px 34px',
              outline: 'none',
              width: '260px',
            }}
          />
        </div>
      </div>

      {/* Tableau */}
      {chargement ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: '52px', background: 'var(--ch-beige)', borderRadius: '4px', border: 'var(--ch-border)' }} />
          ))}
        </div>
      ) : clientsFiltres.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--ch-gris-texte)',
            border: 'var(--ch-border)',
            borderRadius: '4px',
            background: 'var(--ch-beige)',
          }}
        >
          {recherche ? `Aucun client pour « ${recherche} »` : 'Aucun client pour l\'instant.'}
        </div>
      ) : (
        <div
          style={{
            background: 'var(--ch-blanc)',
            border: 'var(--ch-border)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--ch-beige)', borderBottom: 'var(--ch-border)' }}>
                  {['Client', 'Téléphone', 'Wilaya', 'Commandes', 'CA livré', 'Dernière commande'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '11px 20px',
                        fontFamily: 'var(--font-body)',
                        fontSize: '9.5px',
                        fontWeight: 500,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--ch-gris-texte)',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientsFiltres.map((client, idx) => (
                  <tr
                    key={client.id}
                    onClick={() => ouvrirModal(client)}
                    style={{
                      borderBottom: idx < clientsFiltres.length - 1 ? 'var(--ch-border)' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(201,168,76,0.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Colonne client : avatar + nom */}
                    <td style={{ padding: '13px 20px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {(() => {
                          const palette = JSON.parse(couleurAvatar(client.id))
                          return (
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: palette.bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'var(--font-body)',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: palette.color,
                                flexShrink: 0,
                                letterSpacing: '0.05em',
                              }}
                            >
                              {initiales(client.prenom, client.nom)}
                            </div>
                          )
                        })()}
                        <span
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--ch-noir)',
                          }}
                        >
                          {client.prenom} {client.nom}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 20px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ch-gris-texte)', whiteSpace: 'nowrap' }}>
                      {client.telephone}
                    </td>
                    <td style={{ padding: '13px 20px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ch-gris-texte)' }}>
                      {client.wilaya}
                    </td>
                    <td style={{ padding: '13px 20px', textAlign: 'center' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'var(--ch-noir)',
                        }}
                      >
                        {client.total_commandes}
                      </span>
                    </td>
                    <td style={{ padding: '13px 20px', whiteSpace: 'nowrap' }}>
                      {client.ca_total && client.ca_total > 0 ? (
                        <span
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--ch-or-dark)',
                          }}
                        >
                          {client.ca_total.toLocaleString('fr-DZ')}
                          <span style={{ fontWeight: 300, fontSize: '10px', color: 'var(--ch-gris-texte)', marginLeft: '2px' }}>DA</span>
                        </span>
                      ) : (
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ch-gris-clair)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '13px 20px', fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--ch-gris-texte)', whiteSpace: 'nowrap' }}>
                      {client.derniere_commande
                        ? new Date(client.derniere_commande).toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal détail client ──────────────────────────────── */}
      {clientModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,10,10,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
            backdropFilter: 'blur(2px)',
          }}
          onClick={() => { setClientModal(null); setCommandesModal([]) }}
        >
          <div
            style={{
              background: 'var(--ch-blanc)',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '85vh',
              overflowY: 'auto',
              borderRadius: '4px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête modal */}
            <div
              style={{
                padding: '28px 28px 20px',
                borderBottom: 'var(--ch-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {/* Avatar large */}
              {(() => {
                const palette = JSON.parse(couleurAvatar(clientModal.id))
                return (
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: palette.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-body)',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: palette.color,
                      flexShrink: 0,
                    }}
                  >
                    {initiales(clientModal.prenom, clientModal.nom)}
                  </div>
                )
              })()}

              <div style={{ flex: 1, minWidth: 0 }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px',
                    fontWeight: 400,
                    color: 'var(--ch-noir)',
                    margin: '0 0 4px',
                    letterSpacing: '0.02em',
                  }}
                >
                  {clientModal.prenom} {clientModal.nom}
                </h2>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--ch-gris-texte)',
                    margin: 0,
                  }}
                >
                  {clientModal.telephone}
                  <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
                  {clientModal.wilaya}
                  {clientModal.adresse && (
                    <>
                      <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
                      {clientModal.adresse}
                    </>
                  )}
                </p>
              </div>

              {/* Bouton fermer */}
              <button
                onClick={() => { setClientModal(null); setCommandesModal([]) }}
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'var(--ch-beige)',
                  border: 'var(--ch-border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ch-gris-texte)',
                  fontSize: '18px',
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            {/* Stats rapides */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0',
                borderBottom: 'var(--ch-border)',
              }}
            >
              <div
                style={{
                  padding: '16px 28px',
                  borderRight: 'var(--ch-border)',
                }}
              >
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ch-gris-texte)', marginBottom: '4px' }}>
                  Commandes totales
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '22px', fontWeight: 500, color: 'var(--ch-noir)', margin: 0 }}>
                  {clientModal.total_commandes}
                </p>
              </div>
              <div style={{ padding: '16px 28px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ch-gris-texte)', marginBottom: '4px' }}>
                  CA livré
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '22px', fontWeight: 500, color: 'var(--ch-or-dark)', margin: 0 }}>
                  {(clientModal.ca_total || 0).toLocaleString('fr-DZ')}
                  <span style={{ fontSize: '13px', fontWeight: 300, color: 'var(--ch-gris-texte)', marginLeft: '3px' }}>DA</span>
                </p>
              </div>
            </div>

            {/* Historique commandes */}
            <div style={{ padding: '20px 28px 28px' }}>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--ch-gris-texte)',
                  marginBottom: '14px',
                }}
              >
                Historique commandes
              </p>

              {chargementModal ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[1, 2].map((i) => (
                    <div key={i} style={{ height: '48px', background: 'var(--ch-beige)', borderRadius: '4px' }} />
                  ))}
                </div>
              ) : commandesModal.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ch-gris-texte)', textAlign: 'center', padding: '20px 0' }}>
                  Aucune commande trouvée.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {commandesModal.map((cmd) => {
                    const info   = BADGE_STATUT[cmd.statut] || { cls: 'badge', label: cmd.statut }
                    const variante = (cmd as Commande & { variantes?: { couleur_fr: string } }).variantes
                    return (
                      <div
                        key={cmd.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '11px 14px',
                          border: 'var(--ch-border)',
                          borderRadius: '4px',
                          background: 'var(--ch-blanc)',
                          gap: '8px',
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <span
                              style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: '12px',
                                fontWeight: 600,
                                color: 'var(--ch-or)',
                                letterSpacing: '0.03em',
                              }}
                            >
                              {cmd.numero}
                            </span>
                            {variante?.couleur_fr && (
                              <span
                                style={{
                                  fontFamily: 'var(--font-body)',
                                  fontSize: '11px',
                                  color: 'var(--ch-gris-texte)',
                                }}
                              >
                                · {variante.couleur_fr}
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '11px',
                              color: 'var(--ch-gris-texte)',
                            }}
                          >
                            {new Date(cmd.created_at).toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '13px',
                              fontWeight: 500,
                              color: 'var(--ch-noir)',
                            }}
                          >
                            {cmd.montant.toLocaleString('fr-DZ')} <span style={{ fontWeight: 300, fontSize: '10px', color: 'var(--ch-gris-texte)' }}>DA</span>
                          </span>
                          <span className={info.cls}>{info.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
