-- ============================================================
-- JC Habitat Solutions — schéma Supabase
-- À exécuter une fois dans Supabase > SQL Editor > New query > Run
-- Le site accède à la base uniquement côté serveur avec la clé
-- service_role : la RLS est activée sans politique publique, donc
-- personne ne peut lire/écrire directement depuis le navigateur.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Paramètres du site (une seule ligne, id = 1)
-- ------------------------------------------------------------
create table if not exists parametres (
  id smallint primary key default 1 check (id = 1),
  entreprise_nom text not null default 'JC Habitat Solutions',
  dirigeant text not null default 'Jocelyn Castanedo',
  telephone text not null default '06 64 58 00 30',
  email_contact text not null default 'jc.habitatsolution@gmail.com',
  email_notifications text not null default 'jc.habitatsolution@gmail.com',
  zone_intervention text not null default 'Émerainville et toute l''Île-de-France',
  horaires text not null default 'Lun – Sam : 8h – 19h',
  duree_creneau_minutes integer not null default 60 check (duree_creneau_minutes between 15 and 480),
  delai_min_heures integer not null default 24 check (delai_min_heures >= 0),
  horizon_jours integer not null default 30 check (horizon_jours between 1 and 180),
  reservations_ouvertes boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into parametres (id) values (1) on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Disponibilités hebdomadaires (1 = lundi ... 7 = dimanche)
-- ------------------------------------------------------------
create table if not exists disponibilites (
  id uuid primary key default gen_random_uuid(),
  jour_semaine smallint not null check (jour_semaine between 1 and 7),
  heure_debut time not null,
  heure_fin time not null,
  actif boolean not null default true,
  check (heure_fin > heure_debut)
);

insert into disponibilites (jour_semaine, heure_debut, heure_fin)
select v.jour_semaine, v.heure_debut::time, v.heure_fin::time from (values
  (1, '09:00', '12:00'), (1, '14:00', '18:00'),
  (2, '09:00', '12:00'), (2, '14:00', '18:00'),
  (3, '09:00', '12:00'), (3, '14:00', '18:00'),
  (4, '09:00', '12:00'), (4, '14:00', '18:00'),
  (5, '09:00', '12:00'), (5, '14:00', '18:00'),
  (6, '09:00', '12:00')
) as v(jour_semaine, heure_debut, heure_fin)
where not exists (select 1 from disponibilites);

-- ------------------------------------------------------------
-- Fermetures (congés, jours bloqués)
-- ------------------------------------------------------------
create table if not exists fermetures (
  id uuid primary key default gen_random_uuid(),
  date_debut date not null,
  date_fin date not null,
  motif text,
  created_at timestamptz not null default now(),
  check (date_fin >= date_debut)
);

-- ------------------------------------------------------------
-- Demandes de devis / rendez-vous
-- ------------------------------------------------------------
create table if not exists demandes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  nature_projet text not null,
  description text,
  prenom text not null,
  nom text not null,
  email text not null,
  photo_path text,
  creneau_debut timestamptz,
  creneau_fin timestamptz,
  statut text not null default 'nouvelle'
    check (statut in ('nouvelle', 'confirmee', 'devis_envoye', 'terminee', 'annulee')),
  note_interne text,
  ip_hash text
);

create index if not exists demandes_created_idx on demandes (created_at desc);
create index if not exists demandes_statut_idx on demandes (statut);
create index if not exists demandes_creneau_idx on demandes (creneau_debut);

create or replace function maj_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists demandes_maj_updated_at on demandes;
create trigger demandes_maj_updated_at before update on demandes
  for each row execute function maj_updated_at();

-- Empêche deux demandes actives sur le même créneau (double réservation)
create unique index if not exists demandes_creneau_unique
  on demandes (creneau_debut)
  where creneau_debut is not null and statut <> 'annulee';

-- ------------------------------------------------------------
-- Galerie (photos simples et paires avant / après)
-- ------------------------------------------------------------
create table if not exists galerie (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  titre text not null,
  categorie text not null,
  lieu text,
  description text,
  type text not null default 'photo' check (type in ('photo', 'avant_apres')),
  image_url text,
  image_avant_url text,
  image_apres_url text,
  storage_paths text[] not null default '{}',
  en_avant boolean not null default false,
  visible boolean not null default true,
  ordre integer not null default 0
);

create index if not exists galerie_ordre_idx on galerie (ordre, created_at);

insert into galerie (titre, categorie, lieu, type, image_url, en_avant, ordre)
select * from (values
  ('Salon Maxime', 'Salons & instituts', 'Roissy-en-Brie', 'photo', '/images/realisation-salon-maxime.jpg', true, 1),
  ('Remise en état des marches de la mairie', 'Façades & remise en état', 'Sceaux', 'photo', '/images/realisation-mairie-marches.jpg', true, 2),
  ('Nettoyage d''une statue en pierre', 'Façades & remise en état', 'Sceaux', 'photo', '/images/realisation-statue.jpg', true, 3),
  ('École — vitrerie, remise en état & décapage des sols', 'Collectivités & bâtiments publics', '2 684 m²', 'photo', '/images/realisation-ecole.jpg', true, 4),
  ('Façade de l''hôtel de ville', 'Façades & remise en état', 'Sceaux', 'photo', '/images/hero-mairie.jpg', false, 5)
) as v(titre, categorie, lieu, type, image_url, en_avant, ordre)
where not exists (select 1 from galerie);

-- ------------------------------------------------------------
-- Avis clients
-- ------------------------------------------------------------
create table if not exists avis (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nom_client text not null,
  fonction text,
  texte text not null,
  note smallint not null default 5 check (note between 1 and 5),
  visible boolean not null default true,
  ordre integer not null default 0
);

insert into avis (nom_client, fonction, texte, ordre)
select * from (values
  ('Sophie Marchand', 'Gérante, cabinet dentaire', 'Le suivi est clair : on sait toujours où en est notre demande, et l''équipe est ponctuelle.', 1),
  ('Thomas Rambert', 'Office manager', 'Nos bureaux sont nettoyés chaque semaine sans le moindre couac depuis plus d''un an.', 2),
  ('Laura Andrade', 'Syndic de copropriété', 'Devis reçu en moins de 24h et intervention rapide après travaux, exactement ce qu''il nous fallait.', 3)
) as v(nom_client, fonction, texte, ordre)
where not exists (select 1 from avis);

-- ------------------------------------------------------------
-- Journal d'activité du back-office
-- ------------------------------------------------------------
create table if not exists journal (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  auteur text not null,
  action text not null,
  details text
);

create index if not exists journal_created_idx on journal (created_at desc);

-- ------------------------------------------------------------
-- Sécurité : RLS activée partout, aucune politique publique
-- ------------------------------------------------------------
alter table parametres enable row level security;
alter table disponibilites enable row level security;
alter table fermetures enable row level security;
alter table demandes enable row level security;
alter table galerie enable row level security;
alter table avis enable row level security;
alter table journal enable row level security;

-- ------------------------------------------------------------
-- Stockage : galerie publique, photos des demandes privées
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('galerie', 'galerie', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('demandes', 'demandes', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
