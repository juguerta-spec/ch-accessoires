'use client'

// ============================================================
// lib/meta-pixel.ts — Fonctions Meta Pixel côté client
// Chaque fonction accepte un eventId pour la déduplication CAPI
// ============================================================

// Extension du type window pour TypeScript
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
  }
}

// Vérifie que fbq est disponible avant d'appeler
function fbq(...args: unknown[]) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq(...args)
  }
}

// PageView — déclenché automatiquement dans layout.tsx via le snippet
export function trackPageView() {
  fbq('track', 'PageView')
}

// ViewContent — affichage de la landing page produit
export function trackViewContent(params: {
  eventId: string
  produitId: string
  nomProduit: string
  prix: number
}) {
  fbq('track', 'ViewContent', {
    content_ids: [params.produitId],
    content_name: params.nomProduit,
    content_type: 'product',
    value: params.prix,
    currency: 'DZD',
  }, {
    eventID: params.eventId,
  })
}

// AddToCart — scroll jusqu'au formulaire (IntersectionObserver dans page.tsx)
export function trackAddToCart(params: {
  eventId: string
  varianteId: string
  nomProduit: string
  prix: number
}) {
  fbq('track', 'AddToCart', {
    content_ids: [params.varianteId],
    content_name: params.nomProduit,
    content_type: 'product',
    value: params.prix,
    currency: 'DZD',
  }, {
    eventID: params.eventId,
  })
}

// InitiateCheckout — focus premier champ du formulaire COD
export function trackInitiateCheckout(params: {
  eventId: string
  prix: number
}) {
  fbq('track', 'InitiateCheckout', {
    value: params.prix,
    currency: 'DZD',
    num_items: 1,
  }, {
    eventID: params.eventId,
  })
}

// Lead — commande COD soumise (pas encore confirmée ni payée)
// Utilisé côté client pour déduplication avec le CAPI Lead server-side
// Le vrai "Purchase" Meta est déclenché uniquement côté CAPI quand l'admin confirme
export function trackLead(params: {
  eventId: string
  commandeNumero: string
  montant: number
  quantite: number
  varianteId: string
}) {
  fbq('track', 'Lead', {
    content_ids: [params.varianteId],
    content_type: 'product',
    value: params.montant,
    currency: 'DZD',
    num_items: params.quantite,
    order_id: params.commandeNumero,
  }, {
    eventID: params.eventId,
  })
}

// Purchase — conservé pour usage futur éventuel côté client
export function trackPurchase(params: {
  eventId: string
  commandeNumero: string
  montant: number
  quantite: number
  varianteId: string
}) {
  fbq('track', 'Purchase', {
    content_ids: [params.varianteId],
    content_type: 'product',
    value: params.montant,
    currency: 'DZD',
    num_items: params.quantite,
    order_id: params.commandeNumero,
  }, {
    eventID: params.eventId,
  })
}

// Génère un eventId unique pour la déduplication client/serveur
export function genererEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
