import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function supabaseConfigure(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function supabaseAdmin(): SupabaseClient {
  if (!supabaseConfigure()) {
    throw new Error("Supabase n'est pas configuré : renseigner SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.");
  }
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export const BUCKET_GALERIE = "galerie";
export const BUCKET_DEMANDES = "demandes";

export function urlPubliqueGalerie(chemin: string): string {
  return supabaseAdmin().storage.from(BUCKET_GALERIE).getPublicUrl(chemin).data.publicUrl;
}
