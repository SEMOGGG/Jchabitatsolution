"use server";

import { revalidatePath } from "next/cache";
import { verifierAcces } from "@/lib/auth";
import { retour, texte } from "@/lib/admin";
import { journaliser } from "@/lib/journal";
import { supabaseAdmin, BUCKET_DEMANDES } from "@/lib/supabase";
import { creneauEstLibre } from "@/lib/creneaux";
import { emailLibre, emailRdvAnnule, emailRdvConfirme } from "@/lib/email";
import { STATUTS } from "@/lib/constantes";
import { formatCreneau } from "@/lib/temps";
import type { Demande, StatutDemande } from "@/lib/types";

async function lireDemande(id: string): Promise<Demande | null> {
  const { data } = await supabaseAdmin().from("demandes").select("*").eq("id", id).maybeSingle();
  return (data as Demande) ?? null;
}

function rafraichir(id?: string) {
  revalidatePath("/admin", "layout");
  if (id) revalidatePath(`/admin/demandes/${id}`);
}

export async function changerStatut(formData: FormData) {
  const utilisateur = await verifierAcces();
  const id = texte(formData, "id");
  const statut = texte(formData, "statut") as StatutDemande;
  if (!(statut in STATUTS)) retour(`/admin/demandes/${id}`, "Statut invalide.", "danger");

  const { error } = await supabaseAdmin().from("demandes").update({ statut }).eq("id", id);
  if (error) {
    const message = error.code === "23505" ? "Impossible de réactiver : le créneau a été repris par une autre demande." : "Erreur lors de la mise à jour.";
    retour(`/admin/demandes/${id}`, message, "danger");
  }
  await journaliser(utilisateur.email, "Statut de demande modifié", `${id} → ${STATUTS[statut].libelle}`);
  rafraichir(id);
  retour(`/admin/demandes/${id}`, `Statut mis à jour : ${STATUTS[statut].libelle}.`);
}

export async function enregistrerNote(formData: FormData) {
  await verifierAcces();
  const id = texte(formData, "id");
  const note = texte(formData, "note_interne");
  await supabaseAdmin().from("demandes").update({ note_interne: note || null }).eq("id", id);
  rafraichir(id);
  retour(`/admin/demandes/${id}`, "Note enregistrée.");
}

export async function confirmerRdv(formData: FormData) {
  const utilisateur = await verifierAcces();
  const id = texte(formData, "id");
  const demande = await lireDemande(id);
  if (!demande || !demande.creneau_debut) retour(`/admin/demandes/${id}`, "Cette demande n'a pas de créneau à confirmer.", "danger");

  await supabaseAdmin().from("demandes").update({ statut: "confirmee" }).eq("id", id);
  const envoye = await emailRdvConfirme({ ...demande, statut: "confirmee" });
  await journaliser(utilisateur.email, "RDV confirmé", `${demande.prenom} ${demande.nom} — ${formatCreneau(demande.creneau_debut, demande.creneau_fin)}`);
  rafraichir(id);
  retour(
    `/admin/demandes/${id}`,
    envoye ? "Rendez-vous confirmé, e-mail envoyé au client." : "Rendez-vous confirmé, mais l'e-mail n'a pas pu partir (vérifier Resend).",
    envoye ? "success" : "danger"
  );
}

export async function annulerRdv(formData: FormData) {
  const utilisateur = await verifierAcces();
  const id = texte(formData, "id");
  const motif = texte(formData, "motif");
  const prevenir = formData.get("prevenir") === "on";
  const demande = await lireDemande(id);
  if (!demande) retour("/admin/demandes", "Demande introuvable.", "danger");

  await supabaseAdmin().from("demandes").update({ statut: "annulee" }).eq("id", id);
  let envoye = true;
  if (prevenir && demande.creneau_debut) envoye = await emailRdvAnnule(demande, motif || undefined);
  await journaliser(utilisateur.email, "RDV annulé", `${demande.prenom} ${demande.nom}${motif ? ` — ${motif}` : ""}`);
  rafraichir(id);
  retour(
    `/admin/demandes/${id}`,
    envoye ? "Demande annulée, le créneau est de nouveau disponible." : "Demande annulée, mais l'e-mail au client n'a pas pu partir.",
    envoye ? "success" : "danger"
  );
}

export async function deplacerRdv(formData: FormData) {
  const utilisateur = await verifierAcces();
  const id = texte(formData, "id");
  const nouveau = texte(formData, "creneau");
  const prevenir = formData.get("prevenir") === "on";
  const demande = await lireDemande(id);
  if (!demande) retour("/admin/demandes", "Demande introuvable.", "danger");
  if (!nouveau) retour(`/admin/demandes/${id}`, "Choisissez un nouveau créneau.", "danger");

  const disponibilite = await creneauEstLibre(new Date(nouveau).toISOString());
  if (!disponibilite.libre) retour(`/admin/demandes/${id}`, "Ce créneau n'est plus disponible.", "danger");

  const { data, error } = await supabaseAdmin()
    .from("demandes")
    .update({ creneau_debut: new Date(nouveau).toISOString(), creneau_fin: disponibilite.fin, statut: "confirmee" })
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) retour(`/admin/demandes/${id}`, "Le créneau vient d'être pris, choisissez-en un autre.", "danger");

  let envoye = true;
  if (prevenir) envoye = await emailRdvConfirme(data as Demande);
  await journaliser(utilisateur.email, "RDV déplacé", `${demande.prenom} ${demande.nom} → ${formatCreneau(nouveau, null)}`);
  rafraichir(id);
  retour(`/admin/demandes/${id}`, envoye ? "Rendez-vous déplacé et confirmé." : "Rendez-vous déplacé, mais l'e-mail n'a pas pu partir.", envoye ? "success" : "danger");
}

export async function envoyerEmail(formData: FormData) {
  const utilisateur = await verifierAcces();
  const id = texte(formData, "id");
  const sujet = texte(formData, "sujet");
  const message = texte(formData, "message");
  const marquerDevis = formData.get("marquer_devis") === "on";
  const demande = await lireDemande(id);
  if (!demande) retour("/admin/demandes", "Demande introuvable.", "danger");
  if (!sujet || !message) retour(`/admin/demandes/${id}`, "Le sujet et le message sont obligatoires.", "danger");

  const envoye = await emailLibre(demande, sujet, message);
  if (!envoye) retour(`/admin/demandes/${id}`, "L'e-mail n'a pas pu être envoyé (vérifier la configuration Resend).", "danger");

  const historique = `[${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}] E-mail envoyé : ${sujet}`;
  await supabaseAdmin()
    .from("demandes")
    .update({
      note_interne: demande.note_interne ? `${demande.note_interne}\n${historique}` : historique,
      ...(marquerDevis ? { statut: "devis_envoye" } : {}),
    })
    .eq("id", id);
  await journaliser(utilisateur.email, "E-mail envoyé à un client", `${demande.email} — ${sujet}`);
  rafraichir(id);
  retour(`/admin/demandes/${id}`, "E-mail envoyé au client.");
}

export async function supprimerDemande(formData: FormData) {
  const utilisateur = await verifierAcces("admin");
  const id = texte(formData, "id");
  const demande = await lireDemande(id);
  if (!demande) retour("/admin/demandes", "Demande introuvable.", "danger");
  if (demande.photo_path) await supabaseAdmin().storage.from(BUCKET_DEMANDES).remove([demande.photo_path]);
  await supabaseAdmin().from("demandes").delete().eq("id", id);
  await journaliser(utilisateur.email, "Demande supprimée", `${demande.prenom} ${demande.nom} (${demande.email})`);
  rafraichir();
  retour("/admin/demandes", "Demande supprimée définitivement.");
}
