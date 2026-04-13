// ============================================================
// lib/meta-conversions-api.ts — Meta Conversions API (CAPI) server-side
// Appelé depuis les API routes après création de commande
// Le téléphone est hashé en SHA-256 avant envoi à Meta
// ============================================================

import { createHash } from 'crypto'

type ConversionEventParams = {
  eventName: string        // 'Purchase', 'ViewContent', etc.
  phone: string            // Numéro brut (sera hashé)
  fbclid?: string          // Click ID Facebook depuis l'URL
  eventId: string          // Même ID que côté client pour déduplication
  orderId?: string         // Numéro de commande (CH100001, etc.)
  value?: number           // Montant en DA
  eventSourceUrl: string   // URL de la page où l'événement s'est produit
}

type CAPIResponse = {
  success: boolean
  events_received?: number
  error?: string
}

// Hache une chaîne en SHA-256 (requis par Meta pour les données personnelles)
function sha256(valeur: string): string {
  return createHash('sha256')
    .update(valeur.trim().toLowerCase())
    .digest('hex')
}

// Formate le téléphone algérien pour Meta (E.164 : +213XXXXXXXXX)
function formaterTelephone(telephone: string): string {
  // Supprime espaces et tirets
  const propre = telephone.replace(/[\s-]/g, '')
  // 0XXXXXXXXX → 213XXXXXXXXX
  if (propre.startsWith('0')) {
    return '213' + propre.slice(1)
  }
  return propre
}

export async function sendConversionEvent(
  params: ConversionEventParams
): Promise<CAPIResponse> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN
  const testEventCode = process.env.META_TEST_EVENT_CODE

  if (!pixelId || !accessToken) {
    console.error('[CAPI] Variables d\'environnement META manquantes')
    return { success: false, error: 'Configuration CAPI manquante' }
  }

  // Construction du payload Meta CAPI
  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: params.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId,
        event_source_url: params.eventSourceUrl,
        action_source: 'website',
        user_data: {
          // Téléphone hashé SHA-256 (obligatoire pour le matching)
          ph: [sha256(formaterTelephone(params.phone))],
          // fbclid pour le matching si disponible
          ...(params.fbclid ? { fbc: `fb.1.${Date.now()}.${params.fbclid}` } : {}),
        },
        // Données de la commande
        ...(params.value !== undefined || params.orderId
          ? {
              custom_data: {
                ...(params.value !== undefined
                  ? { value: params.value, currency: 'DZD' }
                  : {}),
                ...(params.orderId ? { order_id: params.orderId } : {}),
              },
            }
          : {}),
      },
    ],
    // Code de test pour valider les événements en développement
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`

    const reponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const json = await reponse.json()

    if (!reponse.ok) {
      console.error('[CAPI] Erreur Meta:', json)
      return { success: false, error: JSON.stringify(json) }
    }

    return {
      success: true,
      events_received: json.events_received,
    }
  } catch (erreur) {
    console.error('[CAPI] Erreur réseau:', erreur)
    return { success: false, error: 'Erreur réseau CAPI' }
  }
}
