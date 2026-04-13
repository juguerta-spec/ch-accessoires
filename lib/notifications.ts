// ============================================================
// lib/notifications.ts — Notifications admin à chaque nouvelle commande
//
// Deux canaux supportés (configurables via .env) :
//   1. CallMeBot WhatsApp — gratuit, setup en 2 min
//      → CALLMEBOT_API_KEY + ADMIN_WHATSAPP_NUMBER
//   2. Email via Resend  — free tier 3 000 emails/mois
//      → RESEND_API_KEY + ADMIN_EMAIL
//
// Les deux peuvent être actifs simultanément.
// Si aucune variable n'est configurée, les notifications sont silencieusement ignorées.
// ============================================================

type InfoCommande = {
  numero:    string
  client:    string
  telephone: string
  wilaya:    string
  coloris:   string
  montant:   number
  quantite:  number
}

// ── Notification WhatsApp via CallMeBot (gratuit) ────────────
// Setup : envoyer "I allow callmebot to send me messages" au +34 644 97 44 10
// sur WhatsApp → vous recevez votre apikey
async function notifierWhatsAppAdmin(commande: InfoCommande): Promise<void> {
  const apiKey = process.env.CALLMEBOT_API_KEY
  const phone  = process.env.ADMIN_WHATSAPP_NUMBER

  if (!apiKey || !phone) return

  const texte = [
    `🛍️ NOUVELLE COMMANDE — CH Accessoires`,
    ``,
    `📦 N° ${commande.numero}`,
    `👤 ${commande.client} — ${commande.telephone}`,
    `📍 ${commande.wilaya}`,
    `🎨 ${commande.coloris} × ${commande.quantite}`,
    `💰 ${commande.montant.toLocaleString('fr-DZ')} DA`,
    ``,
    `👉 Confirmez sur admin.ch-accessoires.com`,
  ].join('\n')

  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(texte)}&apikey=${apiKey}`

  const res = await fetch(url, { method: 'GET' })
  if (!res.ok) {
    console.error('[Notifications] Erreur CallMeBot:', res.status, await res.text())
  }
}

// ── Notification email via Resend ────────────────────────────
// Setup : créer un compte sur resend.com → obtenir RESEND_API_KEY (free)
async function notifierEmailAdmin(commande: InfoCommande): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const email  = process.env.ADMIN_EMAIL

  if (!apiKey || !email) return

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#C9A84C;font-size:20px;margin-bottom:4px">CH Accessoires</h2>
      <p style="color:#6B6660;font-size:12px;margin-bottom:24px;text-transform:uppercase;letter-spacing:0.1em">Nouvelle commande</p>

      <div style="background:#F0EDE8;padding:20px;margin-bottom:20px">
        <p style="font-size:22px;font-weight:600;color:#0A0A0A;margin:0">N° ${commande.numero}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px 0;color:#6B6660;width:120px">Client</td><td style="padding:8px 0;color:#0A0A0A;font-weight:500">${commande.client}</td></tr>
        <tr><td style="padding:8px 0;color:#6B6660">Téléphone</td><td style="padding:8px 0;color:#0A0A0A">${commande.telephone}</td></tr>
        <tr><td style="padding:8px 0;color:#6B6660">Wilaya</td><td style="padding:8px 0;color:#0A0A0A">${commande.wilaya}</td></tr>
        <tr><td style="padding:8px 0;color:#6B6660">Coloris</td><td style="padding:8px 0;color:#0A0A0A">${commande.coloris}</td></tr>
        <tr><td style="padding:8px 0;color:#6B6660">Quantité</td><td style="padding:8px 0;color:#0A0A0A">${commande.quantite}</td></tr>
        <tr><td style="padding:8px 0;color:#6B6660;font-weight:600">Montant</td><td style="padding:8px 0;color:#C9A84C;font-size:18px;font-weight:700">${commande.montant.toLocaleString('fr-DZ')} DA</td></tr>
      </table>

      <div style="margin-top:28px;text-align:center">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://ch-accessoires.com'}/admin/commandes"
           style="background:#C9A84C;color:#0A0A0A;padding:12px 28px;text-decoration:none;font-weight:600;font-size:13px;display:inline-block">
          Voir dans l'admin →
        </a>
      </div>

      <p style="color:#C8C4BC;font-size:11px;margin-top:32px;text-align:center">CH Accessoires — Notification automatique</p>
    </div>
  `

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'CH Accessoires <commandes@ch-accessoires.com>',
      to:   [email],
      subject: `🛍️ Nouvelle commande ${commande.numero} — ${commande.client}`,
      html,
    }),
  }).catch((err) => console.error('[Notifications] Erreur Resend:', err))
}

// ── Export principal ─────────────────────────────────────────
export async function envoyerNotificationAdmin(commande: InfoCommande): Promise<void> {
  // Exécution en parallèle, aucun canal ne bloque l'autre
  await Promise.allSettled([
    notifierWhatsAppAdmin(commande),
    notifierEmailAdmin(commande),
  ])
}
