// ============================================================
// app/api/pixel/conversions/route.ts — POST : envoi événement Meta CAPI
// Reçoit les données depuis le client, hache le téléphone, appelle Meta CAPI
// Enregistre l'événement dans la table pixel_events
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { sendConversionEvent } from '@/lib/meta-conversions-api'

type ConversionsBody = {
  event_name: string
  commande_id?: string
  fbclid?: string
  phone: string
  event_id: string
  event_source_url: string
  value?: number
  order_id?: string
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()

  let body: ConversionsBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Corps de requête invalide' },
      { status: 400 }
    )
  }

  if (!body.event_name || !body.phone || !body.event_id) {
    return NextResponse.json(
      { success: false, error: 'event_name, phone et event_id sont obligatoires' },
      { status: 400 }
    )
  }

  // Envoi à Meta CAPI
  const capiResponse = await sendConversionEvent({
    eventName: body.event_name,
    phone: body.phone,
    fbclid: body.fbclid,
    eventId: body.event_id,
    orderId: body.order_id,
    value: body.value,
    eventSourceUrl: body.event_source_url,
  })

  // Enregistrement dans pixel_events pour traçabilité
  const { error: errLog } = await supabase
    .from('pixel_events')
    .insert({
      event_name: body.event_name,
      commande_id: body.commande_id || null,
      fbclid: body.fbclid || null,
      event_data: {
        event_id: body.event_id,
        phone_hash: '[redacted]', // Ne pas stocker le téléphone en clair
        value: body.value,
        order_id: body.order_id,
        capi_response: capiResponse,
      },
    })

  if (errLog) {
    // Non bloquant
    console.error('[CAPI Route] Erreur log pixel_events:', errLog)
  }

  return NextResponse.json({
    success: capiResponse.success,
    capi_response: capiResponse,
  })
}
