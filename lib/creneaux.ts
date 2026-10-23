import "server-only";
import { supabaseAdmin } from "./supabase";
import { lireParametres } from "./donnees";
import { dateParis } from "./temps";
import { genererCreneaux, type Occupation } from "./planning";
import type { Disponibilite, Fermeture, JourCreneaux } from "./types";

export async function creneauxDisponibles(): Promise<{ ouvert: boolean; jours: JourCreneaux[] }> {
  const parametres = await lireParametres();
  if (!parametres.reservations_ouvertes) return { ouvert: false, jours: [] };

  const supabase = supabaseAdmin();
  const maintenant = new Date();
  const limite = new Date(maintenant.getTime() + (parametres.horizon_jours + 2) * 86400000);

  const [dispos, fermetures, demandes] = await Promise.all([
    supabase.from("disponibilites").select("*").eq("actif", true),
    supabase.from("fermetures").select("*").gte("date_fin", dateParis(maintenant)),
    supabase
      .from("demandes")
      .select("creneau_debut, creneau_fin")
      .neq("statut", "annulee")
      .not("creneau_debut", "is", null)
      .gte("creneau_debut", new Date(maintenant.getTime() - 86400000).toISOString())
      .lte("creneau_debut", limite.toISOString()),
  ]);

  if (dispos.error) throw dispos.error;
  if (fermetures.error) throw fermetures.error;
  if (demandes.error) throw demandes.error;

  const occupations: Occupation[] = (demandes.data ?? []).map((d) => ({
    debut: new Date(d.creneau_debut as string).getTime(),
    fin: new Date((d.creneau_fin ?? d.creneau_debut) as string).getTime(),
  }));

  const jours = genererCreneaux({
    maintenant,
    dureeMinutes: parametres.duree_creneau_minutes,
    delaiMinHeures: parametres.delai_min_heures,
    horizonJours: parametres.horizon_jours,
    disponibilites: (dispos.data ?? []) as Disponibilite[],
    fermetures: (fermetures.data ?? []) as Fermeture[],
    occupations,
  });

  return { ouvert: true, jours };
}

export async function creneauEstLibre(debutIso: string): Promise<{ libre: boolean; fin?: string }> {
  const { jours } = await creneauxDisponibles();
  for (const jour of jours) {
    const trouve = jour.creneaux.find((c) => c.debut === debutIso);
    if (trouve) return { libre: true, fin: trouve.fin };
  }
  return { libre: false };
}
