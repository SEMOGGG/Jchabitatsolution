export type StatutDemande = "nouvelle" | "confirmee" | "devis_envoye" | "terminee" | "annulee";

export type Parametres = {
  id: number;
  entreprise_nom: string;
  dirigeant: string;
  telephone: string;
  email_contact: string;
  email_notifications: string;
  zone_intervention: string;
  horaires: string;
  duree_creneau_minutes: number;
  delai_min_heures: number;
  horizon_jours: number;
  reservations_ouvertes: boolean;
  updated_at?: string;
};

export type Disponibilite = {
  id: string;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
  actif: boolean;
};

export type Fermeture = {
  id: string;
  date_debut: string;
  date_fin: string;
  motif: string | null;
  created_at?: string;
};

export type Demande = {
  id: string;
  created_at: string;
  updated_at: string;
  nature_projet: string;
  description: string | null;
  prenom: string;
  nom: string;
  email: string;
  photo_path: string | null;
  creneau_debut: string | null;
  creneau_fin: string | null;
  statut: StatutDemande;
  note_interne: string | null;
  ip_hash: string | null;
};

export type ElementGalerie = {
  id: string;
  created_at: string;
  titre: string;
  categorie: string;
  lieu: string | null;
  description: string | null;
  type: "photo" | "avant_apres";
  image_url: string | null;
  image_avant_url: string | null;
  image_apres_url: string | null;
  storage_paths: string[];
  en_avant: boolean;
  visible: boolean;
  ordre: number;
};

export type Avis = {
  id: string;
  created_at: string;
  nom_client: string;
  fonction: string | null;
  texte: string;
  note: number;
  visible: boolean;
  ordre: number;
};

export type EntreeJournal = {
  id: number;
  created_at: string;
  auteur: string;
  action: string;
  details: string | null;
};

export type Creneau = {
  debut: string;
  fin: string;
};

export type JourCreneaux = {
  date: string;
  creneaux: Creneau[];
};

export type ResultatAction = {
  ok: boolean;
  message: string;
};
