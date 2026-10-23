import Link from "next/link";
import Icone from "@/components/Icone";
import Flash from "@/components/admin/Flash";
import { exigerAcces } from "@/lib/auth";
import { supabaseAdmin, supabaseConfigure } from "@/lib/supabase";
import { STATUTS } from "@/lib/constantes";
import { formatCreneau, formatHeure, formatRelatif, dateParis, heureParisVersDate, lundiDeLaSemaine, ajouterJours } from "@/lib/temps";
import type { Demande } from "@/lib/types";

export const metadata = { title: "Tableau de bord" };

async function statistiques() {
  const supabase = supabaseAdmin();
  const maintenant = new Date();
  const aujourdHui = dateParis(maintenant);
  const lundi = lundiDeLaSemaine(aujourdHui);
  const debutSemaine = heureParisVersDate(lundi, "00:00").toISOString();
  const finSemaine = heureParisVersDate(ajouterJours(lundi, 7), "00:00").toISOString();
  const debutMois = heureParisVersDate(`${aujourdHui.slice(0, 7)}-01`, "00:00").toISOString();

  const compte = () => supabase.from("demandes").select("id", { count: "exact", head: true });

  const [nouvelles, rdvSemaine, totalMois, devisEnvoyesMois, prochains, recentes, photos] = await Promise.all([
    compte().eq("statut", "nouvelle"),
    compte().neq("statut", "annulee").gte("creneau_debut", debutSemaine).lt("creneau_debut", finSemaine),
    compte().gte("created_at", debutMois),
    compte().eq("statut", "devis_envoye").gte("updated_at", debutMois),
    supabase
      .from("demandes")
      .select("*")
      .in("statut", ["nouvelle", "confirmee"])
      .gte("creneau_debut", maintenant.toISOString())
      .order("creneau_debut", { ascending: true })
      .limit(6),
    supabase.from("demandes").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("galerie").select("id", { count: "exact", head: true }),
  ]);

  return {
    nouvelles: nouvelles.count ?? 0,
    rdvSemaine: rdvSemaine.count ?? 0,
    totalMois: totalMois.count ?? 0,
    devisEnvoyesMois: devisEnvoyesMois.count ?? 0,
    prochains: (prochains.data ?? []) as Demande[],
    recentes: (recentes.data ?? []) as Demande[],
    photos: photos.count ?? 0,
  };
}

export default async function TableauDeBord({ searchParams }: { searchParams: Promise<{ message?: string; type?: string }> }) {
  const utilisateur = await exigerAcces();
  const flash = await searchParams;
  const prenom = utilisateur.nom.split(" ")[0];

  if (!supabaseConfigure()) {
    return (
      <div className="app-topbar">
        <div>
          <h1>Bonjour {prenom}</h1>
          <p className="sub">Configurez Supabase pour afficher les statistiques.</p>
        </div>
      </div>
    );
  }

  const s = await statistiques();
  const messageReserve = flash.message === "reserve-admin" ? "Cette page est réservée aux administrateurs." : flash.message;

  return (
    <>
      <div className="app-topbar">
        <div>
          <h1>Bonjour {prenom}</h1>
          <p className="sub">Vue d&apos;ensemble des demandes et des rendez-vous.</p>
        </div>
        <Link href="/admin/demandes?statut=nouvelle" className="btn btn-primary btn-sm">
          Traiter les nouvelles demandes <Icone nom="arrow-right" taille={16} />
        </Link>
      </div>

      <Flash message={messageReserve} type={flash.message === "reserve-admin" ? "danger" : flash.type} />

      <div className="kpi-row">
        <Link href="/admin/demandes?statut=nouvelle" className="kpi kpi-lien">
          <div className="label">Nouvelles demandes</div>
          <div className="value">{s.nouvelles}</div>
          <div className={`delta ${s.nouvelles > 0 ? "warn" : "up"}`}>{s.nouvelles > 0 ? "À traiter" : "Tout est à jour"}</div>
        </Link>
        <Link href="/admin/planning" className="kpi kpi-lien">
          <div className="label">RDV cette semaine</div>
          <div className="value">{s.rdvSemaine}</div>
          <div className="delta">Voir le planning</div>
        </Link>
        <div className="kpi">
          <div className="label">Demandes ce mois</div>
          <div className="value">{s.totalMois}</div>
          <div className="delta up">{s.devisEnvoyesMois} devis envoyé{s.devisEnvoyesMois > 1 ? "s" : ""}</div>
        </div>
        <Link href="/admin/galerie" className="kpi kpi-lien">
          <div className="label">Photos dans la galerie</div>
          <div className="value">{s.photos}</div>
          <div className="delta">Ajouter des photos</div>
        </Link>
      </div>

      <div className="grid grid-2 admin-deux-colonnes">
        <div className="panel">
          <div className="panel-head">
            <h2>Prochains rendez-vous</h2>
            <Link href="/admin/planning" className="btn btn-outline btn-sm">Planning</Link>
          </div>
          {s.prochains.length === 0 ? (
            <p className="panel-vide">Aucun rendez-vous à venir.</p>
          ) : (
            <ul className="liste-rdv">
              {s.prochains.map((d) => (
                <li key={d.id}>
                  <Link href={`/admin/demandes/${d.id}`}>
                    <span className="rdv-heure">{d.creneau_debut ? formatHeure(d.creneau_debut) : "—"}</span>
                    <span className="rdv-infos">
                      <strong>{d.prenom} {d.nom}</strong>
                      <span>{formatCreneau(d.creneau_debut, null)} · {d.nature_projet}</span>
                    </span>
                    <span className={`pill ${STATUTS[d.statut].classe}`}>{STATUTS[d.statut].libelle}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Dernières demandes</h2>
            <Link href="/admin/demandes" className="btn btn-outline btn-sm">Toutes</Link>
          </div>
          {s.recentes.length === 0 ? (
            <p className="panel-vide">Aucune demande pour le moment.</p>
          ) : (
            <ul className="liste-rdv">
              {s.recentes.map((d) => (
                <li key={d.id}>
                  <Link href={`/admin/demandes/${d.id}`}>
                    <span className="rdv-infos">
                      <strong>{d.prenom} {d.nom}</strong>
                      <span>{d.nature_projet} · {formatRelatif(d.created_at)}</span>
                    </span>
                    <span className={`pill ${STATUTS[d.statut].classe}`}>{STATUTS[d.statut].libelle}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
