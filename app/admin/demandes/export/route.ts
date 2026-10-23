import { NextResponse } from "next/server";
import { utilisateurCourant } from "@/lib/auth";
import { supabaseAdmin, supabaseConfigure } from "@/lib/supabase";
import { STATUTS } from "@/lib/constantes";
import { formatCreneau, formatDateCourte } from "@/lib/temps";
import type { Demande, StatutDemande } from "@/lib/types";

export const dynamic = "force-dynamic";

function cellule(valeur: string | null | undefined): string {
  let texte = valeur ?? "";
  if (/^[=+\-@]/.test(texte)) texte = `'${texte}`;
  return `"${texte.replace(/"/g, '""')}"`;
}

export async function GET(requete: Request) {
  const utilisateur = await utilisateurCourant();
  if (!utilisateur) return new NextResponse("Accès refusé", { status: 403 });
  if (!supabaseConfigure()) return new NextResponse("Supabase non configuré", { status: 503 });

  const statut = new URL(requete.url).searchParams.get("statut");
  let q = supabaseAdmin().from("demandes").select("*").order("created_at", { ascending: false });
  if (statut && statut in STATUTS) q = q.eq("statut", statut);
  const { data, error } = await q;
  if (error) return new NextResponse("Erreur", { status: 500 });

  const entetes = ["Reçue le", "Prénom", "Nom", "E-mail", "Nature du projet", "Précisions", "Créneau", "Statut", "Photo", "Note interne"];
  const lignes = ((data ?? []) as Demande[]).map((d) =>
    [
      formatDateCourte(d.created_at),
      d.prenom,
      d.nom,
      d.email,
      d.nature_projet,
      d.description,
      d.creneau_debut ? formatCreneau(d.creneau_debut, d.creneau_fin) : "À convenir",
      STATUTS[d.statut as StatutDemande]?.libelle ?? d.statut,
      d.photo_path ? "Oui" : "Non",
      d.note_interne,
    ]
      .map(cellule)
      .join(";")
  );

  const contenu = "﻿" + [entetes.join(";"), ...lignes].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(contenu, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="demandes-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
