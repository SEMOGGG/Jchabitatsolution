"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { verifierAcces } from "@/lib/auth";
import { retour, texte } from "@/lib/admin";
import { journaliser } from "@/lib/journal";

const RETOUR = "/admin/utilisateurs";

function urlSite(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function messageErreurClerk(erreur: unknown): string {
  const details = (erreur as { errors?: { longMessage?: string; message?: string }[] })?.errors?.[0];
  return details?.longMessage ?? details?.message ?? "Erreur Clerk.";
}

export async function inviterUtilisateur(formData: FormData) {
  const admin = await verifierAcces("admin");
  const email = texte(formData, "email").toLowerCase();
  const role = texte(formData, "role");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) retour(RETOUR, "Adresse e-mail invalide.", "danger");
  if (role !== "admin" && role !== "editeur") retour(RETOUR, "Rôle invalide.", "danger");

  try {
    const client = await clerkClient();
    await client.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: { role },
      redirectUrl: `${urlSite()}/connexion`,
      notify: true,
      ignoreExisting: true,
    });
  } catch (erreur) {
    retour(RETOUR, `Invitation impossible : ${messageErreurClerk(erreur)}`, "danger");
  }
  await journaliser(admin.email, "Invitation envoyée", `${email} (${role})`);
  revalidatePath(RETOUR);
  retour(RETOUR, `Invitation envoyée à ${email}.`);
}

export async function revoquerInvitation(formData: FormData) {
  const admin = await verifierAcces("admin");
  const id = texte(formData, "id");
  try {
    const client = await clerkClient();
    await client.invitations.revokeInvitation(id);
  } catch (erreur) {
    retour(RETOUR, `Révocation impossible : ${messageErreurClerk(erreur)}`, "danger");
  }
  await journaliser(admin.email, "Invitation révoquée", id);
  revalidatePath(RETOUR);
  retour(RETOUR, "Invitation révoquée.");
}

export async function changerRole(formData: FormData) {
  const admin = await verifierAcces("admin");
  const id = texte(formData, "id");
  const role = texte(formData, "role");
  if (id === admin.id) retour(RETOUR, "Vous ne pouvez pas modifier votre propre rôle.", "danger");
  if (!["admin", "editeur", "aucun"].includes(role)) retour(RETOUR, "Rôle invalide.", "danger");
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(id, { publicMetadata: { role: role === "aucun" ? null : role } });
  } catch (erreur) {
    retour(RETOUR, `Modification impossible : ${messageErreurClerk(erreur)}`, "danger");
  }
  await journaliser(admin.email, "Rôle modifié", `${id} → ${role}`);
  revalidatePath(RETOUR);
  retour(RETOUR, "Rôle mis à jour.");
}

export async function basculerBlocage(formData: FormData) {
  const admin = await verifierAcces("admin");
  const id = texte(formData, "id");
  const bloque = formData.get("bloque") === "true";
  if (id === admin.id) retour(RETOUR, "Vous ne pouvez pas bloquer votre propre compte.", "danger");
  try {
    const client = await clerkClient();
    if (bloque) await client.users.unbanUser(id);
    else await client.users.banUser(id);
  } catch (erreur) {
    retour(RETOUR, `Action impossible : ${messageErreurClerk(erreur)}`, "danger");
  }
  await journaliser(admin.email, bloque ? "Compte débloqué" : "Compte bloqué", id);
  revalidatePath(RETOUR);
  retour(RETOUR, bloque ? "Compte débloqué." : "Compte bloqué : il ne peut plus se connecter.");
}

export async function supprimerUtilisateur(formData: FormData) {
  const admin = await verifierAcces("admin");
  const id = texte(formData, "id");
  if (id === admin.id) retour(RETOUR, "Vous ne pouvez pas supprimer votre propre compte.", "danger");
  try {
    const client = await clerkClient();
    await client.users.deleteUser(id);
  } catch (erreur) {
    retour(RETOUR, `Suppression impossible : ${messageErreurClerk(erreur)}`, "danger");
  }
  await journaliser(admin.email, "Utilisateur supprimé", id);
  revalidatePath(RETOUR);
  retour(RETOUR, "Utilisateur supprimé.");
}
