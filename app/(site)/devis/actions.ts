"use server";

import { createHash, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseAdmin, supabaseConfigure, BUCKET_DEMANDES } from "@/lib/supabase";
import { creneauEstLibre } from "@/lib/creneaux";
import { emailAccuseReceptionClient, emailNouvelleDemandeAdmin } from "@/lib/email";
import { NATURES_PROJET, TAILLE_MAX_IMAGE, TYPES_IMAGE } from "@/lib/constantes";
import type { Demande } from "@/lib/types";

export type ResultatDemande = {
  ok: boolean;
  message: string;
  creneauPris?: boolean;
  creneau?: string | null;
};

const schema = z.object({
  nature_projet: z.enum(NATURES_PROJET, { errorMap: () => ({ message: "Choisissez la nature du projet." }) }),
  description: z.string().trim().max(2000, "Votre message est trop long (2000 caractères maximum).").optional(),
  prenom: z.string().trim().min(1, "Le prénom est obligatoire.").max(80),
  nom: z.string().trim().min(1, "Le nom est obligatoire.").max(80),
  email: z.string().trim().toLowerCase().email("L'adresse e-mail n'est pas valide.").max(190),
  creneau: z.string().trim().optional(),
  consentement: z.literal("on", { errorMap: () => ({ message: "Merci d'accepter le traitement de vos données." }) }),
});

async function empreinteIp(): Promise<string> {
  const entetes = await headers();
  const ip = (entetes.get("x-forwarded-for") ?? entetes.get("x-real-ip") ?? "inconnue").split(",")[0].trim();
  const sel = process.env.CLERK_SECRET_KEY ?? "jc-habitat";
  return createHash("sha256").update(`${ip}:${sel}`).digest("hex").slice(0, 32);
}

export async function soumettreDemande(formData: FormData): Promise<ResultatDemande> {
  if (formData.get("site_web")) {
    return { ok: true, message: "Merci, votre demande a été envoyée." };
  }

  if (!supabaseConfigure()) {
    return { ok: false, message: "Le service de réservation n'est pas encore configuré. Merci de nous contacter par e-mail ou téléphone." };
  }

  const verification = schema.safeParse({
    nature_projet: formData.get("nature_projet"),
    description: formData.get("description") || undefined,
    prenom: formData.get("prenom"),
    nom: formData.get("nom"),
    email: formData.get("email"),
    creneau: formData.get("creneau") || undefined,
    consentement: formData.get("consentement"),
  });

  if (!verification.success) {
    return { ok: false, message: verification.error.issues[0]?.message ?? "Merci de vérifier le formulaire." };
  }
  const donnees = verification.data;
  const supabase = supabaseAdmin();
  const ipHash = await empreinteIp();

  const uneHeure = new Date(Date.now() - 3600000).toISOString();
  const { count } = await supabase
    .from("demandes")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", uneHeure);
  if ((count ?? 0) >= 3) {
    return { ok: false, message: "Trop de demandes envoyées en peu de temps. Merci de réessayer dans une heure ou de nous écrire directement." };
  }

  let creneauDebut: string | null = null;
  let creneauFin: string | null = null;
  if (donnees.creneau) {
    const debut = new Date(donnees.creneau);
    if (Number.isNaN(debut.getTime())) {
      return { ok: false, message: "Créneau invalide, merci d'en choisir un autre." };
    }
    const disponibilite = await creneauEstLibre(debut.toISOString());
    if (!disponibilite.libre) {
      return { ok: false, creneauPris: true, message: "Ce créneau vient d'être réservé ou n'est plus disponible. Le planning a été mis à jour, choisissez-en un autre." };
    }
    creneauDebut = debut.toISOString();
    creneauFin = disponibilite.fin ?? null;
  }

  const id = randomUUID();
  let photoPath: string | null = null;
  let pieceJointe: { filename: string; content: Buffer } | undefined;
  const photo = formData.get("photo");

  if (photo instanceof File && photo.size > 0) {
    if (!TYPES_IMAGE.includes(photo.type)) {
      return { ok: false, message: "La photo doit être au format JPG, PNG ou WEBP." };
    }
    if (photo.size > TAILLE_MAX_IMAGE) {
      return { ok: false, message: "La photo est trop lourde (4 Mo maximum)." };
    }
    const extension = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
    const contenu = Buffer.from(await photo.arrayBuffer());
    photoPath = `${id}/photo.${extension}`;
    const { error: erreurUpload } = await supabase.storage
      .from(BUCKET_DEMANDES)
      .upload(photoPath, contenu, { contentType: photo.type, upsert: false });
    if (erreurUpload) {
      console.error("Upload photo :", erreurUpload);
      return { ok: false, message: "La photo n'a pas pu être envoyée. Réessayez sans photo ou avec une image plus légère." };
    }
    pieceJointe = { filename: `photo-${donnees.nom.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${extension}`, content: contenu };
  }

  const { data: demande, error } = await supabase
    .from("demandes")
    .insert({
      id,
      nature_projet: donnees.nature_projet,
      description: donnees.description ?? null,
      prenom: donnees.prenom,
      nom: donnees.nom,
      email: donnees.email,
      photo_path: photoPath,
      creneau_debut: creneauDebut,
      creneau_fin: creneauFin,
      ip_hash: ipHash,
    })
    .select("*")
    .single();

  if (error || !demande) {
    if (photoPath) await supabase.storage.from(BUCKET_DEMANDES).remove([photoPath]);
    if (error?.code === "23505") {
      return { ok: false, creneauPris: true, message: "Ce créneau vient d'être réservé par quelqu'un d'autre. Choisissez-en un autre." };
    }
    console.error("Insertion demande :", error);
    return { ok: false, message: "Une erreur est survenue, merci de réessayer dans quelques instants." };
  }

  await Promise.allSettled([
    emailNouvelleDemandeAdmin(demande as Demande, pieceJointe),
    emailAccuseReceptionClient(demande as Demande),
  ]);

  revalidatePath("/admin");
  revalidatePath("/admin/demandes");
  revalidatePath("/admin/planning");

  return { ok: true, message: "Votre demande a bien été envoyée.", creneau: creneauDebut };
}
