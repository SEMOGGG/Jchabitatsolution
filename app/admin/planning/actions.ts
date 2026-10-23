"use server";

import { revalidatePath } from "next/cache";
import { verifierAcces } from "@/lib/auth";
import { booleen, entier, retour, texte } from "@/lib/admin";
import { journaliser } from "@/lib/journal";
import { supabaseAdmin } from "@/lib/supabase";
import { JOURS_SEMAINE } from "@/lib/constantes";

const RETOUR = "/admin/planning";
const HEURE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function rafraichir() {
  revalidatePath("/admin/planning");
  revalidatePath("/devis");
}

export async function ajouterDisponibilite(formData: FormData) {
  const utilisateur = await verifierAcces();
  const jour = entier(formData, "jour_semaine");
  const debut = texte(formData, "heure_debut");
  const fin = texte(formData, "heure_fin");
  if (jour < 1 || jour > 7 || !HEURE.test(debut) || !HEURE.test(fin) || fin <= debut) {
    retour(RETOUR, "Plage horaire invalide : l'heure de fin doit être après l'heure de début.", "danger");
  }
  const { error } = await supabaseAdmin().from("disponibilites").insert({ jour_semaine: jour, heure_debut: debut, heure_fin: fin });
  if (error) retour(RETOUR, "Impossible d'ajouter cette plage.", "danger");
  await journaliser(utilisateur.email, "Plage de disponibilité ajoutée", `${JOURS_SEMAINE[jour]} ${debut}–${fin}`);
  rafraichir();
  retour(RETOUR, `Plage ajoutée : ${JOURS_SEMAINE[jour]} ${debut}–${fin}.`);
}

export async function basculerDisponibilite(formData: FormData) {
  await verifierAcces();
  const id = texte(formData, "id");
  const actif = booleen(formData, "actif");
  await supabaseAdmin().from("disponibilites").update({ actif: !actif }).eq("id", id);
  rafraichir();
  retour(RETOUR, actif ? "Plage désactivée." : "Plage réactivée.");
}

export async function supprimerDisponibilite(formData: FormData) {
  const utilisateur = await verifierAcces();
  const id = texte(formData, "id");
  await supabaseAdmin().from("disponibilites").delete().eq("id", id);
  await journaliser(utilisateur.email, "Plage de disponibilité supprimée");
  rafraichir();
  retour(RETOUR, "Plage supprimée.");
}

export async function ajouterFermeture(formData: FormData) {
  const utilisateur = await verifierAcces();
  const debut = texte(formData, "date_debut");
  const fin = texte(formData, "date_fin") || debut;
  const motif = texte(formData, "motif");
  if (!DATE.test(debut) || !DATE.test(fin) || fin < debut) {
    retour(RETOUR, "Dates invalides : la date de fin doit être après la date de début.", "danger");
  }
  await supabaseAdmin().from("fermetures").insert({ date_debut: debut, date_fin: fin, motif: motif || null });
  await journaliser(utilisateur.email, "Fermeture ajoutée", `${debut} → ${fin}${motif ? ` (${motif})` : ""}`);
  rafraichir();
  retour(RETOUR, "Fermeture ajoutée : ces jours ne sont plus proposés aux clients.");
}

export async function supprimerFermeture(formData: FormData) {
  const utilisateur = await verifierAcces();
  const id = texte(formData, "id");
  await supabaseAdmin().from("fermetures").delete().eq("id", id);
  await journaliser(utilisateur.email, "Fermeture supprimée");
  rafraichir();
  retour(RETOUR, "Fermeture supprimée.");
}

export async function enregistrerReglagesReservation(formData: FormData) {
  const utilisateur = await verifierAcces();
  const duree = entier(formData, "duree_creneau_minutes", 60);
  const delai = entier(formData, "delai_min_heures", 24);
  const horizon = entier(formData, "horizon_jours", 30);
  const ouvertes = booleen(formData, "reservations_ouvertes");
  if (duree < 15 || duree > 480 || delai < 0 || delai > 720 || horizon < 1 || horizon > 180) {
    retour(RETOUR, "Réglages invalides.", "danger");
  }
  await supabaseAdmin()
    .from("parametres")
    .update({
      duree_creneau_minutes: duree,
      delai_min_heures: delai,
      horizon_jours: horizon,
      reservations_ouvertes: ouvertes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  await journaliser(utilisateur.email, "Réglages de réservation modifiés", `${duree} min · délai ${delai} h · ${horizon} jours · ${ouvertes ? "ouvert" : "fermé"}`);
  rafraichir();
  retour(RETOUR, "Réglages de réservation enregistrés.");
}
