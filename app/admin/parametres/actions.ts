"use server";

import { revalidatePath } from "next/cache";
import { verifierAcces } from "@/lib/auth";
import { retour, texte } from "@/lib/admin";
import { journaliser } from "@/lib/journal";
import { supabaseAdmin } from "@/lib/supabase";
import { emailLibre } from "@/lib/email";
import type { Demande } from "@/lib/types";

const RETOUR = "/admin/parametres";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function enregistrerParametres(formData: FormData) {
  const utilisateur = await verifierAcces("admin");
  const champs = {
    entreprise_nom: texte(formData, "entreprise_nom"),
    dirigeant: texte(formData, "dirigeant"),
    telephone: texte(formData, "telephone"),
    email_contact: texte(formData, "email_contact"),
    email_notifications: texte(formData, "email_notifications"),
    zone_intervention: texte(formData, "zone_intervention"),
    horaires: texte(formData, "horaires"),
  };
  if (Object.values(champs).some((v) => !v)) retour(RETOUR, "Tous les champs sont obligatoires.", "danger");
  if (!EMAIL.test(champs.email_contact) || !EMAIL.test(champs.email_notifications)) {
    retour(RETOUR, "Adresse e-mail invalide.", "danger");
  }
  await supabaseAdmin().from("parametres").update({ ...champs, updated_at: new Date().toISOString() }).eq("id", 1);
  await journaliser(utilisateur.email, "Paramètres du site modifiés");
  revalidatePath("/", "layout");
  retour(RETOUR, "Paramètres enregistrés : le site est à jour.");
}

export async function envoyerEmailTest(formData: FormData) {
  const utilisateur = await verifierAcces("admin");
  const destinataire = texte(formData, "destinataire") || utilisateur.email;
  const faux = { prenom: utilisateur.nom, nom: "", email: destinataire } as Demande;
  const ok = await emailLibre(faux, "E-mail de test — JC Habitat Solutions", "Si vous lisez ce message, l'envoi d'e-mails via Resend fonctionne correctement.");
  retour(
    RETOUR,
    ok ? `E-mail de test envoyé à ${destinataire}.` : "Échec de l'envoi : vérifiez RESEND_API_KEY, EMAIL_FROM et le domaine vérifié dans Resend.",
    ok ? "success" : "danger"
  );
}
