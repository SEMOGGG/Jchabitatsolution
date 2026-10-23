import "server-only";
import { supabaseAdmin, supabaseConfigure } from "./supabase";
import { PARAMETRES_DEFAUT } from "./constantes";
import type { Avis, ElementGalerie, Parametres } from "./types";

const GALERIE_DEFAUT: ElementGalerie[] = [
  ["Salon Maxime", "Salons & instituts", "Roissy-en-Brie", "/images/realisation-salon-maxime.jpg"],
  ["Remise en état des marches de la mairie", "Façades & remise en état", "Sceaux", "/images/realisation-mairie-marches.jpg"],
  ["Nettoyage d'une statue en pierre", "Façades & remise en état", "Sceaux", "/images/realisation-statue.jpg"],
  ["École — vitrerie, remise en état & décapage des sols", "Collectivités & bâtiments publics", "2 684 m²", "/images/realisation-ecole.jpg"],
].map(([titre, categorie, lieu, image], index) => ({
  id: `defaut-${index}`,
  created_at: new Date(0).toISOString(),
  titre,
  categorie,
  lieu,
  description: null,
  type: "photo" as const,
  image_url: image,
  image_avant_url: null,
  image_apres_url: null,
  storage_paths: [],
  en_avant: true,
  visible: true,
  ordre: index,
}));

export async function lireParametres(): Promise<Parametres> {
  if (!supabaseConfigure()) return PARAMETRES_DEFAUT;
  const { data, error } = await supabaseAdmin().from("parametres").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return PARAMETRES_DEFAUT;
  return { ...PARAMETRES_DEFAUT, ...(data as Parametres) };
}

export async function lireGalerie(options: { seulementEnAvant?: boolean; limite?: number } = {}): Promise<ElementGalerie[]> {
  if (!supabaseConfigure()) {
    return options.limite ? GALERIE_DEFAUT.slice(0, options.limite) : GALERIE_DEFAUT;
  }
  let requete = supabaseAdmin()
    .from("galerie")
    .select("*")
    .eq("visible", true)
    .order("ordre", { ascending: true })
    .order("created_at", { ascending: false });
  if (options.seulementEnAvant) requete = requete.eq("en_avant", true);
  if (options.limite) requete = requete.limit(options.limite);
  const { data, error } = await requete;
  if (error) return [];
  return (data ?? []) as ElementGalerie[];
}

export async function lireAvisVisibles(): Promise<Avis[]> {
  if (!supabaseConfigure()) return [];
  const { data, error } = await supabaseAdmin()
    .from("avis")
    .select("*")
    .eq("visible", true)
    .order("ordre", { ascending: true });
  if (error) return [];
  return (data ?? []) as Avis[];
}
