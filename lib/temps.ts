import { FUSEAU } from "./constantes";

function decalageMinutes(instant: Date): number {
  const morceaux = new Intl.DateTimeFormat("en-US", {
    timeZone: FUSEAU,
    timeZoneName: "shortOffset",
  }).formatToParts(instant);
  const valeur = morceaux.find((m) => m.type === "timeZoneName")?.value ?? "GMT";
  const correspondance = valeur.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!correspondance) return 0;
  const signe = correspondance[1] === "-" ? -1 : 1;
  return signe * (Number(correspondance[2]) * 60 + Number(correspondance[3] ?? 0));
}

export function heureParisVersDate(dateIso: string, heure: string): Date {
  const [annee, mois, jour] = dateIso.split("-").map(Number);
  const [h, m] = heure.split(":").map(Number);
  const supposeUtc = Date.UTC(annee, mois - 1, jour, h, m);
  let resultat = supposeUtc - decalageMinutes(new Date(supposeUtc)) * 60000;
  resultat = supposeUtc - decalageMinutes(new Date(resultat)) * 60000;
  return new Date(resultat);
}

export function dateParis(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSEAU,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

export function jourSemaineIso(dateIso: string): number {
  const [annee, mois, jour] = dateIso.split("-").map(Number);
  const jourJs = new Date(Date.UTC(annee, mois - 1, jour)).getUTCDay();
  return jourJs === 0 ? 7 : jourJs;
}

export function ajouterJours(dateIso: string, nombre: number): string {
  const [annee, mois, jour] = dateIso.split("-").map(Number);
  const d = new Date(Date.UTC(annee, mois - 1, jour + nombre));
  return d.toISOString().slice(0, 10);
}

export function lundiDeLaSemaine(dateIso: string): string {
  return ajouterJours(dateIso, 1 - jourSemaineIso(dateIso));
}

export function formatDateLongue(instant: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: FUSEAU,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(instant));
}

export function formatHeure(instant: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: FUSEAU,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(instant));
}

export function formatDateCourte(instant: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: FUSEAU,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(instant));
}

export function formatCreneau(debut: string | null, fin: string | null): string {
  if (!debut) return "Sans créneau";
  const texte = `${formatDateLongue(debut)} à ${formatHeure(debut)}`;
  return fin ? `${texte} – ${formatHeure(fin)}` : texte;
}

export function formatRelatif(instant: string): string {
  const ecart = Date.now() - new Date(instant).getTime();
  const minutes = Math.round(ecart / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.round(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  const jours = Math.round(heures / 24);
  if (jours < 14) return `il y a ${jours} j`;
  return formatDateCourte(instant);
}
