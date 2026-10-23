import "server-only";
import { redirect } from "next/navigation";

export type TypeFlash = "success" | "danger" | "info";

export function retour(chemin: string, message: string, type: TypeFlash = "success"): never {
  const separateur = chemin.includes("?") ? "&" : "?";
  redirect(`${chemin}${separateur}message=${encodeURIComponent(message)}&type=${type}`);
}

export function texte(formData: FormData, cle: string): string {
  const valeur = formData.get(cle);
  return typeof valeur === "string" ? valeur.trim() : "";
}

export function texteOuNull(formData: FormData, cle: string): string | null {
  const valeur = texte(formData, cle);
  return valeur === "" ? null : valeur;
}

export function booleen(formData: FormData, cle: string): boolean {
  return formData.get(cle) === "on" || formData.get(cle) === "true";
}

export function entier(formData: FormData, cle: string, defaut = 0): number {
  const valeur = Number.parseInt(texte(formData, cle), 10);
  return Number.isFinite(valeur) ? valeur : defaut;
}
