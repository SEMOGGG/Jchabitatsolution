import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type Role = "admin" | "editeur";

export type UtilisateurBackOffice = {
  id: string;
  email: string;
  nom: string;
  role: Role;
  imageUrl: string;
};

function emailsAdmin(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function roleDepuisMetadonnees(email: string, metadonnees: Record<string, unknown> | undefined): Role | null {
  if (emailsAdmin().includes(email.toLowerCase())) return "admin";
  const role = metadonnees?.role;
  if (role === "admin" || role === "editeur") return role;
  return null;
}

export async function utilisateurCourant(): Promise<UtilisateurBackOffice | null> {
  const utilisateur = await currentUser();
  if (!utilisateur) return null;
  const email = utilisateur.primaryEmailAddress?.emailAddress ?? utilisateur.emailAddresses[0]?.emailAddress ?? "";
  const role = roleDepuisMetadonnees(email, utilisateur.publicMetadata as Record<string, unknown>);
  if (!role) return null;
  return {
    id: utilisateur.id,
    email,
    nom: [utilisateur.firstName, utilisateur.lastName].filter(Boolean).join(" ") || email,
    role,
    imageUrl: utilisateur.imageUrl,
  };
}

export async function exigerAcces(): Promise<UtilisateurBackOffice> {
  const utilisateur = await utilisateurCourant();
  if (!utilisateur) redirect("/acces-refuse");
  return utilisateur;
}

export async function exigerAdmin(): Promise<UtilisateurBackOffice> {
  const utilisateur = await exigerAcces();
  if (utilisateur.role !== "admin") redirect("/admin?message=reserve-admin");
  return utilisateur;
}

export class AccesRefuse extends Error {}

export async function verifierAcces(roleRequis: Role = "editeur"): Promise<UtilisateurBackOffice> {
  const utilisateur = await utilisateurCourant();
  if (!utilisateur) throw new AccesRefuse("Accès refusé.");
  if (roleRequis === "admin" && utilisateur.role !== "admin") throw new AccesRefuse("Action réservée aux administrateurs.");
  return utilisateur;
}
