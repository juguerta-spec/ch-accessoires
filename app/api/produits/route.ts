// ============================================================
// app/api/produits/route.ts — GET  : liste des produits actifs avec variantes
//                              POST : créer un nouveau produit
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

// ── POST — Créer un nouveau produit ─────────────────────────
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Corps JSON invalide' }, { status: 400 })
  }

  const { slug, nom_fr, nom_ar, description_fr, description_ar, prix } = body

  // Validation slug : lowercase, chiffres, tirets uniquement
  if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ success: false, error: 'Slug invalide (minuscules, chiffres et tirets uniquement)' }, { status: 400 })
  }
  if (!nom_fr || typeof nom_fr !== 'string' || !nom_fr.trim()) {
    return NextResponse.json({ success: false, error: 'nom_fr requis' }, { status: 400 })
  }
  if (!nom_ar || typeof nom_ar !== 'string' || !nom_ar.trim()) {
    return NextResponse.json({ success: false, error: 'nom_ar requis' }, { status: 400 })
  }
  if (typeof prix !== 'number' || prix <= 0) {
    return NextResponse.json({ success: false, error: 'Prix invalide' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('produits')
    .insert({
      slug,
      nom_fr: (nom_fr as string).trim(),
      nom_ar: (nom_ar as string).trim(),
      description_fr: typeof description_fr === 'string' ? description_fr.trim() || null : null,
      description_ar: typeof description_ar === 'string' ? description_ar.trim() || null : null,
      prix,
      actif: true,
    })
    .select()
    .single()

  if (error) {
    console.error('[API Produits POST] Erreur:', error)
    const msg = error.code === '23505' ? 'Ce slug existe déjà' : 'Erreur lors de la création'
    return NextResponse.json({ success: false, error: msg }, { status: error.code === '23505' ? 409 : 500 })
  }

  return NextResponse.json({ success: true, data }, { status: 201 })
}

// ── GET — Liste des produits actifs avec variantes ──────────
export async function GET() {
  const supabase = createAdminClient()

  const { data: produits, error } = await supabase
    .from('produits')
    .select(`
      *,
      variantes(*)
    `)
    .eq('actif', true)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[API Produits] Erreur lecture:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lecture produits' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, data: produits })
}
