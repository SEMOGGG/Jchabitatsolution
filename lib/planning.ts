import { ajouterJours, dateParis, heureParisVersDate, jourSemaineIso } from "./temps";
import type { Disponibilite, Fermeture, JourCreneaux } from "./types";

export type Occupation = { debut: number; fin: number };

export function genererCreneaux(options: {
  maintenant: Date;
  dureeMinutes: number;
  delaiMinHeures: number;
  horizonJours: number;
  disponibilites: Disponibilite[];
  fermetures: Fermeture[];
  occupations: Occupation[];
}): JourCreneaux[] {
  const { maintenant, dureeMinutes, delaiMinHeures, horizonJours, disponibilites, fermetures, occupations } = options;
  const premierDebutPossible = maintenant.getTime() + delaiMinHeures * 3600000;
  const dureeMs = dureeMinutes * 60000;
  const aujourdHui = dateParis(maintenant);
  const jours: JourCreneaux[] = [];

  for (let i = 0; i <= horizonJours; i++) {
    const date = ajouterJours(aujourdHui, i);
    const ferme = fermetures.some((f) => date >= f.date_debut && date <= f.date_fin);
    if (ferme) continue;

    const plages = disponibilites
      .filter((d) => d.actif && d.jour_semaine === jourSemaineIso(date))
      .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut));

    const creneaux: JourCreneaux["creneaux"] = [];
    for (const plage of plages) {
      const debutPlage = heureParisVersDate(date, plage.heure_debut.slice(0, 5)).getTime();
      const finPlage = heureParisVersDate(date, plage.heure_fin.slice(0, 5)).getTime();
      for (let debut = debutPlage; debut + dureeMs <= finPlage; debut += dureeMs) {
        const fin = debut + dureeMs;
        if (debut < premierDebutPossible) continue;
        const occupe = occupations.some((o) => debut < o.fin && fin > o.debut);
        if (occupe) continue;
        creneaux.push({ debut: new Date(debut).toISOString(), fin: new Date(fin).toISOString() });
      }
    }
    if (creneaux.length > 0) jours.push({ date, creneaux });
  }
  return jours;
}
