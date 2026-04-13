'use client'

// ============================================================
// app/admin/produits/page.tsx — Gestion stock + Catalogue
// Onglet Stock : boutons +/- par variante
// Onglet Catalogue : CRUD produits + variantes + images Cloudinary
// ============================================================

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Produit, Variante } from '@/lib/supabase'

// ── Types locaux ─────────────────────────────────────────────

type OngletProduits = 'stock' | 'catalogue'

type VarianteEnrichie = Variante & {
  produits?: { nom_fr: string }
}

type ProduitAvecVariantes = Produit & {
  variantes: Variante[]
}

type FormProduit = {
  slug: string
  nom_fr: string
  nom_ar: string
  description_fr: string
  description_ar: string
  prix: string
}

type FormVariante = {
  couleur_fr: string
  couleur_ar: string
  couleur_hex: string
  stock: string
  images: string[]
}

const FORM_PRODUIT_VIDE: FormProduit = {
  slug: '', nom_fr: '', nom_ar: '', description_fr: '', description_ar: '', prix: '2500',
}

const FORM_VARIANTE_VIDE: FormVariante = {
  couleur_fr: '', couleur_ar: '', couleur_hex: '#000000', stock: '50', images: [''],
}

// ── Styles partagés ──────────────────────────────────────────

const labelSt: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontSize: '9.5px',
  fontWeight: 500,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--ch-gris-texte)',
  marginBottom: '6px',
}

const inputSt: React.CSSProperties = {
  width: '100%',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  fontWeight: 300,
  color: 'var(--ch-noir)',
  background: 'var(--ch-blanc)',
  border: 'var(--ch-border)',
  borderRadius: '4px',
  padding: '9px 10px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const btnOrSt: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  background: 'var(--ch-or)',
  color: 'var(--ch-noir)',
  border: 'none',
  borderRadius: '4px',
  padding: '9px 18px',
  cursor: 'pointer',
  transition: 'background 0.15s',
  whiteSpace: 'nowrap' as const,
}

const btnOutlineSt: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  background: 'transparent',
  color: 'var(--ch-gris-texte)',
  border: '0.5px solid var(--ch-gris-clair)',
  borderRadius: '4px',
  padding: '9px 16px',
  cursor: 'pointer',
  transition: 'border-color 0.15s, color 0.15s',
  whiteSpace: 'nowrap' as const,
}

const btnDangerSt: React.CSSProperties = {
  ...btnOutlineSt,
  color: 'var(--ch-danger)',
  border: '0.5px solid rgba(139,50,50,0.35)',
}

// ── Composant principal ──────────────────────────────────────

export default function ProduitsAdminPage() {
  const [onglet, setOnglet] = useState<OngletProduits>('stock')

  return (
    <div style={{ padding: '40px', maxWidth: '1000px' }}>
      {/* En-tête + toggle onglets */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '36px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            fontWeight: 300,
            color: 'var(--ch-noir)',
            letterSpacing: '0.02em',
            margin: 0,
          }}
        >
          Produits
        </h1>

        {/* Onglets */}
        <div
          style={{
            display: 'flex',
            gap: '2px',
            background: 'var(--ch-beige)',
            border: 'var(--ch-border)',
            borderRadius: '6px',
            padding: '3px',
          }}
        >
          {(['stock', 'catalogue'] as OngletProduits[]).map((o) => (
            <button
              key={o}
              onClick={() => setOnglet(o)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '7px 18px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                background: onglet === o ? 'var(--ch-noir)' : 'transparent',
                color: onglet === o ? 'var(--ch-or)' : 'var(--ch-gris-texte)',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {o === 'stock' ? 'Stock' : 'Catalogue'}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu selon onglet actif */}
      {onglet === 'stock' ? <OngletStock /> : <OngletCatalogue />}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// ONGLET STOCK — Interface +/- existante
// ════════════════════════════════════════════════════════════

function OngletStock() {
  const [variantes, setVariantes]     = useState<VarianteEnrichie[]>([])
  const [chargement, setChargement]   = useState(true)
  const [majEnCours, setMajEnCours]   = useState<string | null>(null)
  const [erreur, setErreur]           = useState<string | null>(null)
  const [succes, setSucces]           = useState<string | null>(null)
  // Valeurs temporaires des inputs directs (édition libre du stock)
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({})

  async function charger() {
    const supabase = createClient()
    const { data } = await supabase
      .from('variantes')
      .select('*, produits(nom_fr)')
      .order('couleur_fr')
    setVariantes((data as VarianteEnrichie[]) || [])
    setChargement(false)
  }

  useEffect(() => { charger() }, [])

  function afficherSucces(msg: string) {
    setSucces(msg)
    setTimeout(() => setSucces(null), 3000)
  }

  // Sauvegarde via l'API (service role, bypass RLS)
  async function sauvegarderStock(varianteId: string, nouveauStock: number) {
    if (majEnCours) return
    setMajEnCours(varianteId)
    setErreur(null)

    const res  = await fetch(`/api/variantes/${varianteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: nouveauStock }),
    })
    const json = await res.json()

    if (!json.success) {
      setErreur(json.error || 'Erreur lors de la mise à jour du stock')
    } else {
      afficherSucces('Stock mis à jour.')
    }
    await charger()
    setMajEnCours(null)
  }

  async function ajusterStock(variante: VarianteEnrichie, delta: number) {
    const nouveauStock = Math.max(0, variante.stock + delta)
    await sauvegarderStock(variante.id, nouveauStock)
  }

  async function validerInputStock(variante: VarianteEnrichie) {
    const valeur = stockInputs[variante.id]
    if (valeur === undefined) return
    const nouveauStock = Math.max(0, parseInt(valeur, 10) || 0)
    setStockInputs((prev) => { const n = { ...prev }; delete n[variante.id]; return n })
    await sauvegarderStock(variante.id, nouveauStock)
  }

  if (chargement) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2].map((i) => (
          <div key={i} style={{ height: '80px', background: 'var(--ch-beige)', borderRadius: '4px', border: 'var(--ch-border)' }} />
        ))}
      </div>
    )
  }

  if (variantes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--ch-gris-texte)', fontFamily: 'var(--font-body)', fontSize: '14px', border: 'var(--ch-border)', borderRadius: '4px', background: 'var(--ch-beige)' }}>
        Aucune variante. Créez d&apos;abord un produit dans l&apos;onglet Catalogue.
      </div>
    )
  }

  return (
    <>
      {/* Bannières erreur / succès */}
      {erreur && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'var(--ch-danger-bg)', border: '1px solid rgba(139,50,50,0.3)', borderRadius: '4px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ch-danger)' }}>
          {erreur}
        </div>
      )}
      {succes && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', background: 'var(--ch-succes-bg)', border: '1px solid rgba(58,107,54,0.3)', borderRadius: '4px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ch-succes)' }}>
          {succes}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {variantes.map((v) => {
          const stockFaible = v.stock < 10
          const stockVide   = v.stock === 0
          return (
            <div
              key={v.id}
              style={{
                background: 'var(--ch-blanc)',
                border: stockFaible ? `1.5px solid var(--ch-danger)` : 'var(--ch-border)',
                borderRadius: '4px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Identité coloris */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: v.couleur_hex || '#000',
                    border: 'var(--ch-border)',
                    flexShrink: 0,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                  }}
                />
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 500, color: 'var(--ch-noir)', marginBottom: '2px' }}>
                    {v.produits?.nom_fr || 'Produit'} — {v.couleur_fr}
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--ch-gris-texte)' }}>
                    {v.couleur_ar}
                    {v.couleur_hex && (
                      <span style={{ marginLeft: '8px', opacity: 0.6 }}>{v.couleur_hex}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Contrôles stock */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {stockVide ? (
                  <span className="badge badge-danger">Rupture</span>
                ) : stockFaible ? (
                  <span className="badge badge-warning">Stock faible</span>
                ) : (
                  <span className="badge badge-succes">En stock</span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                  <button
                    onClick={() => ajusterStock(v, -1)}
                    disabled={majEnCours === v.id || v.stock === 0}
                    style={{
                      width: '36px',
                      height: '36px',
                      border: 'var(--ch-border)',
                      borderRight: 'none',
                      borderRadius: '4px 0 0 4px',
                      background: 'var(--ch-beige)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '20px',
                      fontWeight: 300,
                      color: 'var(--ch-noir)',
                      cursor: v.stock === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: v.stock === 0 ? 0.35 : 1,
                      transition: 'background 0.1s',
                    }}
                  >
                    −
                  </button>

                  {/* Input direct : taper un nombre puis Enter ou Tab pour valider */}
                  <input
                    type="number"
                    min={0}
                    disabled={majEnCours === v.id}
                    value={majEnCours === v.id ? '…' : (stockInputs[v.id] !== undefined ? stockInputs[v.id] : String(v.stock))}
                    onChange={(e) => setStockInputs((prev) => ({ ...prev, [v.id]: e.target.value }))}
                    onBlur={() => validerInputStock(v)}
                    onKeyDown={(e) => { if (e.key === 'Enter') validerInputStock(v) }}
                    style={{
                      width: '64px',
                      height: '36px',
                      border: 'var(--ch-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-body)',
                      fontSize: '16px',
                      fontWeight: 500,
                      color: stockFaible ? 'var(--ch-danger)' : 'var(--ch-noir)',
                      background: 'var(--ch-blanc)',
                      textAlign: 'center',
                      outline: 'none',
                      padding: '0 4px',
                      boxSizing: 'border-box',
                    }}
                  />

                  <button
                    onClick={() => ajusterStock(v, 1)}
                    disabled={majEnCours === v.id}
                    style={{
                      width: '36px',
                      height: '36px',
                      border: 'var(--ch-border)',
                      borderLeft: 'none',
                      borderRadius: '0 4px 4px 0',
                      background: 'var(--ch-beige)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '20px',
                      fontWeight: 300,
                      color: 'var(--ch-noir)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.1s',
                    }}
                  >
                    +
                  </button>
                </div>

                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '10px',
                    color: 'var(--ch-gris-texte)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  unités
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          color: 'var(--ch-gris-texte)',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: 'var(--ch-border)',
        }}
      >
        Le stock se décrémente automatiquement à chaque nouvelle commande. Bordure rouge = stock {'<'} 10 unités.
      </p>
    </>
  )
}

// ════════════════════════════════════════════════════════════
// ONGLET CATALOGUE — CRUD produits + variantes + images
// ════════════════════════════════════════════════════════════

function OngletCatalogue() {
  const [produits, setProduits]     = useState<ProduitAvecVariantes[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur]         = useState<string | null>(null)
  const [succes, setSucces]         = useState<string | null>(null)

  // États d'édition produit
  const [formProduitOuvert, setFormProduitOuvert]         = useState(false)
  const [formProduit, setFormProduit]                     = useState<FormProduit>(FORM_PRODUIT_VIDE)
  const [produitEdite, setProduitEdite]                   = useState<string | null>(null)
  const [enregistrementProduit, setEnregistrementProduit] = useState(false)

  // États d'édition variante
  const [formVariante, setFormVariante]                     = useState<FormVariante>(FORM_VARIANTE_VIDE)
  const [varianteEditee, setVarianteEditee]                 = useState<{ produitId: string; varianteId: string | null } | null>(null)
  const [enregistrementVariante, setEnregistrementVariante] = useState(false)

  // Accordion
  const [produitExpande, setProduitExpande] = useState<string | null>(null)

  // ── Chargement ───────────────────────────────────────────

  async function charger() {
    setChargement(true)
    setErreur(null)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('produits')
      .select('*, variantes(*)')
      .order('created_at', { ascending: true })

    if (error) setErreur('Erreur chargement produits')
    else setProduits((data as ProduitAvecVariantes[]) || [])
    setChargement(false)
  }

  useEffect(() => { charger() }, [])

  function afficherSucces(msg: string) {
    setSucces(msg)
    setTimeout(() => setSucces(null), 3000)
  }

  // ── Actions produit ──────────────────────────────────────

  function ouvrirNouveauProduit() {
    setFormProduit(FORM_PRODUIT_VIDE)
    setProduitEdite(null)
    setFormProduitOuvert(true)
    setVarianteEditee(null)
  }

  function ouvrirEditionProduit(p: ProduitAvecVariantes) {
    setFormProduit({
      slug: p.slug,
      nom_fr: p.nom_fr,
      nom_ar: p.nom_ar,
      description_fr: p.description_fr || '',
      description_ar: p.description_ar || '',
      prix: String(p.prix),
    })
    setProduitEdite(p.id)
    setFormProduitOuvert(true)
    setProduitExpande(p.id)
    setVarianteEditee(null)
  }

  async function sauvegarderProduit() {
    setEnregistrementProduit(true)
    setErreur(null)

    const payload = {
      slug: formProduit.slug.trim(),
      nom_fr: formProduit.nom_fr.trim(),
      nom_ar: formProduit.nom_ar.trim(),
      description_fr: formProduit.description_fr.trim() || null,
      description_ar: formProduit.description_ar.trim() || null,
      prix: parseInt(formProduit.prix, 10) || 2500,
    }

    const url    = produitEdite ? `/api/produits/${produitEdite}` : '/api/produits'
    const method = produitEdite ? 'PATCH' : 'POST'

    const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const json = await res.json()

    if (!json.success) {
      setErreur(json.error || 'Erreur')
    } else {
      setFormProduitOuvert(false)
      setProduitEdite(null)
      afficherSucces(produitEdite ? 'Produit modifié.' : 'Produit créé.')
      await charger()
    }
    setEnregistrementProduit(false)
  }

  async function desactiverProduit(id: string, actif: boolean) {
    const res  = await fetch(`/api/produits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actif: !actif }),
    })
    const json = await res.json()
    if (!json.success) setErreur(json.error || 'Erreur')
    else { afficherSucces(actif ? 'Produit désactivé.' : 'Produit réactivé.'); await charger() }
  }

  // ── Actions variante ─────────────────────────────────────

  function ouvrirNouvelleVariante(produitId: string) {
    setFormVariante(FORM_VARIANTE_VIDE)
    setVarianteEditee({ produitId, varianteId: null })
    setFormProduitOuvert(false)
    setProduitExpande(produitId)
  }

  function ouvrirEditionVariante(produitId: string, v: Variante) {
    setFormVariante({
      couleur_fr: v.couleur_fr,
      couleur_ar: v.couleur_ar,
      couleur_hex: v.couleur_hex || '#000000',
      stock: String(v.stock),
      images: v.images.length > 0 ? [...v.images, ''] : [''],
    })
    setVarianteEditee({ produitId, varianteId: v.id })
    setFormProduitOuvert(false)
    setProduitExpande(produitId)
  }

  function annulerVariante() {
    setVarianteEditee(null)
    setFormVariante(FORM_VARIANTE_VIDE)
  }

  async function sauvegarderVariante() {
    if (!varianteEditee) return
    setEnregistrementVariante(true)
    setErreur(null)

    const imagesNettoyees = formVariante.images.filter((u) => u.trim().startsWith('http'))

    const payload = {
      produit_id: varianteEditee.produitId,
      couleur_fr: formVariante.couleur_fr.trim(),
      couleur_ar: formVariante.couleur_ar.trim(),
      couleur_hex: formVariante.couleur_hex || null,
      stock: parseInt(formVariante.stock, 10) || 0,
      images: imagesNettoyees,
    }

    const url    = varianteEditee.varianteId ? `/api/variantes/${varianteEditee.varianteId}` : '/api/variantes'
    const method = varianteEditee.varianteId ? 'PATCH' : 'POST'

    const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const json = await res.json()

    if (!json.success) {
      setErreur(json.error || 'Erreur')
    } else {
      setVarianteEditee(null)
      setFormVariante(FORM_VARIANTE_VIDE)
      afficherSucces(varianteEditee.varianteId ? 'Coloris modifié.' : 'Coloris ajouté.')
      await charger()
    }
    setEnregistrementVariante(false)
  }

  async function supprimerVariante(id: string) {
    if (!confirm('Supprimer ce coloris ? Cette action est irréversible.')) return
    setErreur(null)
    const res  = await fetch(`/api/variantes/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!json.success) setErreur(json.error || 'Erreur suppression')
    else { afficherSucces('Coloris supprimé.'); await charger() }
  }

  // ── Gestion images ──────────────────────────────────────

  function ajouterImage() {
    setFormVariante((prev) => ({ ...prev, images: [...prev.images, ''] }))
  }

  function modifierImage(index: number, valeur: string) {
    setFormVariante((prev) => {
      const imgs = [...prev.images]
      imgs[index] = valeur
      return { ...prev, images: imgs }
    })
  }

  function supprimerImage(index: number) {
    setFormVariante((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  // ── Rendu ─────────────────────────────────────────────────

  if (chargement) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: '72px', background: 'var(--ch-beige)', borderRadius: '4px', border: 'var(--ch-border)' }} />
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Barre d'actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button onClick={ouvrirNouveauProduit} style={btnOrSt}>
          + Nouveau produit
        </button>
      </div>

      {/* Notification succès */}
      {succes && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--ch-succes-bg)',
            border: '0.5px solid var(--ch-succes)',
            borderRadius: '4px',
            padding: '10px 16px',
            marginBottom: '16px',
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--ch-succes)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M4.5 7l2 2 3-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {succes}
        </div>
      )}

      {/* Notification erreur */}
      {erreur && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--ch-danger-bg)',
            border: '0.5px solid var(--ch-danger)',
            borderRadius: '4px',
            padding: '10px 16px',
            marginBottom: '16px',
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--ch-danger)',
          }}
        >
          <span>{erreur}</span>
          <button
            onClick={() => setErreur(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ch-danger)', fontWeight: 700, fontSize: '16px', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Formulaire création / édition produit */}
      {formProduitOuvert && (
        <div
          style={{
            background: 'var(--ch-beige)',
            border: '0.5px solid var(--ch-or)',
            borderRadius: '4px',
            padding: '24px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--ch-or-dark)',
                margin: 0,
              }}
            >
              {produitEdite ? 'Modifier le produit' : 'Nouveau produit'}
            </h3>
            <button
              onClick={() => { setFormProduitOuvert(false); setProduitEdite(null) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ch-gris-texte)', fontSize: '18px', lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelSt}>Slug (URL)</label>
              <input
                style={inputSt}
                value={formProduit.slug}
                onChange={(e) => setFormProduit((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                placeholder="sac-ch-signature"
              />
            </div>
            <div>
              <label style={labelSt}>Prix (DA)</label>
              <input
                style={inputSt}
                type="number"
                value={formProduit.prix}
                onChange={(e) => setFormProduit((p) => ({ ...p, prix: e.target.value }))}
                placeholder="2500"
                min="0"
              />
            </div>
            <div>
              <label style={labelSt}>Nom français</label>
              <input
                style={inputSt}
                value={formProduit.nom_fr}
                onChange={(e) => setFormProduit((p) => ({ ...p, nom_fr: e.target.value }))}
                placeholder="Sac CH Signature"
              />
            </div>
            <div>
              <label style={labelSt}>Nom arabe</label>
              <input
                style={{ ...inputSt, direction: 'rtl' }}
                value={formProduit.nom_ar}
                onChange={(e) => setFormProduit((p) => ({ ...p, nom_ar: e.target.value }))}
                placeholder="حقيبة CH سيغنتشر"
              />
            </div>
            <div>
              <label style={labelSt}>Description FR</label>
              <textarea
                style={{ ...inputSt, resize: 'vertical', minHeight: '72px' }}
                value={formProduit.description_fr}
                onChange={(e) => setFormProduit((p) => ({ ...p, description_fr: e.target.value }))}
              />
            </div>
            <div>
              <label style={labelSt}>Description AR</label>
              <textarea
                style={{ ...inputSt, resize: 'vertical', minHeight: '72px', direction: 'rtl' }}
                value={formProduit.description_ar}
                onChange={(e) => setFormProduit((p) => ({ ...p, description_ar: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={sauvegarderProduit}
              disabled={enregistrementProduit}
              style={{ ...btnOrSt, opacity: enregistrementProduit ? 0.6 : 1 }}
            >
              {enregistrementProduit ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button onClick={() => { setFormProduitOuvert(false); setProduitEdite(null) }} style={btnOutlineSt}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des produits */}
      {produits.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            color: 'var(--ch-gris-texte)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            border: 'var(--ch-border)',
            borderRadius: '4px',
            background: 'var(--ch-beige)',
          }}
        >
          Aucun produit. Cliquez sur{' '}
          <strong style={{ color: 'var(--ch-noir)' }}>+ Nouveau produit</strong> pour commencer.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {produits.map((p, pIdx) => {
            const expande = produitExpande === p.id

            return (
              <div
                key={p.id}
                style={{
                  background: 'var(--ch-blanc)',
                  border: 'var(--ch-border)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.15s',
                }}
              >
                {/* En-tête accordéon */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    gap: '12px',
                    userSelect: 'none',
                    background: expande ? 'var(--ch-beige)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onClick={() => setProduitExpande(expande ? null : p.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    {/* Numéro + flèche */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '9px',
                          fontWeight: 500,
                          color: 'var(--ch-gris-clair)',
                          letterSpacing: '0.08em',
                          minWidth: '20px',
                        }}
                      >
                        {String(pIdx + 1).padStart(2, '0')}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          color: 'var(--ch-gris-texte)',
                          transition: 'transform 0.15s',
                          transform: expande ? 'rotate(90deg)' : 'rotate(0deg)',
                          display: 'inline-block',
                        }}
                      >
                        ▶
                      </span>
                    </div>

                    {/* Info produit */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <p
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: 'var(--ch-noir)',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {p.nom_fr}
                        </p>
                        <span className={p.actif ? 'badge badge-succes' : 'badge badge-danger'}>
                          {p.actif ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11px',
                          color: 'var(--ch-gris-texte)',
                          margin: '2px 0 0',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {p.prix.toLocaleString('fr-DZ')} DA
                        <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
                        /{p.slug}
                        <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
                        {p.variantes?.length || 0} coloris
                      </p>
                    </div>
                  </div>

                  {/* Actions produit */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button onClick={() => ouvrirEditionProduit(p)} style={btnOutlineSt}>
                      Modifier
                    </button>
                    <button
                      onClick={() => desactiverProduit(p.id, p.actif)}
                      style={{
                        ...btnOutlineSt,
                        color: p.actif ? 'var(--ch-danger)' : 'var(--ch-succes)',
                        borderColor: p.actif ? 'rgba(139,50,50,0.3)' : 'rgba(58,107,54,0.3)',
                      }}
                    >
                      {p.actif ? 'Désactiver' : 'Réactiver'}
                    </button>
                  </div>
                </div>

                {/* Détail expandé */}
                {expande && (
                  <div style={{ borderTop: 'var(--ch-border)', background: 'var(--ch-beige)', padding: '20px' }}>
                    {/* En-tête coloris */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <p style={{ ...labelSt, marginBottom: 0 }}>
                        Coloris ({p.variantes?.length || 0})
                      </p>
                    </div>

                    {(!p.variantes || p.variantes.length === 0) && (
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '12px',
                          color: 'var(--ch-gris-texte)',
                          marginBottom: '16px',
                          padding: '12px',
                          background: 'var(--ch-blanc)',
                          border: 'var(--ch-border)',
                          borderRadius: '4px',
                          textAlign: 'center',
                        }}
                      >
                        Aucun coloris. Ajoutez le premier ci-dessous.
                      </p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                      {(p.variantes || []).map((v) => {
                        const enEdition = varianteEditee?.varianteId === v.id

                        return (
                          <div key={v.id}>
                            {/* Ligne variante */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'var(--ch-blanc)',
                                border: enEdition ? '0.5px solid var(--ch-or)' : 'var(--ch-border)',
                                borderRadius: '4px',
                                padding: '12px 16px',
                                gap: '12px',
                                transition: 'border-color 0.15s',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                                {/* Dot couleur */}
                                <div
                                  style={{
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '50%',
                                    background: v.couleur_hex || '#000',
                                    border: 'var(--ch-border)',
                                    flexShrink: 0,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                  }}
                                />
                                <div style={{ minWidth: 0 }}>
                                  <p
                                    style={{
                                      fontFamily: 'var(--font-body)',
                                      fontSize: '13px',
                                      fontWeight: 500,
                                      color: 'var(--ch-noir)',
                                      margin: 0,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {v.couleur_fr}
                                    <span style={{ fontWeight: 300, color: 'var(--ch-gris-texte)', marginLeft: '8px' }}>
                                      {v.couleur_ar}
                                    </span>
                                  </p>
                                  <p
                                    style={{
                                      fontFamily: 'var(--font-body)',
                                      fontSize: '11px',
                                      color: 'var(--ch-gris-texte)',
                                      margin: '2px 0 0',
                                    }}
                                  >
                                    {v.images.length} image{v.images.length !== 1 ? 's' : ''}
                                    <span style={{ margin: '0 5px', opacity: 0.4 }}>·</span>
                                    Stock : {v.stock}
                                    {v.couleur_hex && (
                                      <>
                                        <span style={{ margin: '0 5px', opacity: 0.4 }}>·</span>
                                        {v.couleur_hex}
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>

                              {/* Miniatures images */}
                              {v.images.length > 0 && (
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flexShrink: 0 }}>
                                  {v.images.slice(0, 4).map((url, idx) => (
                                    <img
                                      key={idx}
                                      src={url}
                                      alt=""
                                      width={36}
                                      height={36}
                                      style={{
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                        border: 'var(--ch-border)',
                                      }}
                                    />
                                  ))}
                                  {v.images.length > 4 && (
                                    <div
                                      style={{
                                        width: '36px',
                                        height: '36px',
                                        background: 'var(--ch-beige)',
                                        borderRadius: '4px',
                                        border: 'var(--ch-border)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontFamily: 'var(--font-body)',
                                        fontSize: '10px',
                                        color: 'var(--ch-gris-texte)',
                                      }}
                                    >
                                      +{v.images.length - 4}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Actions variante */}
                              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                <button
                                  onClick={() => enEdition ? annulerVariante() : ouvrirEditionVariante(p.id, v)}
                                  style={btnOutlineSt}
                                >
                                  {enEdition ? 'Fermer' : 'Modifier'}
                                </button>
                                <button
                                  onClick={() => supprimerVariante(v.id)}
                                  style={{ ...btnDangerSt, padding: '9px 12px' }}
                                >
                                  ×
                                </button>
                              </div>
                            </div>

                            {/* Formulaire édition variante inline */}
                            {enEdition && (
                              <FormVarianteInline
                                form={formVariante}
                                onChange={setFormVariante}
                                onAjouterImage={ajouterImage}
                                onModifierImage={modifierImage}
                                onSupprimerImage={supprimerImage}
                                onSauvegarder={sauvegarderVariante}
                                onAnnuler={annulerVariante}
                                enregistrement={enregistrementVariante}
                                titre="Modifier le coloris"
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Formulaire nouvelle variante */}
                    {varianteEditee?.produitId === p.id && varianteEditee?.varianteId === null && (
                      <FormVarianteInline
                        form={formVariante}
                        onChange={setFormVariante}
                        onAjouterImage={ajouterImage}
                        onModifierImage={modifierImage}
                        onSupprimerImage={supprimerImage}
                        onSauvegarder={sauvegarderVariante}
                        onAnnuler={annulerVariante}
                        enregistrement={enregistrementVariante}
                        titre="Nouveau coloris"
                      />
                    )}

                    {/* Bouton ajouter variante */}
                    {!(varianteEditee?.produitId === p.id && varianteEditee?.varianteId === null) && (
                      <button
                        onClick={() => ouvrirNouvelleVariante(p.id)}
                        style={{
                          ...btnOutlineSt,
                          width: '100%',
                          textAlign: 'center',
                          justifyContent: 'center',
                          display: 'flex',
                          marginTop: '4px',
                        }}
                      >
                        + Ajouter un coloris
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// FORMULAIRE VARIANTE INLINE — réutilisé pour créer + modifier
// ════════════════════════════════════════════════════════════

type FormVarianteInlineProps = {
  form: FormVariante
  onChange: React.Dispatch<React.SetStateAction<FormVariante>>
  onAjouterImage: () => void
  onModifierImage: (index: number, valeur: string) => void
  onSupprimerImage: (index: number) => void
  onSauvegarder: () => void
  onAnnuler: () => void
  enregistrement: boolean
  titre: string
}

function FormVarianteInline({
  form, onChange, onAjouterImage, onModifierImage, onSupprimerImage,
  onSauvegarder, onAnnuler, enregistrement, titre,
}: FormVarianteInlineProps) {
  const inputSt: React.CSSProperties = {
    width: '100%',
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    fontWeight: 300,
    color: 'var(--ch-noir)',
    background: 'var(--ch-blanc)',
    border: 'var(--ch-border)',
    borderRadius: '4px',
    padding: '9px 10px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelSt: React.CSSProperties = {
    display: 'block',
    fontFamily: 'var(--font-body)',
    fontSize: '9.5px',
    fontWeight: 500,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--ch-gris-texte)',
    marginBottom: '6px',
  }

  return (
    <div
      style={{
        background: 'var(--ch-blanc)',
        border: '0.5px solid var(--ch-or)',
        borderRadius: '4px',
        padding: '20px',
        marginTop: '8px',
      }}
    >
      {/* En-tête formulaire */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ch-or-dark)',
            margin: 0,
          }}
        >
          {titre}
        </p>
        <button
          onClick={onAnnuler}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ch-gris-texte)', fontSize: '18px', lineHeight: 1 }}
        >
          ×
        </button>
      </div>

      {/* Champs couleur */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <div>
          <label style={labelSt}>Couleur (FR)</label>
          <input
            style={inputSt}
            value={form.couleur_fr}
            onChange={(e) => onChange((p) => ({ ...p, couleur_fr: e.target.value }))}
            placeholder="Noir"
          />
        </div>
        <div>
          <label style={labelSt}>اللون (AR)</label>
          <input
            style={{ ...inputSt, direction: 'rtl' }}
            value={form.couleur_ar}
            onChange={(e) => onChange((p) => ({ ...p, couleur_ar: e.target.value }))}
            placeholder="أسود"
          />
        </div>

        {/* Color picker hex */}
        <div>
          <label style={labelSt}>Couleur hex</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={form.couleur_hex}
              onChange={(e) => onChange((p) => ({ ...p, couleur_hex: e.target.value }))}
              style={{
                width: '40px',
                height: '38px',
                border: 'var(--ch-border)',
                borderRadius: '4px',
                cursor: 'pointer',
                padding: '2px',
                background: 'var(--ch-blanc)',
                flexShrink: 0,
              }}
            />
            <input
              style={{ ...inputSt, flex: 1 }}
              value={form.couleur_hex}
              onChange={(e) => onChange((p) => ({ ...p, couleur_hex: e.target.value }))}
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Stock */}
        <div>
          <label style={labelSt}>Stock initial</label>
          <input
            style={inputSt}
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => onChange((p) => ({ ...p, stock: e.target.value }))}
            placeholder="50"
          />
        </div>
      </div>

      {/* Images Cloudinary */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ ...labelSt, marginBottom: 0 }}>
            Images Cloudinary
          </label>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              color: 'var(--ch-gris-texte)',
            }}
          >
            {form.images.filter((u) => u.trim().startsWith('http')).length} valide{form.images.filter((u) => u.trim().startsWith('http')).length !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {form.images.map((url, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Miniature ou placeholder */}
              {url.startsWith('http') ? (
                <img
                  src={url}
                  alt=""
                  width={40}
                  height={40}
                  style={{
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: 'var(--ch-border)',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'var(--ch-beige)',
                    borderRadius: '4px',
                    border: 'var(--ch-border)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="1" width="12" height="12" rx="1" stroke="var(--ch-gris-clair)" strokeWidth="1"/>
                    <path d="M1 9l3-3 3 3 2-2 3 3" stroke="var(--ch-gris-clair)" strokeWidth="1" strokeLinejoin="round"/>
                    <circle cx="10" cy="4" r="1.2" fill="var(--ch-gris-clair)"/>
                  </svg>
                </div>
              )}
              <input
                style={{ ...inputSt, flex: 1 }}
                value={url}
                onChange={(e) => onModifierImage(idx, e.target.value)}
                placeholder="https://res.cloudinary.com/..."
              />
              <button
                onClick={() => onSupprimerImage(idx)}
                style={{
                  width: '38px',
                  height: '38px',
                  background: 'transparent',
                  border: '0.5px solid rgba(139,50,50,0.3)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: 'var(--ch-danger)',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={onAjouterImage}
          style={{
            marginTop: '8px',
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background: 'transparent',
            color: 'var(--ch-gris-texte)',
            border: '0.5px dashed var(--ch-gris-clair)',
            borderRadius: '4px',
            padding: '8px 14px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          + Ajouter une image
        </button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: 'var(--ch-border)' }}>
        <button
          onClick={onSauvegarder}
          disabled={enregistrement}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            background: 'var(--ch-or)',
            color: 'var(--ch-noir)',
            border: 'none',
            borderRadius: '4px',
            padding: '9px 18px',
            cursor: 'pointer',
            opacity: enregistrement ? 0.6 : 1,
          }}
        >
          {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button onClick={onAnnuler} style={{
          fontFamily: 'var(--font-body)',
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          background: 'transparent',
          color: 'var(--ch-gris-texte)',
          border: '0.5px solid var(--ch-gris-clair)',
          borderRadius: '4px',
          padding: '9px 16px',
          cursor: 'pointer',
        }}>
          Annuler
        </button>
      </div>
    </div>
  )
}
