// ============================================================
// app/(legal)/conditions-generales/page.tsx
// Obligatoire pour les publicités Meta (produits physiques)
// ============================================================

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions générales de vente — CH Accessoires',
  description: "Conditions générales de vente de CH Accessoires : livraison, paiement à la livraison, politique de vérification à réception.",
  robots: { index: true, follow: false },
}

const TITRE_ST = {
  fontFamily: 'var(--font-display)',
  fontSize: '22px',
  fontWeight: 400,
  color: 'var(--ch-noir)',
  letterSpacing: '0.02em',
  marginTop: '40px',
  marginBottom: '14px',
} as React.CSSProperties

const CORPS_ST = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  fontWeight: 300,
  color: 'var(--ch-gris-texte)',
  lineHeight: 1.8,
  marginBottom: '14px',
} as React.CSSProperties

const LISTE_ST = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  fontWeight: 300,
  color: 'var(--ch-gris-texte)',
  lineHeight: 1.8,
  paddingLeft: '20px',
  marginBottom: '14px',
} as React.CSSProperties

const ENCADRE_ST = {
  background: 'var(--ch-beige)',
  border: 'var(--ch-border)',
  borderLeft: '3px solid var(--ch-or)',
  padding: '16px 20px',
  marginBottom: '20px',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  fontWeight: 400,
  color: 'var(--ch-noir)',
  lineHeight: 1.7,
} as React.CSSProperties

export default function ConditionsGenerales() {
  return (
    <>
      {/* En-tête */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--ch-or)', marginBottom: '12px' }}>
        Mentions légales
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 300, color: 'var(--ch-noir)', letterSpacing: '0.02em', marginBottom: '8px' }}>
        Conditions générales de vente
      </h1>
      <p style={{ ...CORPS_ST, marginBottom: '32px' }}>
        Dernière mise à jour : janvier 2025
      </p>
      <div style={{ width: '40px', height: '0.5px', background: 'var(--ch-or)', marginBottom: '40px' }} />

      <p style={CORPS_ST}>
        Les présentes conditions générales de vente s'appliquent à toutes les commandes passées sur le site <strong>ch-accessoires.com</strong> exploité par CH Accessoires.
      </p>

      <h2 style={TITRE_ST}>1. Produits</h2>
      <p style={CORPS_ST}>
        CH Accessoires commercialise des sacs et accessoires de mode premium fabriqués avec des matériaux sélectionnés. Les produits présentés sont disponibles dans la limite des stocks disponibles, indiqués sur chaque page produit.
      </p>
      <p style={CORPS_ST}>
        Les photographies et descriptions ont pour vocation d'illustrer au mieux les articles. Des légères variations de couleur peuvent exister selon les paramètres d'affichage de votre écran.
      </p>

      <h2 style={TITRE_ST}>2. Prix</h2>
      <p style={CORPS_ST}>
        Les prix sont affichés en <strong>Dinars Algériens (DA)</strong>, toutes taxes comprises. CH Accessoires se réserve le droit de modifier ses prix à tout moment. Le prix appliqué est celui en vigueur au moment de la validation de la commande.
      </p>

      <h2 style={TITRE_ST}>3. Commande</h2>
      <p style={CORPS_ST}>
        La commande est effectuée en remplissant le formulaire en ligne. Elle est validée après confirmation téléphonique de notre équipe. Nous nous réservons le droit de refuser toute commande en cas de stock épuisé, d'informations incorrectes ou de suspicion de fraude.
      </p>
      <p style={CORPS_ST}>
        Un numéro de commande unique vous est attribué à la validation, servant de référence pour tout suivi.
      </p>

      <h2 style={TITRE_ST}>4. Paiement</h2>
      <div style={ENCADRE_ST}>
        💳 CH Accessoires fonctionne exclusivement en <strong>paiement à la livraison (COD)</strong>. Aucun paiement en ligne n'est requis ni accepté. Vous payez le livreur en espèces uniquement à la réception de votre colis.
      </div>

      <h2 style={TITRE_ST}>5. Livraison</h2>
      <p style={CORPS_ST}>
        Nous livrons dans les <strong>58 wilayas d'Algérie</strong> via nos partenaires de livraison. Les délais indicatifs sont :
      </p>
      <ul style={LISTE_ST}>
        <li>Alger et communes limitrophes : 24 à 48 heures</li>
        <li>Grandes villes (Oran, Constantine, Annaba, Blida…) : 48 à 72 heures</li>
        <li>Autres wilayas : 3 à 5 jours ouvrables</li>
      </ul>
      <p style={CORPS_ST}>
        Ces délais sont donnés à titre indicatif et peuvent varier selon les conditions de transport et la localisation. CH Accessoires ne peut être tenu responsable des retards indépendants de sa volonté.
      </p>

      <h2 style={TITRE_ST}>6. Réception et vérification</h2>
      <div style={ENCADRE_ST}>
        📦 <strong>Important :</strong> À la réception de votre colis, vous avez le droit de <strong>vérifier le contenu en présence du livreur</strong> avant de payer. Si le produit ne correspond pas à votre commande ou est endommagé, vous pouvez refuser la livraison sans frais.
      </div>
      <p style={CORPS_ST}>
        Une fois le colis accepté et le paiement effectué, la vente est considérée comme définitive. Nous n'acceptons pas les retours après réception, c'est pourquoi nous vous encourageons à inspecter soigneusement votre commande à la livraison.
      </p>

      <h2 style={TITRE_ST}>7. Annulation</h2>
      <p style={CORPS_ST}>
        Vous pouvez annuler votre commande avant expédition en nous contactant via WhatsApp. Après expédition, l'annulation n'est plus possible, mais vous pouvez refuser le colis à la livraison.
      </p>
      <p style={CORPS_ST}>
        Toute commande annulée de façon répétée ou commande dont la livraison est refusée sans motif valable pourra entraîner un blocage des commandes futures depuis le même numéro de téléphone.
      </p>

      <h2 style={TITRE_ST}>8. Garantie qualité</h2>
      <p style={CORPS_ST}>
        CH Accessoires garantit la conformité de ses produits avec les descriptions présentées sur le site. En cas de défaut de fabrication constaté à la livraison, contactez-nous immédiatement via WhatsApp avec une photo du produit.
      </p>

      <h2 style={TITRE_ST}>9. Propriété intellectuelle</h2>
      <p style={CORPS_ST}>
        L'ensemble des contenus du site (textes, images, logo, design) sont la propriété exclusive de CH Accessoires et sont protégés. Toute reproduction sans autorisation est interdite.
      </p>

      <h2 style={TITRE_ST}>10. Contact</h2>
      <p style={CORPS_ST}>
        Pour toute question ou réclamation, contactez notre service client via le bouton WhatsApp disponible sur notre site, disponible 7j/7.
      </p>
    </>
  )
}
