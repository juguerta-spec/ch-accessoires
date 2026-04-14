// ============================================================
// app/produits/[slug]/page.tsx — Landing page haute conversion
// Ordre des sections immuable selon CLAUDE.md
// ============================================================

import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase-admin'
import type { Produit, Variante } from '@/lib/supabase'
import LandingPageClient from './LandingPageClient'

type Props = {
  params: { slug: string }
}

// Récupération des données produit côté serveur
async function getProduit(slug: string): Promise<Produit | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('produits')
    .select('*, variantes(*)')
    .eq('slug', slug)
    .eq('actif', true)
    .single()

  if (error || !data) return null
  return data as Produit
}

// Métadonnées SEO dynamiques
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const produit = await getProduit(params.slug)
  if (!produit) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ch-accessoires.com'

  return {
    title: `${produit.nom_fr} — 2 500 DA | Livraison dans toute l'Algérie`,
    description:
      `Découvrez le ${produit.nom_fr}, qualité premium à 2 500 DA. Livraison rapide dans toute l'Algérie. Commande en ligne, paiement à la livraison.`,
    openGraph: {
      title: `${produit.nom_fr} — CH Accessoires`,
      description: produit.description_fr || '',
      url: `${siteUrl}/produits/${params.slug}`,
      type: 'website',
      locale: 'fr_DZ',
    },
    robots: { index: true, follow: true },
  }
}

export default async function ProduitPage({ params }: Props) {
  const produit = await getProduit(params.slug)
  const supabase = createAdminClient()

  if (!produit || !produit.variantes || produit.variantes.length === 0) {
    notFound()
  }

  // Nombre de commandes non-annulées aujourd'hui (base 12 ajoutée pour la preuve sociale)
  const debutJour = new Date()
  debutJour.setHours(0, 0, 0, 0)
  const { count } = await supabase
    .from('commandes')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', debutJour.toISOString())
    .not('statut', 'eq', 'annulee')

  const commandesToday = (count || 0) + 12

  // Lecture du cookie A/B assigné par le middleware
  const cookieStore = cookies()
  const abRaw = cookieStore.get('ch_ab')?.value
  const abVariant: 'A' | 'B' = abRaw === 'B' ? 'B' : 'A'

  return (
    <LandingPageClient
      produit={produit}
      variantes={produit.variantes as Variante[]}
      commandesToday={commandesToday}
      abVariant={abVariant}
    />
  )
}
