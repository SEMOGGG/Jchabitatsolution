import "server-only";
import { supabaseAdmin } from "./supabase";

export async function journaliser(auteur: string, action: string, details?: string): Promise<void> {
  try {
    await supabaseAdmin().from("journal").insert({ auteur, action, details: details ?? null });
  } catch (erreur) {
    console.error("Journal indisponible :", erreur);
  }
}
