// ============================================================
// app/api/produits/[id]/route.ts — PATCH : modifier un produit
//                                  DELETE : désactiver un produit
// Utilisé par l'onglet Catalogue de l'admin
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

type Params = { params: { id: string } }

// ── PATCH — Modifier les infos d'un produit ──────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = params

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Corps JSON invalide' }, { status: 400 })
  }

  // Champs autorisés à la modification
  const champs: Record<string, unknown> = {}
  if (typeof body.nom_fr === 'string' && body.nom_fr.trim()) champs.nom_fr = body.nom_fr.trim()
  if (typeof body.nom_ar === 'string' && body.nom_ar.trim()) champs.nom_ar = body.nom_ar.trim()
  if (typeof body.description_fr === 'string') champs.description_fr = body.description_fr.trim() || null
  if (typeof body.description_ar === 'string') champs.description_ar = body.description_ar.trim() || null
  if (typeof body.prix === 'number' && body.prix > 0) champs.prix = body.prix
  if (typeof body.actif === 'boolean') champs.actif = body.actif
  if (typeof body.slug === 'string' && /^[a-z0-9-]+$/.test(body.slug)) champs.slug = body.slug

  if (Object.keys(champs).length === 0) {
    return NextResponse.json({ success: false, error: 'Aucun champ valide à modifier' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('produits')
    .update(champs)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[API Produits PATCH] Erreur:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la modification' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

// ── DELETE — Désactiver un produit (soft delete) ─────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = params
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('produits')
    .update({ actif: false })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[API Produits DELETE] Erreur:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de la désactivation' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
