import { NextResponse } from "next/server";
import { creneauxDisponibles } from "@/lib/creneaux";
import { supabaseConfigure } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!supabaseConfigure()) {
    return NextResponse.json({ ouvert: false, jours: [], configure: false }, { headers: { "Cache-Control": "no-store" } });
  }
  try {
    const resultat = await creneauxDisponibles();
    return NextResponse.json({ ...resultat, configure: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (erreur) {
    console.error("Erreur créneaux :", erreur);
    return NextResponse.json({ ouvert: false, jours: [], erreur: true }, { status: 500 });
  }
}
