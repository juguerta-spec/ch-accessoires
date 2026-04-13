// ============================================================
// lib/supabase.ts — Client Supabase côté navigateur
// Utilisé dans les composants React (Client Components)
// ============================================================

import { createBrowserClient } from '@supabase/ssr'

// Types des tables de la base de données
export type Produit = {
  id: string
  slug: string
  nom_fr: string
  nom_ar: string
  description_fr: string | null
  description_ar: string | null
  prix: number
  actif: boolean
  created_at: string
  variantes?: Variante[]
}

export type Variante = {
  id: string
  produit_id: string
  couleur_fr: string
  couleur_ar: string
  couleur_hex: string | null
  stock: number
  images: string[]
}

export type Client = {
  id: string
  nom: string
  prenom: string
  telephone: string
  wilaya: string
  adresse: string | null
  total_commandes: number
  created_at: string
}

export type Commande = {
  id: string
  numero: string
  client_id: string
  variante_id: string
  quantite: number
  montant: number
  statut: 'nouvelle' | 'confirmee' | 'expediee' | 'livree' | 'annulee'
  wilaya_livraison: string
  adresse_livraison: string
  notes: string | null
  message_cadeau: string | null
  fbclid: string | null
  utm_source: string | null
  utm_campaign: string | null
  utm_content: string | null
  created_at: string
  updated_at: string
  clients?: Client
  variantes?: Variante
}

export type PixelEvent = {
  id: string
  event_name: string
  commande_id: string | null
  fbclid: string | null
  event_data: Record<string, unknown> | null
  created_at: string
}

// Création du client navigateur (singleton pattern)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
