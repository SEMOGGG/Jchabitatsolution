import type { Parametres, StatutDemande } from "./types";

export const NATURES_PROJET = [
  "Bureaux & commerces",
  "Collectivités & bâtiments publics",
  "Salons & instituts",
  "Vitrerie en hauteur",
  "Façades & remise en état",
  "Fin de chantier",
  "Particuliers",
  "Autre",
] as const;

export const CATEGORIES_GALERIE = [
  "Bureaux & commerces",
  "Collectivités & bâtiments publics",
  "Salons & instituts",
  "Vitrerie en hauteur",
  "Façades & remise en état",
  "Fin de chantier",
  "Particuliers",
] as const;

export const STATUTS: Record<StatutDemande, { libelle: string; classe: string }> = {
  nouvelle: { libelle: "Nouvelle", classe: "pill-new" },
  confirmee: { libelle: "RDV confirmé", classe: "pill-progress" },
  devis_envoye: { libelle: "Devis envoyé", classe: "pill-done" },
  terminee: { libelle: "Terminée", classe: "pill-done" },
  annulee: { libelle: "Annulée", classe: "pill-refused" },
};

export const JOURS_SEMAINE = ["", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export const FUSEAU = "Europe/Paris";

export const PARAMETRES_DEFAUT: Parametres = {
  id: 1,
  entreprise_nom: "JC Habitat Solutions",
  dirigeant: "Jocelyn Castanedo",
  telephone: "06 64 58 00 30",
  email_contact: "jc.habitatsolution@gmail.com",
  email_notifications: "jc.habitatsolution@gmail.com",
  zone_intervention: "Émerainville et toute l'Île-de-France",
  horaires: "Lun – Sam : 8h – 19h",
  duree_creneau_minutes: 60,
  delai_min_heures: 24,
  horizon_jours: 30,
  reservations_ouvertes: true,
};

export const TAILLE_MAX_IMAGE = 4 * 1024 * 1024;
export const TYPES_IMAGE = ["image/jpeg", "image/png", "image/webp"];
