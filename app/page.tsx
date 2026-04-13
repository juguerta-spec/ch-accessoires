// ============================================================
// app/page.tsx — Page d'accueil CH Accessoires
// Fetch des produits actifs côté serveur → HomeClient
// ============================================================

import { createAdminClient } from '@/lib/supabase-admin'
import type { Produit, Variante } from '@/lib/supabase'
import type { Metadata } from 'next'
import HomeClient from './HomeClient'

export const metadata: Metadata = {
  title: 'CH Accessoires — Sacs premium pour femme | Algérie',
  description:
    "Découvrez la collection CH Accessoires : sacs haut de gamme accessibles, livrés dans toute l'Algérie. Paiement à la livraison.",
  openGraph: {
    title: 'CH Accessoires — Collection 2025',
    description: "Sacs premium · Livraison nationale · Paiement à la livraison",
    type: 'website',
    locale: 'fr_DZ',
  },
}

type ProduitAvecVariantes = Produit & { variantes: Variante[] }

// Récupère tous les produits actifs avec leurs variantes
async function getProduits(): Promise<ProduitAvecVariantes[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('produits')
    .select('*, variantes(*)')
    .eq('actif', true)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[Page accueil] Erreur fetch produits:', error)
    return []
  }

  return (data as ProduitAvecVariantes[]) || []
}

export default async function PageAccueil() {
  const produits = await getProduits()
  return <HomeClient produits={produits} />
}
