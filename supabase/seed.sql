-- ============================================================
-- CH Accessoires — Données de test (seed)
-- Exécuter APRÈS schema.sql dans Supabase SQL Editor
-- ============================================================

-- UUIDs fixes pour pouvoir référencer entre tables
-- Produit
do $$
declare
  v_produit_id   uuid := '11111111-1111-1111-1111-111111111111';
  v_variante_noir uuid := '22222222-2222-2222-2222-222222222222';
  v_variante_burgundy uuid := '33333333-3333-3333-3333-333333333333';
  v_client1_id   uuid := '44444444-4444-4444-4444-444444444444';
  v_client2_id   uuid := '55555555-5555-5555-5555-555555555555';
  v_commande1_id uuid := '66666666-6666-6666-6666-666666666666';
  v_commande2_id uuid := '77777777-7777-7777-7777-777777777777';
  v_commande3_id uuid := '88888888-8888-8888-8888-888888888888';
begin

  -- ============================================================
  -- PRODUIT : Sac CH Signature
  -- ============================================================
  insert into produits (id, slug, nom_fr, nom_ar, description_fr, description_ar, prix, actif)
  values (
    v_produit_id,
    'sac-ch-signature',
    'Sac CH Signature',
    'حقيبة CH سيغناتشر',
    'Le sac iconique de CH Accessoires. Cuir synthétique premium, doublure soignée, fermeture éclair dorée. Conçu pour accompagner votre quotidien avec élégance.',
    'الحقيبة الأيقونية من CH Accessoires. جلد صناعي فاخر، بطانة مصنوعة بعناية، سحاب ذهبي اللون. مصممة لتصحب يومك بأناقة.',
    2500,
    true
  )
  on conflict (id) do nothing;

  -- ============================================================
  -- VARIANTES : Noir et Burgundy
  -- Images : remplacer par les vraies URLs Cloudinary au lancement
  -- ============================================================
  insert into variantes (id, produit_id, couleur_fr, couleur_ar, couleur_hex, stock, images)
  values (
    v_variante_noir,
    v_produit_id,
    'Noir',
    'أسود',
    '#1a1a1a',
    30,
    array[
      '/images/sac-noir-1.jpg',
      '/images/sac-noir-2.jpg',
      '/images/sac-noir-3.jpg'
    ]
  )
  on conflict (id) do nothing;

  insert into variantes (id, produit_id, couleur_fr, couleur_ar, couleur_hex, stock, images)
  values (
    v_variante_burgundy,
    v_produit_id,
    'Burgundy',
    'بورغاندي',
    '#800020',
    20,
    array[
      '/images/sac-burgundy-1.jpg',
      '/images/sac-burgundy-2.jpg',
      '/images/sac-burgundy-3.jpg'
    ]
  )
  on conflict (id) do nothing;

  -- ============================================================
  -- CLIENTS DE TEST (noms algériens réalistes)
  -- ============================================================
  insert into clients (id, nom, prenom, telephone, wilaya, adresse, total_commandes)
  values (
    v_client1_id,
    'Benali',
    'Samira',
    '0661234567',
    'Alger',
    'Cité des Orangers, Bâtiment B, Apt 12, Bir Mourad Raïs',
    2
  )
  on conflict (id) do nothing;

  insert into clients (id, nom, prenom, telephone, wilaya, adresse, total_commandes)
  values (
    v_client2_id,
    'Meziani',
    'Karim',
    '0551234567',
    'Oran',
    '15 Rue des Frères Meguellati, Bir El Djir',
    1
  )
  on conflict (id) do nothing;

  -- ============================================================
  -- COMMANDES DE TEST — 3 statuts différents pour tester le pipeline
  -- ============================================================

  -- Commande 1 : Nouvelle (en attente de confirmation)
  insert into commandes (
    id, numero, client_id, variante_id, quantite, montant,
    statut, wilaya_livraison, adresse_livraison, utm_source, utm_campaign
  )
  values (
    v_commande1_id,
    'CH100001',
    v_client1_id,
    v_variante_noir,
    1,
    2500,
    'nouvelle',
    'Alger',
    'Cité des Orangers, Bâtiment B, Apt 12, Bir Mourad Raïs',
    'facebook',
    'sac-signature-avril-2024'
  )
  on conflict (id) do nothing;

  -- Commande 2 : Expédiée (en cours de livraison)
  insert into commandes (
    id, numero, client_id, variante_id, quantite, montant,
    statut, wilaya_livraison, adresse_livraison, utm_source, utm_campaign,
    created_at
  )
  values (
    v_commande2_id,
    'CH100002',
    v_client2_id,
    v_variante_burgundy,
    1,
    2500,
    'expediee',
    'Oran',
    '15 Rue des Frères Meguellati, Bir El Djir',
    'facebook',
    'sac-signature-avril-2024',
    now() - interval '3 days'
  )
  on conflict (id) do nothing;

  -- Commande 3 : Livrée (revenus comptabilisés)
  insert into commandes (
    id, numero, client_id, variante_id, quantite, montant,
    statut, wilaya_livraison, adresse_livraison, message_cadeau,
    utm_source, utm_campaign, created_at
  )
  values (
    v_commande3_id,
    'CH100003',
    v_client1_id,
    v_variante_burgundy,
    1,
    2500,
    'livree',
    'Alger',
    'Cité des Orangers, Bâtiment B, Apt 12, Bir Mourad Raïs',
    'Pour l''anniversaire de ma femme, merci !',
    'facebook',
    'sac-signature-mars-2024',
    now() - interval '15 days'
  )
  on conflict (id) do nothing;

end $$;

-- ============================================================
-- Vérification — afficher les données insérées
-- ============================================================
select 'Produits'   as table_name, count(*) as nb from produits
union all
select 'Variantes',   count(*) from variantes
union all
select 'Clients',     count(*) from clients
union all
select 'Commandes',   count(*) from commandes;
