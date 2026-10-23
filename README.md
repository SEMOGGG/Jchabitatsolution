# JC Habitat Solutions — Next.js + Supabase + Clerk + Resend

Site vitrine + prise de rendez-vous / demande de devis en ligne + back-office, prêt à déployer sur Vercel.

## Ce qu'il y a dedans

**Site public**
- `/` accueil (réalisations « en avant » et avis chargés depuis Supabase)
- `/galerie` galerie filtrable par catégorie, lightbox plein écran, comparatifs avant / après à faire glisser
- `/devis` demande de devis avec planning en ligne : le client choisit un jour puis un créneau libre, indique la nature du projet, joint une photo (facultatif), son prénom, nom et e-mail. Le planning se recharge toutes les 60 s et quand on revient sur l'onglet ; un créneau pris par quelqu'un d'autre disparaît, et la base empêche toute double réservation
- `/mentions-legales`, `/politique-confidentialite`

**E-mails (Resend)**
- À chaque demande : un e-mail à Jocelyn (photo en pièce jointe, « Répondre » écrit directement au client) + un accusé de réception au client
- Depuis le back-office : confirmation de RDV, déplacement, annulation, et e-mail libre au client

**Back-office `/admin` (Clerk)**
- Tableau de bord : demandes à traiter, RDV de la semaine, prochains RDV, dernières demandes
- Demandes : filtres par statut, recherche, pagination, export CSV, fiche détaillée (photo, créneau, historique du client), changement de statut, note interne, confirmer / déplacer / annuler un RDV avec e-mail automatique, écrire au client, suppression RGPD
- Planning : vue semaine, plages horaires hebdomadaires, fermetures/congés, durée des créneaux, délai minimum, horizon de réservation, ouverture/fermeture des réservations
- Galerie : envoi de plusieurs photos d'un coup (redimensionnées automatiquement dans le navigateur), paires avant / après, ordre, mise en avant sur l'accueil, masquer, modifier, supprimer
- Avis clients : ajout, modification, note, affichage/masquage
- Utilisateurs (admin) : invitations par e-mail, rôles admin / éditeur, blocage, suppression
- Paramètres (admin) : coordonnées affichées partout sur le site, état des services connectés, e-mail de test
- Journal d'activité (admin) : qui a fait quoi et quand

Rôles : **admin** = tout ; **éditeur** = demandes, planning, galerie, avis.

## Installation en local (PowerShell)

```powershell
cd jc-habitat-solutions
npm install
Copy-Item .env.example .env.local
notepad .env.local
npm run dev
```

Puis ouvrir http://localhost:3000. Sans clés, le site public s'affiche quand même (photos par défaut, planning « bientôt disponible »).

## 1. Supabase

1. Créer un projet sur supabase.com (région Europe — Paris ou Francfort).
2. **SQL Editor > New query**, coller tout le contenu de `supabase/schema.sql`, **Run**. Ça crée les tables, les disponibilités par défaut (lun–ven 9h–12h / 14h–18h, sam 9h–12h), les réalisations et avis de départ et les deux espaces de stockage (`galerie` public, `demandes` privé). Le script peut être relancé sans risque.
3. **Project Settings > API** : copier `Project URL` → `SUPABASE_URL` et la clé `service_role` → `SUPABASE_SERVICE_ROLE_KEY`.

La clé `service_role` reste côté serveur uniquement (jamais préfixée `NEXT_PUBLIC_`). Toutes les tables ont la RLS activée sans politique publique : rien n'est lisible directement depuis le navigateur.

## 2. Clerk

1. Créer une application sur clerk.com (connexion par e-mail + mot de passe).
2. **API Keys** : copier `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY`.
3. **User & Authentication > Restrictions** : activer **Restricted** (inscription sur invitation uniquement), pour que personne ne puisse créer de compte seul.
4. Mettre l'e-mail de Jocelyn dans `ADMIN_EMAILS` : son compte sera admin dès sa première connexion, même sans rôle. Les autres accès se donnent ensuite depuis **Back-office > Utilisateurs > Inviter**.
5. **Localization** : le français est déjà appliqué dans le code.

## 3. Resend

1. Créer un compte sur resend.com, **API Keys** → `RESEND_API_KEY`.
2. Pour envoyer aux clients, il faut **vérifier un domaine** (Domains > Add domain, ajouter les enregistrements DNS chez le registrar). Ensuite : `EMAIL_FROM="JC Habitat Solutions <contact@son-domaine.fr>"`.
3. Tant que le domaine n'est pas vérifié, Resend n'envoie qu'à l'adresse du compte Resend, depuis `onboarding@resend.dev` — pratique pour tester, pas pour la production.
4. Tester depuis **Back-office > Paramètres > Envoyer un e-mail de test**.

## 4. Vercel

```powershell
npm install -g vercel
vercel
```

Ou importer le dépôt GitHub depuis vercel.com. Dans **Project > Settings > Environment Variables**, ajouter toutes les variables de `.env.example`, avec `NEXT_PUBLIC_SITE_URL` = l'URL finale (ex. `https://jchabitatsolutions.fr`). Redéployer après tout changement de variable.

## Variables d'environnement

| Variable | Où la trouver |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk > API Keys |
| `CLERK_SECRET_KEY` | Clerk > API Keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/connexion` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/admin` |
| `ADMIN_EMAILS` | e-mails toujours admin, séparés par des virgules |
| `SUPABASE_URL` | Supabase > Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Project Settings > API (service_role) |
| `RESEND_API_KEY` | Resend > API Keys |
| `EMAIL_FROM` | adresse d'envoi sur le domaine vérifié |
| `ADMIN_NOTIFICATION_EMAIL` | facultatif, sinon l'e-mail réglé dans Paramètres |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site |

## Structure

```
app/
  (site)/            pages publiques (accueil, galerie, devis, légal)
  admin/             back-office (une page + un actions.ts par section)
  api/creneaux/      créneaux libres en JSON (planning client)
  connexion/         page de connexion Clerk
components/          en-tête, pied de page, galerie, formulaire de devis, back-office
lib/
  planning.ts        calcul des créneaux libres (testé : fuseau Europe/Paris, heure d'hiver, fermetures, créneaux pris)
  creneaux.ts        lecture Supabase + vérification d'un créneau au moment de réserver
  email.ts           gabarits et envoi Resend
  auth.ts            rôles admin / éditeur
supabase/schema.sql  à exécuter une fois dans Supabase
app/globals.css      design system (repris de la version PHP)
app/site.css         galerie, planning, formulaire
app/admin.css        back-office
```

## Sécurité en place

- Clés secrètes uniquement côté serveur, RLS activée sur toutes les tables
- `/admin` protégé par le middleware Clerk + vérification du rôle dans chaque page et chaque action
- Double réservation impossible (index unique en base) + revérification du créneau à l'envoi
- Anti-spam : champ piège invisible + 3 demandes maximum par heure et par IP (IP stockée hachée)
- Photos des demandes dans un espace privé, consultables uniquement via un lien signé d'une heure dans le back-office
- Validation de tous les champs côté serveur (zod), type et poids des images vérifiés
- Export CSV protégé contre l'injection de formules Excel

## À compléter avant la mise en ligne

- Mentions légales : forme juridique, SIRET, adresse du siège
- Remplacer les 3 avis de démonstration par de vrais avis (Back-office > Avis clients)
- Vérifier le domaine dans Resend
