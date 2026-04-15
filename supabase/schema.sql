-- ============================================================
-- CH Accessoires — Schéma de base de données Supabase
-- Exécuter dans : Supabase Dashboard → SQL Editor
-- ============================================================

-- Extension pour générer des UUID
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLE : produits
-- Un seul produit au lancement : sac-ch-signature
-- ============================================================
create table if not exists produits (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  nom_fr      text not null,
  nom_ar      text not null,
  description_fr text,
  description_ar text,
  prix        integer not null default 2500,  -- Prix en DA (toujours 2500)
  actif       boolean default true,
  created_at  timestamptz default now()
);

-- ============================================================
-- TABLE : variantes
-- Chaque produit a plusieurs coloris avec stock indépendant
-- ============================================================
create table if not exists variantes (
  id          uuid primary key default gen_random_uuid(),
  produit_id  uuid references produits(id) on delete cascade,
  couleur_fr  text not null,
  couleur_ar  text not null,
  couleur_hex text,
  stock       integer default 50,
  images      text[] default '{}'  -- URLs Cloudinary
);

-- ============================================================
-- TABLE : clients
-- Identifiés par leur numéro de téléphone (unique par client)
-- ============================================================
create table if not exists clients (
  id               uuid primary key default gen_random_uuid(),
  nom              text not null,
  prenom           text not null,
  telephone        text not null,
  wilaya           text not null,
  adresse          text,
  total_commandes  integer default 0,
  created_at       timestamptz default now()
);

-- Index pour la recherche rapide par téléphone
create index if not exists idx_clients_telephone on clients(telephone);

-- ============================================================
-- TABLE : commandes
-- Statut suit le pipeline : nouvelle → confirmee → expediee → livree / annulee
-- ============================================================
create table if not exists commandes (
  id                  uuid primary key default gen_random_uuid(),
  numero              text unique not null,  -- Format : CHxxxxxx (timestamp 6 chiffres)
  client_id           uuid references clients(id),
  variante_id         uuid references variantes(id),
  quantite            integer default 1 check (quantite between 1 and 3),
  montant             integer not null,      -- Prix total en DA
  statut              text default 'nouvelle'
    check (statut in ('nouvelle', 'confirmee', 'expediee', 'livree', 'annulee')),
  wilaya_livraison    text not null,
  adresse_livraison   text not null,
  notes               text,                 -- Notes internes admin
  message_cadeau      text,                 -- Message personnalisé optionnel
  fbclid              text,                 -- Tracking Facebook Ads
  utm_source          text,
  utm_campaign        text,
  utm_content         text,
  ab_variant          text,                 -- Variante A/B test affichée lors de la commande
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- Index pour les filtres admin (statut, date, wilaya)
create index if not exists idx_commandes_statut     on commandes(statut);
create index if not exists idx_commandes_created_at on commandes(created_at desc);
create index if not exists idx_commandes_wilaya     on commandes(wilaya_livraison);
create index if not exists idx_commandes_client     on commandes(client_id);

-- ============================================================
-- TABLE : pixel_events
-- Log des événements Meta Pixel envoyés côté serveur (CAPI)
-- ============================================================
create table if not exists pixel_events (
  id           uuid primary key default gen_random_uuid(),
  event_name   text not null,                  -- PageView, Purchase, etc.
  commande_id  uuid references commandes(id),
  fbclid       text,
  event_data   jsonb,                          -- Données complètes envoyées à Meta
  created_at   timestamptz default now()
);

-- ============================================================
-- TRIGGER : mise à jour automatique de updated_at sur commandes
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_commandes_updated_at
  before update on commandes
  for each row
  execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Lecture publique sur produits/variantes uniquement
-- Toutes les autres tables nécessitent le service role (admin)
-- ============================================================

-- Activer RLS sur toutes les tables
alter table produits       enable row level security;
alter table variantes      enable row level security;
alter table clients        enable row level security;
alter table commandes      enable row level security;
alter table pixel_events   enable row level security;

-- Produits et variantes : lecture publique (landing page)
create policy "Lecture publique produits"
  on produits for select
  using (actif = true);

create policy "Lecture publique variantes"
  on variantes for select
  using (true);

-- Commandes : insertion publique (formulaire COD), lecture/modification via service role
create policy "Insertion publique commandes"
  on commandes for insert
  with check (true);

-- Clients : insertion publique (création à la commande)
create policy "Insertion publique clients"
  on clients for insert
  with check (true);

-- Note : les opérations admin (SELECT, UPDATE, DELETE) sur clients/commandes/pixel_events
-- sont effectuées via supabase-admin.ts qui utilise le SERVICE_ROLE_KEY
-- qui bypasse le RLS automatiquement.
