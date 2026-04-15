// ============================================================
// lib/whatsapp-client.ts — Notification WhatsApp automatique au CLIENT
//
// Utilise Meta WhatsApp Cloud API (gratuit)
// Documentation : https://developers.facebook.com/docs/whatsapp/cloud-api
//
// Variables d'environnement requises :
//   WHATSAPP_API_TOKEN     → Token permanent Meta (System User)
//   WHATSAPP_PHONE_ID      → ID du numéro WhatsApp Business (Meta)
//   WHATSAPP_TEMPLATE_NAME → Nom du template approuvé (défaut: "confirmation_commande")
//
// Template à soumettre à Meta pour approbation :
// ──────────────────────────────────────────────────────────────
// Nom    : confirmation_commande
// Langue : fr (+ variante ar si besoin)
// Corps  :
//   Bonjour {{1}} 👋
//   Votre commande CH Accessoires N°{{2}} a bien été reçue !
//   🎁 Livraison offerte · Paiement à la réception
//   Notre équipe vous contactera sous 24h pour confirmer.
//   Merci pour votre confiance 🙏
// ──────────────────────────────────────────────────────────────
// Note : Les messages initiaux vers de nouveaux contacts DOIVENT utiliser
// un template approuvé. Les réponses libres sont possibles dans les 24h
// après un message du client (session ouverte).
// ============================================================

type ParamsWhatsAppClient = {
  telephone:  string   // format algérien : 05XXXXXXXX
  prenom:     string
  numero:     string   // numéro de commande ex: CH123456
}

// Convertit un numéro algérien local en format international E.164
function normaliserTelephone(tel: string): string {
  const propre = tel.replace(/\s/g, '')
  // 05XXXXXXXX → 213 5XXXXXXXX
  if (propre.startsWith('0') && propre.length === 10) {
    return `213${propre.slice(1)}`
  }
  // Déjà au format international
  if (propre.startsWith('213')) return propre
  return propre
}

export async function envoyerWhatsAppClient(params: ParamsWhatsAppClient): Promise<void> {
  const token        = process.env.WHATSAPP_API_TOKEN
  const phoneId      = process.env.WHATSAPP_PHONE_ID
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'confirmation_commande'

  // Si les variables ne sont pas configurées, on skip silencieusement
  if (!token || !phoneId) {
    console.log('[WhatsApp Client] Variables non configurées — notification ignorée')
    return
  }

  const destinataire = normaliserTelephone(params.telephone)

  const payload = {
    messaging_product: 'whatsapp',
    to: destinataire,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'fr' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: params.prenom },   // {{1}} — prénom du client
            { type: 'text', text: params.numero },   // {{2}} — numéro commande
          ],
        },
      ],
    },
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    )

    if (!res.ok) {
      const erreur = await res.text()
      console.error('[WhatsApp Client] Erreur API Meta:', res.status, erreur)
    } else {
      console.log(`[WhatsApp Client] Message envoyé → ${destinataire} (commande ${params.numero})`)
    }
  } catch (err) {
    // Non bloquant — la commande est créée même si WA échoue
    console.error('[WhatsApp Client] Erreur réseau:', err)
  }
}
