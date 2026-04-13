// ============================================================
// app/api/variantes/route.ts — POST : créer une variante
// Associe un coloris à un produit existant
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

// ── POST — Créer une nouvelle variante ───────────────────────
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Corps JSON invalide' }, { status: 400 })
  }

  const { produit_id, couleur_fr, couleur_ar, couleur_hex, stock, images } = body

  // Validation des champs obligatoires
  if (!produit_id || typeof produit_id !== 'string') {
    return NextResponse.json({ success: false, error: 'produit_id requis' }, { status: 400 })
  }
  if (!couleur_fr || typeof couleur_fr !== 'string' || !couleur_fr.trim()) {
    return NextResponse.json({ success: false, error: 'couleur_fr requis' }, { status: 400 })
  }
  if (!couleur_ar || typeof couleur_ar !== 'string' || !couleur_ar.trim()) {
    return NextResponse.json({ success: false, error: 'couleur_ar requis' }, { status: 400 })
  }

  // Validation du tableau d'images (URLs Cloudinary)
  const imagesValidees: string[] = Array.isArray(images)
    ? (images as unknown[]).filter((u): u is string => typeof u === 'string' && u.startsWith('http'))
    : []

  const supabase = createAdminClient()

  // Vérifier que le produit existe
  const { data: produit, error: errProduit } = await supabase
    .from('produits')
    .select('id')
    .eq('id', produit_id)
    .single()

  if (errProduit || !produit) {
    return NextResponse.json({ success: false, error: 'Produit introuvable' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('variantes')
    .insert({
      produit_id,
      couleur_fr: (couleur_fr as string).trim(),
      couleur_ar: (couleur_ar as string).trim(),
      couleur_hex: typeof couleur_hex === 'string' && couleur_hex ? couleur_hex : null,
      stock: typeof stock === 'number' && stock >= 0 ? Math.floor(stock) : 0,
      images: imagesValidees,
    })
    .select()
    .single()

  if (error) {
    console.error('[API Variantes POST] Erreur:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la création' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data }, { status: 201 })
}
