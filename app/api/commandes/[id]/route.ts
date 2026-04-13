// ============================================================
// app/api/commandes/[id]/route.ts — PATCH : mise à jour statut commande
//
// Événements Meta CAPI déclenchés au changement de statut :
//   nouvelle   → (rien)
//   confirmee  → Purchase  (signal fort : commande confirmée par téléphone)
//   expediee   → (rien)
//   livree     → OrderDelivered (signal le plus fort : argent encaissé)
//   annulee    → (rien)
//
// Ces événements utilisent le téléphone du client (hashé SHA-256)
// et le fbclid stocké sur la commande pour une attribution maximale.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { sendConversionEvent } from '@/lib/meta-conversions-api'

type StatutCommande = 'nouvelle' | 'confirmee' | 'expediee' | 'livree' | 'annulee'
const STATUTS_VALIDES: StatutCommande[] = ['nouvelle', 'confirmee', 'expediee', 'livree', 'annulee']

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ch-accessoires.com'

// ── PATCH — Changer le statut d'une commande ─────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient()
  const { id }   = params

  let body: { statut: StatutCommande; notes?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Corps de requête invalide' }, { status: 400 })
  }

  if (!STATUTS_VALIDES.includes(body.statut)) {
    return NextResponse.json(
      { success: false, error: `Statut invalide. Valeurs : ${STATUTS_VALIDES.join(', ')}` },
      { status: 400 }
    )
  }

  // Récupérer la commande complète avec téléphone client et fbclid
  // Ces données sont nécessaires pour les événements CAPI
  const { data: commande, error: errLecture } = await supabase
    .from('commandes')
    .select(`
      id, statut, numero, montant, quantite, fbclid, client_id,
      clients ( telephone )
    `)
    .eq('id', id)
    .single()

  if (errLecture || !commande) {
    return NextResponse.json({ success: false, error: 'Commande introuvable' }, { status: 404 })
  }

  // Mise à jour du statut (+ notes optionnelles)
  const miseAJour: Record<string, unknown> = { statut: body.statut }
  if (body.notes !== undefined) miseAJour.notes = body.notes

  const { data: commandeMaj, error: errMaj } = await supabase
    .from('commandes')
    .update(miseAJour)
    .eq('id', id)
    .select()
    .single()

  if (errMaj || !commandeMaj) {
    console.error('[API Commandes PATCH] Erreur mise à jour:', errMaj)
    return NextResponse.json({ success: false, error: 'Erreur mise à jour commande' }, { status: 500 })
  }

  // Extraire le téléphone du client (jointure — Supabase retourne un objet ou null)
  const clientJoint = commande.clients as unknown as { telephone: string } | null
  const telephone   = clientJoint?.telephone

  // ── Incrémenter total_commandes quand statut → livree ────────
  if (body.statut === 'livree' && commande.statut !== 'livree') {
    const { error: errRpc } = await supabase.rpc('increment_total_commandes', {
      client_uuid: commande.client_id,
    })
    if (errRpc) {
      // Fallback manuel si la fonction RPC n'existe pas
      const { data: client } = await supabase
        .from('clients')
        .select('total_commandes')
        .eq('id', commande.client_id)
        .single()
      if (client) {
        await supabase
          .from('clients')
          .update({ total_commandes: client.total_commandes + 1 })
          .eq('id', commande.client_id)
      }
    }
  }

  // ── Événements CAPI selon le nouveau statut ──────────────────
  // Seulement si on change réellement de statut et qu'on a le téléphone
  if (telephone && body.statut !== commande.statut) {
    const pageUrl = `${SITE_URL}/admin/commandes/${id}`

    if (body.statut === 'confirmee') {
      // ── Purchase : commande confirmée par téléphone ──────────
      // C'est le signal le plus important pour Meta Ads :
      // Meta apprend à cibler des gens qui confirment vraiment leurs commandes COD.
      // event_id unique par commande pour éviter les doublons si l'admin re-clique
      sendConversionEvent({
        eventName: 'Purchase',
        phone: telephone,
        fbclid: commande.fbclid || undefined,
        eventId: `purchase-confirmed-${commande.id}`,
        orderId: commande.numero,
        value: commande.montant,
        eventSourceUrl: pageUrl,
      }).catch((err) => console.error('[CAPI] Erreur Purchase confirmee:', err))
    }

    if (body.statut === 'livree') {
      // ── OrderDelivered : colis remis, argent encaissé ─────────
      // Signal le plus fort : personne qui a VRAIMENT payé.
      // Utilisé pour créer des Lookalike Audiences de haute qualité
      // et exclure les vrais acheteurs des campagnes acquisition.
      sendConversionEvent({
        eventName: 'OrderDelivered',
        phone: telephone,
        fbclid: commande.fbclid || undefined,
        eventId: `delivered-${commande.id}`,
        orderId: commande.numero,
        value: commande.montant,
        eventSourceUrl: pageUrl,
      }).catch((err) => console.error('[CAPI] Erreur OrderDelivered livree:', err))
    }
  }

  return NextResponse.json({ success: true, data: commandeMaj })
}

// ── GET — Détail complet d'une commande ──────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createAdminClient()

  const { data: commande, error } = await supabase
    .from('commandes')
    .select(`
      *,
      clients(*),
      variantes(*, produits(*))
    `)
    .eq('id', params.id)
    .single()

  if (error || !commande) {
    return NextResponse.json({ success: false, error: 'Commande introuvable' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: commande })
}
