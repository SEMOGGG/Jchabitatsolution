import Link from "next/link";
import Icone from "@/components/Icone";
import Flash from "@/components/admin/Flash";
import { exigerAcces } from "@/lib/auth";
import { supabaseAdmin, supabaseConfigure } from "@/lib/supabase";
import { STATUTS } from "@/lib/constantes";
import { formatCreneau, formatDateCourte, formatRelatif } from "@/lib/temps";
import type { Demande, StatutDemande } from "@/lib/types";

export const metadata = { title: "Demandes" };

const PAR_PAGE = 25;

type Recherche = { statut?: string; q?: string; page?: string; message?: string; type?: string };

export default async function PageDemandes({ searchParams }: { searchParams: Promise<Recherche> }) {
  await exigerAcces();
  const params = await searchParams;
  const statut = params.statut && params.statut in STATUTS ? (params.statut as StatutDemande) : "tous";
  const recherche = (params.q ?? "").trim();
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  let demandes: Demande[] = [];
  let total = 0;
  const compteurs: Record<string, number> = {};

  if (supabaseConfigure()) {
    const supabase = supabaseAdmin();
    let requete = supabase.from("demandes").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (statut !== "tous") requete = requete.eq("statut", statut);
    if (recherche) {
      const motif = `%${recherche.replace(/[%_,()]/g, " ")}%`;
      requete = requete.or(`prenom.ilike.${motif},nom.ilike.${motif},email.ilike.${motif},nature_projet.ilike.${motif}`);
    }
    const { data, count } = await requete.range((page - 1) * PAR_PAGE, page * PAR_PAGE - 1);
    demandes = (data ?? []) as Demande[];
    total = count ?? 0;

    const tousStatuts = await supabase.from("demandes").select("statut");
    for (const ligne of tousStatuts.data ?? []) {
      compteurs[ligne.statut] = (compteurs[ligne.statut] ?? 0) + 1;
      compteurs.tous = (compteurs.tous ?? 0) + 1;
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAR_PAGE));
  const lien = (modifs: Partial<Recherche>) => {
    const p = new URLSearchParams();
    const s = modifs.statut ?? statut;
    const q = modifs.q ?? recherche;
    if (s && s !== "tous") p.set("statut", s);
    if (q) p.set("q", q);
    if (modifs.page && modifs.page !== "1") p.set("page", modifs.page);
    const chaine = p.toString();
    return `/admin/demandes${chaine ? `?${chaine}` : ""}`;
  };

  const onglets: { valeur: string; libelle: string }[] = [
    { valeur: "tous", libelle: "Toutes" },
    ...Object.entries(STATUTS).map(([valeur, s]) => ({ valeur, libelle: s.libelle })),
  ];

  return (
    <>
      <div className="app-topbar">
        <div>
          <h1>Demandes de devis</h1>
          <p className="sub">{compteurs.tous ?? 0} demande(s) au total · {compteurs.nouvelle ?? 0} à traiter</p>
        </div>
        <a href={`/admin/demandes/export${statut !== "tous" ? `?statut=${statut}` : ""}`} className="btn btn-outline btn-sm">
          <Icone nom="download" taille={16} /> Exporter en CSV
        </a>
      </div>

      <Flash message={params.message} type={params.type} />

      <div className="panel">
        <div className="panel-head">
          <div className="onglets-liens">
            {onglets.map((o) => (
              <Link key={o.valeur} href={lien({ statut: o.valeur, page: "1" })} className={`chip${statut === o.valeur ? " active" : ""}`}>
                {o.libelle} <span className="chip-nombre">{compteurs[o.valeur] ?? 0}</span>
              </Link>
            ))}
          </div>
          <form className="search-box" action="/admin/demandes">
            {statut !== "tous" && <input type="hidden" name="statut" value={statut} />}
            <Icone nom="search" taille={16} />
            <input type="search" name="q" placeholder="Nom, e-mail, projet…" defaultValue={recherche} />
          </form>
        </div>

        <div className="table-defilante">
          <table>
            <thead>
              <tr><th>Client</th><th>Projet</th><th>Créneau</th><th>Reçue</th><th>Statut</th><th></th></tr>
            </thead>
            <tbody>
              {demandes.map((d) => (
                <tr key={d.id} className={d.statut === "nouvelle" ? "ligne-nouvelle" : ""}>
                  <td>
                    <Link href={`/admin/demandes/${d.id}`} className="cell-primary">{d.prenom} {d.nom}</Link>
                    <div className="cell-sub">{d.email}</div>
                  </td>
                  <td>
                    {d.nature_projet}
                    {d.photo_path && <div className="cell-sub"><Icone nom="camera" taille={13} /> photo jointe</div>}
                  </td>
                  <td>{d.creneau_debut ? formatCreneau(d.creneau_debut, null) : <span className="text-muted">À convenir</span>}</td>
                  <td title={formatDateCourte(d.created_at)}>{formatRelatif(d.created_at)}</td>
                  <td><span className={`pill ${STATUTS[d.statut].classe}`}>{STATUTS[d.statut].libelle}</span></td>
                  <td className="row-actions">
                    <Link href={`/admin/demandes/${d.id}`} className="icon-btn" title="Ouvrir"><Icone nom="eye" taille={15} /></Link>
                  </td>
                </tr>
              ))}
              {demandes.length === 0 && (
                <tr><td colSpan={6} className="panel-vide">Aucune demande ne correspond à ces critères.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="panel-foot">
          <span>{total} résultat(s)</span>
          {totalPages > 1 && (
            <div className="pagination">
              {page > 1 && <Link href={lien({ page: String(page - 1) })} className="btn btn-outline btn-sm">Précédent</Link>}
              <span>Page {page} / {totalPages}</span>
              {page < totalPages && <Link href={lien({ page: String(page + 1) })} className="btn btn-outline btn-sm">Suivant</Link>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
