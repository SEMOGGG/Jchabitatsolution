"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { verifierAcces } from "@/lib/auth";
import { booleen, retour, texte, texteOuNull } from "@/lib/admin";
import { journaliser } from "@/lib/journal";
import { supabaseAdmin, urlPubliqueGalerie, BUCKET_GALERIE } from "@/lib/supabase";
import { TAILLE_MAX_IMAGE, TYPES_IMAGE } from "@/lib/constantes";
import type { ElementGalerie, ResultatAction } from "@/lib/types";

const RETOUR = "/admin/galerie";

function rafraichir() {
  revalidatePath("/");
  revalidatePath("/galerie");
  revalidatePath("/admin/galerie");
}

async function televerser(fichier: FormDataEntryValue | null): Promise<{ chemin: string; url: string } | string> {
  if (!(fichier instanceof File) || fichier.size === 0) return "Aucune image reçue.";
  if (!TYPES_IMAGE.includes(fichier.type)) return "Format non supporté (JPG, PNG ou WEBP).";
  if (fichier.size > TAILLE_MAX_IMAGE) return "Image trop lourde (4 Mo maximum après compression).";
  const extension = fichier.type === "image/png" ? "png" : fichier.type === "image/webp" ? "webp" : "jpg";
  const chemin = `${new Date().getFullYear()}/${randomUUID()}.${extension}`;
  const { error } = await supabaseAdmin()
    .storage.from(BUCKET_GALERIE)
    .upload(chemin, Buffer.from(await fichier.arrayBuffer()), { contentType: fichier.type, cacheControl: "31536000" });
  if (error) return "Erreur lors de l'envoi de l'image.";
  return { chemin, url: urlPubliqueGalerie(chemin) };
}

async function prochainOrdre(): Promise<number> {
  const { data } = await supabaseAdmin().from("galerie").select("ordre").order("ordre", { ascending: false }).limit(1);
  return ((data?.[0]?.ordre as number | undefined) ?? 0) + 1;
}

export async function ajouterPhoto(formData: FormData): Promise<ResultatAction> {
  try {
    const utilisateur = await verifierAcces();
    const categorie = texte(formData, "categorie");
    if (!categorie) return { ok: false, message: "Choisissez une catégorie." };
    const resultat = await televerser(formData.get("image"));
    if (typeof resultat === "string") return { ok: false, message: resultat };

    const { error } = await supabaseAdmin().from("galerie").insert({
      titre: texte(formData, "titre") || categorie,
      categorie,
      lieu: texteOuNull(formData, "lieu"),
      description: texteOuNull(formData, "description"),
      type: "photo",
      image_url: resultat.url,
      storage_paths: [resultat.chemin],
      en_avant: booleen(formData, "en_avant"),
      ordre: await prochainOrdre(),
    });
    if (error) {
      await supabaseAdmin().storage.from(BUCKET_GALERIE).remove([resultat.chemin]);
      return { ok: false, message: "Erreur lors de l'enregistrement." };
    }
    await journaliser(utilisateur.email, "Photo ajoutée à la galerie", categorie);
    rafraichir();
    return { ok: true, message: "Photo ajoutée." };
  } catch (erreur) {
    return { ok: false, message: erreur instanceof Error ? erreur.message : "Erreur inattendue." };
  }
}

export async function ajouterAvantApres(formData: FormData): Promise<ResultatAction> {
  try {
    const utilisateur = await verifierAcces();
    const categorie = texte(formData, "categorie");
    const titre = texte(formData, "titre");
    if (!categorie || !titre) return { ok: false, message: "Le titre et la catégorie sont obligatoires." };
    const avant = await televerser(formData.get("image_avant"));
    if (typeof avant === "string") return { ok: false, message: `Photo « avant » : ${avant}` };
    const apres = await televerser(formData.get("image_apres"));
    if (typeof apres === "string") {
      await supabaseAdmin().storage.from(BUCKET_GALERIE).remove([avant.chemin]);
      return { ok: false, message: `Photo « après » : ${apres}` };
    }
    const { error } = await supabaseAdmin().from("galerie").insert({
      titre,
      categorie,
      lieu: texteOuNull(formData, "lieu"),
      description: texteOuNull(formData, "description"),
      type: "avant_apres",
      image_url: apres.url,
      image_avant_url: avant.url,
      image_apres_url: apres.url,
      storage_paths: [avant.chemin, apres.chemin],
      en_avant: booleen(formData, "en_avant"),
      ordre: await prochainOrdre(),
    });
    if (error) {
      await supabaseAdmin().storage.from(BUCKET_GALERIE).remove([avant.chemin, apres.chemin]);
      return { ok: false, message: "Erreur lors de l'enregistrement." };
    }
    await journaliser(utilisateur.email, "Avant / après ajouté à la galerie", titre);
    rafraichir();
    return { ok: true, message: "Comparatif avant / après ajouté." };
  } catch (erreur) {
    return { ok: false, message: erreur instanceof Error ? erreur.message : "Erreur inattendue." };
  }
}

export async function modifierElement(formData: FormData) {
  await verifierAcces();
  const id = texte(formData, "id");
  const titre = texte(formData, "titre");
  const categorie = texte(formData, "categorie");
  if (!titre || !categorie) retour(RETOUR, "Le titre et la catégorie sont obligatoires.", "danger");
  await supabaseAdmin()
    .from("galerie")
    .update({
      titre,
      categorie,
      lieu: texteOuNull(formData, "lieu"),
      description: texteOuNull(formData, "description"),
      visible: booleen(formData, "visible"),
      en_avant: booleen(formData, "en_avant"),
    })
    .eq("id", id);
  rafraichir();
  retour(RETOUR, "Élément mis à jour.");
}

export async function basculerChamp(formData: FormData) {
  await verifierAcces();
  const id = texte(formData, "id");
  const champ = texte(formData, "champ");
  if (champ !== "visible" && champ !== "en_avant") retour(RETOUR, "Action invalide.", "danger");
  const valeur = booleen(formData, "valeur");
  await supabaseAdmin().from("galerie").update({ [champ]: !valeur }).eq("id", id);
  rafraichir();
  retour(RETOUR, "Élément mis à jour.");
}

export async function deplacerElement(formData: FormData) {
  await verifierAcces();
  const id = texte(formData, "id");
  const sens = texte(formData, "sens");
  const supabase = supabaseAdmin();
  const { data } = await supabase.from("galerie").select("id, ordre").order("ordre").order("created_at", { ascending: false });
  const liste = (data ?? []) as Pick<ElementGalerie, "id" | "ordre">[];
  const index = liste.findIndex((e) => e.id === id);
  const cible = sens === "haut" ? index - 1 : index + 1;
  if (index < 0 || cible < 0 || cible >= liste.length) retour(RETOUR, "Déplacement impossible.", "info");
  [liste[index], liste[cible]] = [liste[cible], liste[index]];
  await Promise.all(liste.map((e, i) => (e.ordre !== i + 1 ? supabase.from("galerie").update({ ordre: i + 1 }).eq("id", e.id) : null)));
  rafraichir();
  retour(RETOUR, "Ordre mis à jour.");
}

export async function supprimerElement(formData: FormData) {
  const utilisateur = await verifierAcces();
  const id = texte(formData, "id");
  const supabase = supabaseAdmin();
  const { data } = await supabase.from("galerie").select("titre, storage_paths").eq("id", id).maybeSingle();
  if (!data) retour(RETOUR, "Élément introuvable.", "danger");
  const chemins = (data.storage_paths as string[]) ?? [];
  if (chemins.length) await supabase.storage.from(BUCKET_GALERIE).remove(chemins);
  await supabase.from("galerie").delete().eq("id", id);
  await journaliser(utilisateur.email, "Élément supprimé de la galerie", data.titre as string);
  rafraichir();
  retour(RETOUR, "Élément supprimé.");
}
