// ============================================================
// app/api/commandes/route.ts — POST : création d'une commande COD
// Valide, crée le client si nécessaire, insère la commande, décrémente le stock
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { isWilayaValide } from '@/lib/wilayas'
import { sendConversionEvent } from '@/lib/meta-conversions-api'
import { envoyerNotificationAdmin } from '@/lib/notifications'

// Regex validation téléphone algérien
const REGEX_TELEPHONE = /^(05|06|07)[0-9]{8}$/

// ── Anti-fraude : score de risque par wilaya ─────────────────
// Basé sur les taux d'annulation COD constatés sur les marchés algériens.
// 'haute' = prudence accrue, note ajoutée à la commande pour l'admin.
const RISQUE_WILAYA: Record<string, 'normal' | 'modere' | 'haute'> = {
  // Wilayas à surveiller (taux d'annulation historiquement plus élevés)
  'Tipaza': 'modere', 'Boumerdès': 'modere', 'Ain Defla': 'modere',
  'Relizane': 'modere', 'Médéa': 'modere', 'Bouira': 'modere',
  'Tissemsilt': 'haute', 'Naama': 'haute', 'El Bayadh': 'haute',
  'Illizi': 'haute', 'Tamanrasset': 'haute', 'Adrar': 'haute',
  'Tindouf': 'haute', 'Ghardaïa': 'modere', 'Ouargla': 'modere',
}

type CommandeBody = {
  // Infos client
  nom: string
  prenom: string
  telephone: string
  wilaya: string
  adresse: string
  // Commande
  variante_id: string
  quantite: number
  message_cadeau?: string
  notes?: string
  // Tracking
  fbclid?: string
  utm_source?: string
  utm_campaign?: string
  utm_content?: string
  // Déduplication Pixel
  event_id?: string
  // A/B test — variante affichée lors de la commande
  ab_variant?: string
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()

  let body: CommandeBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Corps de requête invalide' },
      { status: 400 }
    )
  }

  // --- Validation des champs obligatoires ---
  const { nom, prenom, telephone, wilaya, adresse, variante_id, quantite } = body

  if (!nom?.trim() || !prenom?.trim()) {
    return NextResponse.json(
      { success: false, error: 'Nom et prénom obligatoires' },
      { status: 400 }
    )
  }

  if (!REGEX_TELEPHONE.test(telephone)) {
    return NextResponse.json(
      { success: false, error: 'Numéro de téléphone invalide (format 05/06/07XXXXXXXX)' },
      { status: 400 }
    )
  }

  if (!isWilayaValide(wilaya)) {
    return NextResponse.json(
      { success: false, error: 'Wilaya invalide' },
      { status: 400 }
    )
  }

  if (!adresse?.trim()) {
    return NextResponse.json(
      { success: false, error: 'Adresse de livraison obligatoire' },
      { status: 400 }
    )
  }

  // ── Anti-fraude : max 3 commandes par téléphone dans les 24h ─
  const hier = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count: nbRecents } = await supabase
    .from('commandes')
    .select('*', { count: 'exact', head: true })
    .eq('clients.telephone', telephone)
    .gte('created_at', hier)
    .not('statut', 'eq', 'annulee')

  // Jointure sur clients via client_id — requête plus fiable
  const { data: clientsAvecCeTel } = await supabase
    .from('clients')
    .select('id')
    .eq('telephone', telephone)

  if (clientsAvecCeTel && clientsAvecCeTel.length > 0) {
    const clientIds = clientsAvecCeTel.map((c) => c.id)
    const { count: nbCmdRecentes } = await supabase
      .from('commandes')
      .select('*', { count: 'exact', head: true })
      .in('client_id', clientIds)
      .gte('created_at', hier)
      .not('statut', 'eq', 'annulee')

    if ((nbCmdRecentes || 0) >= 3) {
      return NextResponse.json(
        { success: false, error: 'Trop de commandes récentes. Veuillez réessayer dans 24 heures ou nous contacter sur WhatsApp.' },
        { status: 429 }
      )
    }
  }

  // Supprimer variable inutilisée
  void nbRecents

  if (!variante_id) {
    return NextResponse.json(
      { success: false, error: 'Variante produit obligatoire' },
      { status: 400 }
    )
  }

  const qte = Number(quantite)
  if (!Number.isInteger(qte) || qte < 1 || qte > 3) {
    return NextResponse.json(
      { success: false, error: 'Quantité invalide (1 à 3 maximum)' },
      { status: 400 }
    )
  }

  // --- Vérification du stock disponible ---
  const { data: variante, error: errVariante } = await supabase
    .from('variantes')
    .select('id, stock, produit_id, couleur_fr')
    .eq('id', variante_id)
    .single()

  if (errVariante || !variante) {
    return NextResponse.json(
      { success: false, error: 'Variante introuvable' },
      { status: 404 }
    )
  }

  if (variante.stock < qte) {
    return NextResponse.json(
      { success: false, error: `Stock insuffisant. Il reste ${variante.stock} unité(s) disponible(s).` },
      { status: 409 }
    )
  }

  // --- Récupération du prix depuis la table produits ---
  const { data: produit, error: errProduit } = await supabase
    .from('produits')
    .select('prix')
    .eq('id', variante.produit_id)
    .single()

  if (errProduit || !produit) {
    return NextResponse.json(
      { success: false, error: 'Produit introuvable' },
      { status: 404 }
    )
  }

  const montant = produit.prix * qte

  // --- Upsert client (création ou récupération par téléphone) ---
  const { data: clientExistant } = await supabase
    .from('clients')
    .select('id')
    .eq('telephone', telephone)
    .single()

  let clientId: string

  if (clientExistant) {
    clientId = clientExistant.id
  } else {
    const { data: nouveauClient, error: errClient } = await supabase
      .from('clients')
      .insert({
        nom: nom.trim(),
        prenom: prenom.trim(),
        telephone,
        wilaya,
        adresse: adresse.trim(),
      })
      .select('id')
      .single()

    if (errClient || !nouveauClient) {
      console.error('[API Commandes] Erreur création client:', errClient)
      return NextResponse.json(
        { success: false, error: 'Erreur création client' },
        { status: 500 }
      )
    }

    clientId = nouveauClient.id
  }

  // --- Génération du numéro de commande unique : CH + 6 derniers chiffres du timestamp ---
  const numero = 'CH' + Date.now().toString().slice(-6)

  // --- Score de risque wilaya (ajouté en note pour l'admin) ---
  const risqueWilaya = RISQUE_WILAYA[wilaya] || 'normal'
  const noteRisque = risqueWilaya !== 'normal'
    ? `[RISQUE:${risqueWilaya.toUpperCase()}] `
    : ''
  const notesFinales = noteRisque + (body.notes || '')

  // --- Insertion de la commande ---
  const { data: commande, error: errCommande } = await supabase
    .from('commandes')
    .insert({
      numero,
      client_id: clientId,
      variante_id,
      quantite: qte,
      montant,
      wilaya_livraison: wilaya,
      adresse_livraison: adresse.trim(),
      message_cadeau: body.message_cadeau?.trim() || null,
      notes: notesFinales || null,
      fbclid: body.fbclid || null,
      utm_source: body.utm_source || null,
      utm_campaign: body.utm_campaign || null,
      utm_content: body.utm_content || null,
      ab_variant: body.ab_variant || null,
    })
    .select('id, numero')
    .single()

  if (errCommande || !commande) {
    console.error('[API Commandes] Erreur insertion commande:', errCommande)
    return NextResponse.json(
      { success: false, error: 'Erreur création commande' },
      { status: 500 }
    )
  }

  // --- Décrémentation du stock ---
  const { error: errStock } = await supabase
    .from('variantes')
    .update({ stock: variante.stock - qte })
    .eq('id', variante_id)

  if (errStock) {
    // Non bloquant : la commande est créée, le stock sera corrigé manuellement si besoin
    console.error('[API Commandes] Erreur décrémentation stock:', errStock)
  }

  // --- Notification admin (WhatsApp + Email) — fire-and-forget ---
  envoyerNotificationAdmin({
    numero:    commande.numero,
    client:    `${prenom.trim()} ${nom.trim()}`,
    telephone,
    wilaya,
    coloris:   variante.couleur_fr,
    montant,
    quantite:  qte,
  }).catch((err) => console.error('[Notifications] Erreur envoi admin:', err))

  // --- Envoi événement Meta CAPI : Lead ---
  // Lead = commande COD soumise, pas encore confirmée ni payée.
  // Le vrai Purchase CAPI sera envoyé quand l'admin passe le statut → "confirmee".
  // Le même event_id est utilisé côté client (Pixel) pour la déduplication Meta.
  const eventId = body.event_id || `lead-${commande.id}`
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ch-accessoires.com'

  sendConversionEvent({
    eventName: 'Lead',
    phone: telephone,
    fbclid: body.fbclid,
    eventId,
    orderId: numero,
    value: montant,
    eventSourceUrl: `${siteUrl}/produits/sac-ch-signature`,
  }).catch((err) => console.error('[CAPI] Erreur envoi Lead:', err))

  return NextResponse.json({
    success: true,
    data: {
      id: commande.id,
      numero: commande.numero,
    },
  })
}
