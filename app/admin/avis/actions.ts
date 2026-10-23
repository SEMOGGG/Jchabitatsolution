"use server";

import { revalidatePath } from "next/cache";
import { verifierAcces } from "@/lib/auth";
import { booleen, entier, retour, texte, texteOuNull } from "@/lib/admin";
import { journaliser } from "@/lib/journal";
import { supabaseAdmin } from "@/lib/supabase";

const RETOUR = "/admin/avis";

function rafraichir() {
  revalidatePath("/");
  revalidatePath(RETOUR);
}

function lireChamps(formData: FormData) {
  const nom = texte(formData, "nom_client");
  const avisTexte = texte(formData, "texte");
  const note = Math.min(5, Math.max(1, entier(formData, "note", 5)));
  if (!nom || !avisTexte) retour(RETOUR, "Le nom et le texte de l'avis sont obligatoires.", "danger");
  return { nom_client: nom, fonction: texteOuNull(formData, "fonction"), texte: avisTexte, note };
}

export async function ajouterAvis(formData: FormData) {
  const utilisateur = await verifierAcces();
  const champs = lireChamps(formData);
  const { data } = await supabaseAdmin().from("avis").select("ordre").order("ordre", { ascending: false }).limit(1);
  await supabaseAdmin().from("avis").insert({ ...champs, ordre: ((data?.[0]?.ordre as number) ?? 0) + 1 });
  await journaliser(utilisateur.email, "Avis ajouté", champs.nom_client);
  rafraichir();
  retour(RETOUR, "Avis ajouté.");
}

export async function modifierAvis(formData: FormData) {
  await verifierAcces();
  const id = texte(formData, "id");
  const champs = lireChamps(formData);
  await supabaseAdmin().from("avis").update({ ...champs, visible: booleen(formData, "visible") }).eq("id", id);
  rafraichir();
  retour(RETOUR, "Avis mis à jour.");
}

export async function basculerAvis(formData: FormData) {
  await verifierAcces();
  const id = texte(formData, "id");
  const visible = booleen(formData, "visible");
  await supabaseAdmin().from("avis").update({ visible: !visible }).eq("id", id);
  rafraichir();
  retour(RETOUR, visible ? "Avis masqué." : "Avis affiché.");
}

export async function supprimerAvis(formData: FormData) {
  const utilisateur = await verifierAcces();
  const id = texte(formData, "id");
  await supabaseAdmin().from("avis").delete().eq("id", id);
  await journaliser(utilisateur.email, "Avis supprimé");
  rafraichir();
  retour(RETOUR, "Avis supprimé.");
}
