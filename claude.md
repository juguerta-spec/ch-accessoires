# CLAUDE.md — CH Accessoires

## Contexte projet

E-commerce algérien pour la marque **CH Accessoires**, spécialisée dans les sacs haut de gamme accessibles.
Tout le code doit être commenté en français. Priorité absolue : performance mobile et taux de conversion.

---

## Business

- **Marque** : CH Accessoires
- **Domaine** : ch-accessoires.com
- **Produit au lancement** : 1 modèle de sac, 2 coloris (Noir #1a1a1a, Caramel #C19A6B)
- **Prix** : 2500 DA fixe
- **Paiement** : Cash on Delivery (COD) uniquement — aucun paiement en ligne
- **Cible** : Femmes 18-45 ans + Hommes qui offrent un cadeau
- **Marché** : Algérie (toutes wilayas)
- **Trafic** : Facebook Ads → landing page produit (mobile-first)
- **Langues** : Français + Arabe (bilingue, toggle FR/AR, RTL auto en arabe)

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + CSS variables custom (voir charte) |
| Base de données | Supabase (PostgreSQL) |
| Auth admin | Supabase Auth (email/password) |
| Images | Cloudinary (URLs externes, pas d'upload dans le code) |
| Hébergement | Vercel |
| Tracking | Meta Pixel (client-side) + Meta Conversions API (server-side) |

---

## Structure des fichiers

```
ch-accessoires/
├── app/
│   ├── layout.tsx                        # Layout global + MetaPixel init + fonts
│   ├── page.tsx                          # Redirect → /produits/sac-ch-signature
│   ├── produits/
│   │   └── [slug]/page.tsx              # Landing page haute conversion
│   ├── commande/
│   │   └── confirmation/page.tsx        # Page confirmation post-commande
│   ├── admin/
│   │   ├── layout.tsx                   # Auth guard admin
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── commandes/page.tsx
│   │   ├── commandes/[id]/page.tsx
│   │   ├── clients/page.tsx
│   │   └── produits/page.tsx
│   └── api/
│       ├── commandes/route.ts
│       ├── commandes/[id]/route.ts
│       ├── produits/route.ts
│       └── pixel/conversions/route.ts
├── components/
│   ├── store/
│   │   ├── HeroSection.tsx
│   │   ├── ProductGallery.tsx
│   │   ├── ColorSelector.tsx
│   │   ├── OrderForm.tsx
│   │   ├── SocialProof.tsx
│   │   ├── UrgencyBanner.tsx
│   │   ├── WhyChooseUs.tsx
│   │   ├── GiftSection.tsx
│   │   └── LanguageToggle.tsx
│   └── admin/
│       ├── StatsCards.tsx
│       ├── OrderPipeline.tsx
│       ├── OrderTable.tsx
│       ├── ClientCard.tsx
│       └── StockManager.tsx
├── lib/
│   ├── supabase.ts
│   ├── supabase-admin.ts
│   ├── meta-pixel.ts
│   ├── meta-conversions-api.ts
│   └── wilayas.ts
├── hooks/
│   └── useLanguage.tsx
├── middleware.ts
├── styles/
│   └── globals.css                      # Variables CSS charte + reset
├── supabase/
│   ├── schema.sql
│   └── seed.sql
└── .env.local.example
```

---

## Schéma base de données

```sql
create table produits (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nom_fr text not null,
  nom_ar text not null,
  description_fr text,
  description_ar text,
  prix integer not null default 2500,
  actif boolean default true,
  created_at timestamptz default now()
);

create table variantes (
  id uuid primary key default gen_random_uuid(),
  produit_id uuid references produits(id),
  couleur_fr text not null,
  couleur_ar text not null,
  couleur_hex text,
  stock integer default 50,
  images text[] default '{}'
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  prenom text not null,
  telephone text not null,
  wilaya text not null,
  adresse text,
  total_commandes integer default 0,
  created_at timestamptz default now()
);

create table commandes (
  id uuid primary key default gen_random_uuid(),
  numero text unique not null,
  client_id uuid references clients(id),
  variante_id uuid references variantes(id),
  quantite integer default 1,
  montant integer not null,
  statut text default 'nouvelle'
    check (statut in ('nouvelle','confirmee','expediee','livree','annulee')),
  wilaya_livraison text not null,
  adresse_livraison text not null,
  notes text,
  message_cadeau text,
  fbclid text,
  utm_source text,
  utm_campaign text,
  utm_content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table pixel_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  commande_id uuid references commandes(id),
  fbclid text,
  event_data jsonb,
  created_at timestamptz default now()
);
```

---

## Variables d'environnement

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_META_PIXEL_ID=
META_CAPI_ACCESS_TOKEN=
META_TEST_EVENT_CODE=
NEXT_PUBLIC_SITE_URL=https://ch-accessoires.com
NEXT_PUBLIC_WHATSAPP_NUMBER=213XXXXXXXXX
```

---

## ════════════════════════════════════════════
## CHARTE GRAPHIQUE — SOURCE DE VÉRITÉ ABSOLUE
## ════════════════════════════════════════════

### Direction artistique

**Luxe minimaliste angulaire** — inspiré de Celine, The Row, Saint Laurent Paris.
La marque doit sembler premium et aspirationnelle. Le prix abordable est rendu
crédible par la rigueur visuelle, jamais malgré elle. Zéro ornement superflu.
Aucun gradient. Aucun shadow. Élévation uniquement par contraste de couleur.

---

### Palette de couleurs — globals.css

```css
:root {
  /* Couleurs principales */
  --ch-noir:        #0A0A0A;   /* Fond dark, textes forts, fond logo, urgency bar */
  --ch-blanc:       #FAFAF7;   /* Fond page, cartes produit, confirmation */
  --ch-or:          #C9A84C;   /* CTA principal, prix accent, sélection active */
  --ch-or-clair:    #E8D49A;   /* Hover bouton or, badges or clairs */
  --ch-or-dark:     #8B6F2E;   /* Texte sur fond or-clair, liens prix */

  /* Neutres */
  --ch-beige:       #F0EDE8;   /* Sections alternées (WhyChooseUs, GiftSection, FAQ, OrderForm) */
  --ch-gris-clair:  #C8C4BC;   /* Borders, séparateurs, input underline */
  --ch-gris-texte:  #6B6660;   /* Corps texte secondaire, labels formulaire, auteurs avis */

  /* Statuts CRM — admin uniquement */
  --ch-succes:      #3A6B36;
  --ch-succes-bg:   #EDF2EC;
  --ch-danger:      #8B3232;
  --ch-danger-bg:   #F5EAEA;
  --ch-warning:     #8B6F2E;
  --ch-warning-bg:  #F5EDD4;
  --ch-info:        #1A4A8A;
  --ch-info-bg:     #E8EEF7;

  /* Espacement */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 40px;
  --space-6: 64px;
}
```

**Règles d'usage couleurs (non négociables) :**
- `--ch-or` = CTA principal UNIQUEMENT. Un seul bouton or visible par page. Jamais décoratif.
- `--ch-noir` = urgency bar, footer, header, fond logo dark.
- `--ch-blanc` = fond page, cartes produit.
- `--ch-beige` = sections alternées pour rythmer la page sans couleur.
- Jamais de `gradient`. Jamais de `box-shadow`. Jamais de couleur hardcodée dans les composants.
- Toujours `var(--ch-*)` dans le code — zéro hex direct dans les fichiers .tsx ou .css de composant.

---

### Typographie — layout.tsx

```typescript
// Import Next.js fonts dans layout.tsx
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
  display: 'swap',
})

// Appliquer sur <html> :
// className={`${cormorant.variable} ${dmSans.variable}`}
```

```css
/* Variables dans globals.css */
--font-display: var(--font-cormorant), 'Cormorant Garamond', serif;
--font-body:    var(--font-dm-sans), 'DM Sans', sans-serif;
```

**Hiérarchie typographique — storefront :**

| Usage | Font | Taille mobile | Taille desktop | Poids | Letter-spacing |
|---|---|---|---|---|---|
| H1 nom produit | Cormorant Garamond | 32px | 48px | 300 | 0.05em |
| H2 titre section | Cormorant Garamond | 24px | 32px | 400 | 0.03em |
| H3 sous-section | Cormorant Garamond | 19px | 22px | 600 | 0.02em |
| Corps de texte | DM Sans | 14px | 15px | 300 | normal |
| Label / bouton | DM Sans | 11px | 11px | 500 | 0.15em + uppercase |
| Prix principal | DM Sans | 24px | 30px | 500 | normal |
| Note secondaire | DM Sans | 12px | 12px | 300 | normal |
| Citation avis | Cormorant Garamond italic | 15px | 16px | 400 | 0.01em |
| Auteur avis | DM Sans | 10px | 10px | 500 | 0.12em + uppercase |

**Règles absolues typographie :**
- Jamais Inter, Roboto, Arial ou polices système sur le storefront.
- Cormorant = tout ce qui est émotionnel : titres, avis, nom produit, citations.
- DM Sans = tout ce qui est fonctionnel : formulaires, boutons, labels, prix, badges.
- Titres en sentence case. Labels en UPPERCASE. Jamais Title Case.
- Taille minimum : 11px. Jamais en dessous.

---

### Bordures & géométrie

```css
/* Règle des angles — ZÉRO exception sur le storefront */
border-radius: 0px;

/* Bordures standards */
--ch-border:      0.5px solid var(--ch-gris-clair);
--ch-border-or:   1.5px solid var(--ch-or);          /* Sélection active */
--ch-border-noir: 1.5px solid var(--ch-noir);         /* Bouton outline */
```

**Exceptions autorisées (et uniquement ces cas) :**
- `border-radius: 50%` — dots coloris dans ColorSelector uniquement.
- `border-radius: 4px` — interface admin CRM uniquement, jamais sur le storefront.

---

### Composants UI — spécifications exactes

#### Bouton CTA Principal — or (1 seul par page)
```css
background:      var(--ch-or);
color:           var(--ch-noir);
font-family:     var(--font-body);
font-size:       11px;
font-weight:     500;
letter-spacing:  0.15em;
text-transform:  uppercase;
padding:         16px 32px;
border:          none;
border-radius:   0;
width:           100%;
cursor:          pointer;
transition:      background 0.15s ease;

&:hover { background: var(--ch-or-clair); }
&:active { background: var(--ch-or-dark); color: var(--ch-blanc); }
```

#### Bouton Secondaire — fond noir
```css
background: var(--ch-noir);
color:      var(--ch-blanc);
/* Même typo/spacing/radius que CTA principal */
&:hover { background: #1f1f1f; }
```

#### Bouton Outline — bordure noire
```css
background:  transparent;
color:       var(--ch-noir);
border:      1.5px solid var(--ch-noir);
border-radius: 0;
/* Même typo/spacing */
&:hover { background: var(--ch-noir); color: var(--ch-blanc); }
```

#### Urgency Bar
```css
background:      var(--ch-noir);
color:           var(--ch-or);
font-family:     var(--font-body);
font-size:       10px;
font-weight:     500;
letter-spacing:  0.18em;
text-transform:  uppercase;
text-align:      center;
padding:         10px 16px;
position:        sticky;
top:             0;
z-index:         50;
```
Texte : `🚚 Livraison dans toute l'Algérie &nbsp;·&nbsp; ⚡ Stock limité`

#### Inputs formulaire COD
```css
/* Style underline — pas de box */
border:          none;
border-bottom:   1px solid var(--ch-gris-clair);
border-radius:   0;
padding:         12px 0;
font-family:     var(--font-body);
font-size:       14px;
font-weight:     300;
color:           var(--ch-noir);
background:      transparent;
width:           100%;
outline:         none;

&:focus { border-bottom-color: var(--ch-or); }
&::placeholder { color: var(--ch-gris-clair); font-weight: 300; }
```

Label au-dessus de chaque input :
```css
font-family:     var(--font-body);
font-size:       10px;
font-weight:     500;
letter-spacing:  0.12em;
text-transform:  uppercase;
color:           var(--ch-gris-texte);
margin-bottom:   6px;
display:         block;
```

#### Color Selector (dots coloris)
```css
.color-dot {
  width:        20px;
  height:       20px;
  border-radius: 50%;
  border:       2px solid transparent;
  cursor:       pointer;
  transition:   border-color 0.1s;
}
.color-dot.active {
  border-color:   var(--ch-or);
  outline:        2px solid var(--ch-blanc);
  outline-offset: -5px;
}
```

#### Badges
```css
/* Base commune */
font-family:    var(--font-body);
font-size:      10px;
font-weight:    500;
letter-spacing: 0.15em;
text-transform: uppercase;
padding:        3px 10px;
border-radius:  0;
display:        inline-block;

/* Variantes */
.badge-or      { background: var(--ch-or-clair);  color: var(--ch-or-dark); }
.badge-noir    { background: var(--ch-noir);        color: var(--ch-or); }
.badge-succes  { background: var(--ch-succes-bg);  color: var(--ch-succes); }
.badge-danger  { background: var(--ch-danger-bg);  color: var(--ch-danger); }
.badge-warning { background: var(--ch-warning-bg); color: var(--ch-warning); }
.badge-info    { background: var(--ch-info-bg);    color: var(--ch-info); }
```

#### Bloc Prix (landing page)
```css
/* Montant */
font-family: var(--font-body);
font-size:   28px;         /* 24px mobile */
font-weight: 500;
color:       var(--ch-noir);
line-height: 1;

/* Devise */
font-size:   16px;
font-weight: 300;
color:       var(--ch-gris-texte);
margin-left: 4px;

/* Sous-label */
font-size:      11px;
font-weight:    400;
letter-spacing: 0.12em;
text-transform: uppercase;
color:          var(--ch-gris-texte);
margin-top:     4px;
```

#### Avis clients
```css
/* Container */
border:     var(--ch-border);
padding:    16px;
background: var(--ch-blanc);

/* Étoiles */
color:      var(--ch-or);
font-size:  13px;
margin-bottom: 8px;

/* Citation */
font-family: var(--font-display);
font-size:   15px;
font-style:  italic;
font-weight: 400;
color:       var(--ch-noir);
line-height: 1.6;

/* Auteur */
font-family:    var(--font-body);
font-size:      10px;
font-weight:    500;
letter-spacing: 0.12em;
text-transform: uppercase;
color:          var(--ch-gris-texte);
margin-top:     10px;
```

---

### Logo — intégration

Structure : monogramme **CH** (Cormorant Garamond, 3× plus grand) + wordmark **ACCESSOIRES** (DM Sans uppercase, letter-spacing 0.25em, centré en dessous).

| Version | Contexte | Fond | Lettres |
|---|---|---|---|
| Dark (principal) | Header storefront, footer | `#0A0A0A` | `#C9A84C` |
| Light | Admin, emails, fond blanc | transparent | `#0A0A0A` |
| Monogramme | Favicon, icône app | `#0A0A0A` | `#C9A84C` |

Fichiers dans `/public/` : `logo-dark.svg`, `logo-light.svg`, `favicon.ico`, `icon.svg`

---

### Avis clients hardcodés (seed UI)

| Prénom | Wilaya | Note | Texte FR |
|---|---|---|---|
| Samira B. | Alger | ★★★★★ | "Qualité exceptionnelle, exactement comme sur les photos !" |
| Karim M. | Oran | ★★★★★ | "Cadeau parfait, ma femme a adoré. Livraison rapide." |
| Fatima Z. | Constantine | ★★★★★ | "Je l'utilise tous les jours, très solide et élégant." |
| Amira K. | Annaba | ★★★★☆ | "Très beau sac, je recommande vivement à toutes." |
| Yacine D. | Blida | ★★★★★ | "Commandé pour offrir, elle était ravie. Merci !" |
| Nadia H. | Sétif | ★★★★★ | "Le coloris caramel est magnifique en vrai. Superbe !" |

---

### Ton éditorial — copywriting

**On écrit :**
- "Qualité premium · 2 500 DA" — jamais "pas cher"
- "Livraison dans toute l'Algérie" — factuel et rassurant
- "Le cadeau qu'elle n'oubliera pas" — émotionnel, ciblage hommes
- "Stock limité — commandez vite" — urgence sobre
- "Satisfait ou remboursé" — garantie concrète

**On n'écrit jamais :**
- "Bon marché", "accessible", "pas cher" → perception cheap
- Points d'exclamation multiples → perd la crédibilité premium
- "Qualité garantie" sans détail → vide de sens
- "Meilleur prix garanti" → galvaudé

---

### Layout mobile — règles strictes

- **Breakpoint** : `768px` pour ajustements mobiles
- **Padding horizontal** : `16px` mobile / `24px` tablet
- **Max-width contenu** : `480px` mobile (centré) / `1200px` desktop
- **CTA** : toujours `width: 100%` sur mobile
- **Galerie produit** : ratio `3:4` (portrait), carousel touch natif
- **Espacement entre champs formulaire** : `24px` minimum
- **Taille police minimum** : `11px`

---

## Landing page produit — ordre des sections (IMMUABLE)

1. `<UrgencyBanner />` — sticky top, fond noir, texte or
2. `<ProductGallery />` — carousel swipeable, switch coloris
3. Bloc Prix + CTA or — bouton ancre `#order-form`
4. `<WhyChooseUs />` — 5 bullet points, fond `--ch-beige`
5. `<GiftSection />` — ciblage hommes, fond `--ch-beige` alterné
6. `<SocialProof />` — 6 avis, grille 2 colonnes mobile
7. FAQ accordéon — 5 Q/R, fond `--ch-blanc`
8. `<OrderForm id="order-form" />` — fond `--ch-beige`, formulaire COD complet
9. Footer — fond `--ch-noir`, texte `--ch-blanc` / `--ch-or`

---

## Formulaire COD — règles de validation

- Téléphone : regex `/^(05|06|07)[0-9]{8}$/`
- Wilaya : dropdown des 58 wilayas d'Algérie
- Quantité : 1 à 3 maximum
- Coloris : pré-rempli depuis le sélecteur produit
- Message cadeau : optionnel

---

## Meta Pixel — événements

| Événement | Déclencheur |
|---|---|
| PageView | Chargement de chaque page |
| ViewContent | Affichage landing page produit |
| AddToCart | Scroll jusqu'au formulaire (IntersectionObserver) |
| InitiateCheckout | Focus premier champ du formulaire |
| Purchase | Après confirmation commande réussie |

### Conversions API (server-side)
- Endpoint : `POST /api/pixel/conversions`
- Appelé depuis les API routes après création commande
- Envoyer : `Purchase` avec phone hashé sha256, fbclid, event_source_url
- URL CAPI : `https://graph.facebook.com/v19.0/{PIXEL_ID}/events`
- Déduplication : `event_id` identique côté client et serveur

---

## Backend Admin — specs par page

### /admin/dashboard
- Cards : commandes aujourd'hui / semaine / mois
- Revenus : commandes livrées uniquement
- Taux de livraison : livrées ÷ (livrées + annulées)
- Tableau des 5 dernières commandes avec badges statuts colorés
- Admin peut utiliser `border-radius: 4px` (exception charte)

### /admin/commandes
- Pipeline Kanban : Nouvelle → Confirmée → Expédiée → Livrée → Annulée
- Card : numéro, nom client, wilaya, coloris, date, montant
- Boutons changement statut + filtres wilaya/date + export CSV

### /admin/clients
- Tableau : nom, téléphone, wilaya, nb commandes, CA total, dernière commande
- Recherche par nom ou téléphone
- Modal détail avec historique commandes

### /admin/produits (stock)
- Par variante : couleur, stock actuel, alerte rouge si < 10
- Boutons +/- pour ajuster + historique modifications

---

## Conventions de code

- Tous les commentaires en **français**
- Types TypeScript stricts — pas de `any`
- Appels Supabase toujours avec gestion d'erreur try/catch
- API routes : toujours retourner `{ success: boolean, data?: T, error?: string }`
- Nommage : camelCase variables, PascalCase composants
- **Jamais de couleur ou police hardcodée dans les composants** — toujours `var(--ch-*)`
- Tailwind autorisé pour layout/spacing (`flex`, `grid`, `p-4`...) mais pas pour les couleurs ni la typo