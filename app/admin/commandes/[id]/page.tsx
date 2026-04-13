'use client'

// ============================================================
// app/admin/commandes/[id]/page.tsx — Détail d'une commande
// Infos client + produit + statut + tracking + notes internes
// ============================================================

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { Commande } from '@/lib/supabase'

type StatutCommande = 'nouvelle' | 'confirmee' | 'expediee' | 'livree' | 'annulee'
const STATUTS: StatutCommande[] = ['nouvelle', 'confirmee', 'expediee', 'livree', 'annulee']

type CommandeDetail = Commande & {
  clients?: { nom: string; prenom: string; telephone: string; wilaya: string; adresse: string | null }
  variantes?: { couleur_fr: string; couleur_hex: string | null; produits?: { nom_fr: string; prix: number } }
}

export default function CommandeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [commande, setCommande] = useState<CommandeDetail | null>(null)
  const [notes, setNotes] = useState('')
  const [nouveauStatut, setNouveauStatut] = useState<StatutCommande>('nouvelle')
  const [sauvegarde, setSauvegarde] = useState(false)

  useEffect(() => {
    async function charger() {
      const res = await fetch(`/api/commandes/${id}`)
      const json = await res.json()
      if (json.success) {
        setCommande(json.data)
        setNotes(json.data.notes || '')
        setNouveauStatut(json.data.statut)
      }
    }
    charger()
  }, [id])

  async function sauvegarder() {
    setSauvegarde(true)
    await fetch(`/api/commandes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut: nouveauStatut, notes }),
    })
    setSauvegarde(false)
    router.refresh()
  }

  if (!commande) {
    return <div style={{ padding: '32px', fontFamily: 'var(--font-body)', color: 'var(--ch-gris-texte)' }}>Chargement...</div>
  }

  const c = commande

  function Champ({ label, valeur }: { label: string; valeur: string | number | null | undefined }) {
    return (
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ch-gris-texte)', marginBottom: '2px' }}>
          {label}
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ch-noir)' }}>
          {valeur || '—'}
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '32px', maxWidth: '800px' }}>
      <button
        onClick={() => router.back()}
        style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--ch-gris-texte)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '24px', letterSpacing: '0.08em' }}
      >
        ← Retour
      </button>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400, color: 'var(--ch-noir)', marginBottom: '32px' }}>
        Commande {c.numero}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Infos client */}
        <div style={{ background: 'var(--ch-blanc)', border: 'var(--ch-border)', borderRadius: '4px', padding: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ch-gris-texte)', marginBottom: '16px' }}>
            Client
          </h2>
          <Champ label="Nom complet" valeur={c.clients ? `${c.clients.prenom} ${c.clients.nom}` : null} />
          <Champ label="Téléphone" valeur={c.clients?.telephone} />
          <Champ label="Wilaya" valeur={c.wilaya_livraison} />
          <Champ label="Adresse" valeur={c.adresse_livraison} />
          {c.message_cadeau && <Champ label="Message cadeau" valeur={c.message_cadeau} />}
        </div>

        {/* Infos commande */}
        <div style={{ background: 'var(--ch-blanc)', border: 'var(--ch-border)', borderRadius: '4px', padding: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ch-gris-texte)', marginBottom: '16px' }}>
            Produit
          </h2>
          <Champ label="Produit" valeur={c.variantes?.produits?.nom_fr} />
          <Champ label="Coloris" valeur={c.variantes?.couleur_fr} />
          <Champ label="Quantité" valeur={c.quantite} />
          <Champ label="Montant total" valeur={`${c.montant.toLocaleString('fr-DZ')} DA`} />
        </div>

        {/* Tracking */}
        <div style={{ background: 'var(--ch-blanc)', border: 'var(--ch-border)', borderRadius: '4px', padding: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ch-gris-texte)', marginBottom: '16px' }}>
            Tracking
          </h2>
          <Champ label="UTM Source" valeur={c.utm_source} />
          <Champ label="UTM Campaign" valeur={c.utm_campaign} />
          <Champ label="UTM Content" valeur={c.utm_content} />
          <Champ label="fbclid" valeur={c.fbclid} />
        </div>

        {/* Statut + Notes */}
        <div style={{ background: 'var(--ch-blanc)', border: 'var(--ch-border)', borderRadius: '4px', padding: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ch-gris-texte)', marginBottom: '16px' }}>
            Statut & Notes
          </h2>

          <label className="input-label">Statut</label>
          <select
            className="input-underline"
            value={nouveauStatut}
            onChange={(e) => setNouveauStatut(e.target.value as StatutCommande)}
            style={{ marginBottom: '24px' }}
          >
            {STATUTS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>

          <label className="input-label">Notes internes</label>
          <textarea
            className="input-underline"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{ resize: 'none', marginBottom: '16px' }}
            placeholder="Notes visibles uniquement par l'admin..."
          />

          <button
            onClick={sauvegarder}
            disabled={sauvegarde}
            className="btn-noir"
            style={{ padding: '10px 20px', width: 'auto' }}
          >
            {sauvegarde ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}
