// ============================================================
// app/api/variantes/[id]/route.ts — PATCH : modifier une variante
//                                   DELETE : supprimer une variante
// Vérifie l'absence de commandes actives avant suppression
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

type Params = { params: { id: string } }

// ── PATCH — Modifier une variante ───────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = params

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Corps JSON invalide' }, { status: 400 })
  }

  const champs: Record<string, unknown> = {}
  if (typeof body.couleur_fr === 'string' && body.couleur_fr.trim()) champs.couleur_fr = body.couleur_fr.trim()
  if (typeof body.couleur_ar === 'string' && body.couleur_ar.trim()) champs.couleur_ar = body.couleur_ar.trim()
  if (typeof body.couleur_hex === 'string') champs.couleur_hex = body.couleur_hex || null
  if (typeof body.stock === 'number' && body.stock >= 0) champs.stock = Math.floor(body.stock)

  // Validation des URLs images (Cloudinary)
  if (Array.isArray(body.images)) {
    champs.images = (body.images as unknown[]).filter(
      (u): u is string => typeof u === 'string' && u.startsWith('http')
    )
  }

  if (Object.keys(champs).length === 0) {
    return NextResponse.json({ success: false, error: 'Aucun champ valide à modifier' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('variantes')
    .update(champs)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[API Variantes PATCH] Erreur:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la modification' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

// ── DELETE — Supprimer une variante ─────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = params
  const supabase = createAdminClient()

  // Vérifier l'absence de commandes actives référençant cette variante
  const { count, error: errCheck } = await supabase
    .from('commandes')
    .select('*', { count: 'exact', head: true })
    .eq('variante_id', id)
    .in('statut', ['nouvelle', 'confirmee', 'expediee'])

  if (errCheck) {
    return NextResponse.json({ success: false, error: 'Erreur vérification commandes' }, { status: 500 })
  }

  if (count && count > 0) {
    return NextResponse.json(
      { success: false, error: `Impossible de supprimer : ${count} commande(s) active(s) référencent ce coloris.` },
      { status: 409 }
    )
  }

  const { error } = await supabase
    .from('variantes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[API Variantes DELETE] Erreur:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la suppression' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
