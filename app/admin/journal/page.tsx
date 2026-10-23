import Link from "next/link";
import { exigerAdmin } from "@/lib/auth";
import { supabaseAdmin, supabaseConfigure } from "@/lib/supabase";
import { formatDateCourte, formatHeure } from "@/lib/temps";
import type { EntreeJournal } from "@/lib/types";

export const metadata = { title: "Journal d'activité" };

const PAR_PAGE = 50;

export default async function PageJournal({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await exigerAdmin();
  const page = Math.max(1, Number.parseInt((await searchParams).page ?? "1", 10) || 1);
  let entrees: EntreeJournal[] = [];
  let total = 0;
  if (supabaseConfigure()) {
    const { data, count } = await supabaseAdmin()
      .from("journal")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * PAR_PAGE, page * PAR_PAGE - 1);
    entrees = (data ?? []) as EntreeJournal[];
    total = count ?? 0;
  }
  const totalPages = Math.max(1, Math.ceil(total / PAR_PAGE));

  return (
    <>
      <div className="app-topbar">
        <div>
          <h1>Journal d&apos;activité</h1>
          <p className="sub">Toutes les actions effectuées dans le back-office, par qui et quand.</p>
        </div>
      </div>
      <div className="panel">
        <div className="table-defilante">
          <table>
            <thead><tr><th>Date</th><th>Auteur</th><th>Action</th><th>Détails</th></tr></thead>
            <tbody>
              {entrees.map((e) => (
                <tr key={e.id}>
                  <td className="cellule-date">{formatDateCourte(e.created_at)} {formatHeure(e.created_at)}</td>
                  <td>{e.auteur}</td>
                  <td className="cell-primary">{e.action}</td>
                  <td className="cell-sub">{e.details}</td>
                </tr>
              ))}
              {entrees.length === 0 && <tr><td colSpan={4} className="panel-vide">Aucune activité enregistrée.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="panel-foot">
          <span>{total} action(s)</span>
          {totalPages > 1 && (
            <div className="pagination">
              {page > 1 && <Link href={`/admin/journal?page=${page - 1}`} className="btn btn-outline btn-sm">Précédent</Link>}
              <span>Page {page} / {totalPages}</span>
              {page < totalPages && <Link href={`/admin/journal?page=${page + 1}`} className="btn btn-outline btn-sm">Suivant</Link>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
