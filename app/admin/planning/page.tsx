import Link from "next/link";
import Icone from "@/components/Icone";
import Flash from "@/components/admin/Flash";
import BoutonEnvoi from "@/components/admin/BoutonEnvoi";
import BoutonConfirmation from "@/components/admin/BoutonConfirmation";
import { exigerAcces } from "@/lib/auth";
import { supabaseAdmin, supabaseConfigure } from "@/lib/supabase";
import { lireParametres } from "@/lib/donnees";
import { JOURS_SEMAINE, STATUTS } from "@/lib/constantes";
import { ajouterJours, dateParis, formatDateCourte, formatHeure, heureParisVersDate, jourSemaineIso, lundiDeLaSemaine } from "@/lib/temps";
import type { Demande, Disponibilite, Fermeture } from "@/lib/types";
import {
  ajouterDisponibilite,
  ajouterFermeture,
  basculerDisponibilite,
  enregistrerReglagesReservation,
  supprimerDisponibilite,
  supprimerFermeture,
} from "./actions";

export const metadata = { title: "Planning" };

const formatJourEntete = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" });
const formatSemaine = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });

export default async function PagePlanning({ searchParams }: { searchParams: Promise<{ semaine?: string; message?: string; type?: string }> }) {
  await exigerAcces();
  const params = await searchParams;
  const aujourdHui = dateParis(new Date());
  const lundi = params.semaine && /^\d{4}-\d{2}-\d{2}$/.test(params.semaine) ? lundiDeLaSemaine(params.semaine) : lundiDeLaSemaine(aujourdHui);
  const jours = Array.from({ length: 7 }, (_, i) => ajouterJours(lundi, i));

  let demandes: Demande[] = [];
  let disponibilites: Disponibilite[] = [];
  let fermetures: Fermeture[] = [];
  const parametres = await lireParametres();

  if (supabaseConfigure()) {
    const supabase = supabaseAdmin();
    const [d, dispo, ferm] = await Promise.all([
      supabase
        .from("demandes")
        .select("*")
        .neq("statut", "annulee")
        .gte("creneau_debut", heureParisVersDate(lundi, "00:00").toISOString())
        .lt("creneau_debut", heureParisVersDate(ajouterJours(lundi, 7), "00:00").toISOString())
        .order("creneau_debut"),
      supabase.from("disponibilites").select("*").order("jour_semaine").order("heure_debut"),
      supabase.from("fermetures").select("*").gte("date_fin", aujourdHui).order("date_debut"),
    ]);
    demandes = (d.data ?? []) as Demande[];
    disponibilites = (dispo.data ?? []) as Disponibilite[];
    fermetures = (ferm.data ?? []) as Fermeture[];
  }

  const fermeturesSemaine = supabaseConfigure()
    ? ((await supabaseAdmin().from("fermetures").select("*").lte("date_debut", jours[6]).gte("date_fin", lundi)).data ?? []) as Fermeture[]
    : [];

  const finDimanche = new Date(`${jours[6]}T12:00:00Z`);
  const debutLundi = new Date(`${lundi}T12:00:00Z`);

  return (
    <>
      <div className="app-topbar">
        <div>
          <h1>Planning</h1>
          <p className="sub">Rendez-vous de la semaine, disponibilités proposées aux clients et fermetures.</p>
        </div>
        <Link href="/devis" target="_blank" className="btn btn-outline btn-sm">
          Voir le planning côté client <Icone nom="external" taille={15} />
        </Link>
      </div>

      <Flash message={params.message} type={params.type} />

      {!parametres.reservations_ouvertes && (
        <div className="alert alert-info">
          <Icone nom="info" />
          <span>Les réservations en ligne sont fermées : les clients peuvent envoyer une demande mais sans choisir de créneau.</span>
        </div>
      )}

      <div className="panel">
        <div className="panel-head">
          <h2>Semaine du {formatSemaine.format(debutLundi)} au {formatSemaine.format(finDimanche)}</h2>
          <div className="actions-ligne">
            <Link href={`/admin/planning?semaine=${ajouterJours(lundi, -7)}`} className="icon-btn" aria-label="Semaine précédente"><Icone nom="chevron-left" taille={16} /></Link>
            <Link href="/admin/planning" className="btn btn-outline btn-sm">Aujourd&apos;hui</Link>
            <Link href={`/admin/planning?semaine=${ajouterJours(lundi, 7)}`} className="icon-btn" aria-label="Semaine suivante"><Icone nom="chevron-right" taille={16} /></Link>
          </div>
        </div>
        <div className="semaine">
          {jours.map((jour) => {
            const iso = jourSemaineIso(jour);
            const rdv = demandes.filter((d) => d.creneau_debut && dateParis(new Date(d.creneau_debut)) === jour);
            const plages = disponibilites.filter((p) => p.actif && p.jour_semaine === iso);
            const fermeture = fermeturesSemaine.find((f) => jour >= f.date_debut && jour <= f.date_fin);
            return (
              <div key={jour} className={`semaine-jour${jour === aujourdHui ? " aujourdhui" : ""}${fermeture ? " ferme" : ""}`}>
                <div className="semaine-entete">
                  <strong>{formatJourEntete.format(new Date(`${jour}T12:00:00Z`))}</strong>
                  <span>
                    {fermeture
                      ? `Fermé${fermeture.motif ? ` · ${fermeture.motif}` : ""}`
                      : plages.length
                        ? plages.map((p) => `${p.heure_debut.slice(0, 5)}–${p.heure_fin.slice(0, 5)}`).join(" · ")
                        : "Pas de disponibilité"}
                  </span>
                </div>
                <div className="semaine-rdv">
                  {rdv.map((d) => (
                    <Link key={d.id} href={`/admin/demandes/${d.id}`} className={`rdv-carte statut-${d.statut}`}>
                      <span className="rdv-carte-heure">
                        {formatHeure(d.creneau_debut!)}{d.creneau_fin ? `–${formatHeure(d.creneau_fin)}` : ""}
                      </span>
                      <strong>{d.prenom} {d.nom}</strong>
                      <span>{d.nature_projet}</span>
                      <span className="rdv-carte-statut">{STATUTS[d.statut].libelle}</span>
                    </Link>
                  ))}
                  {rdv.length === 0 && !fermeture && <span className="semaine-vide">—</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-2 admin-deux-colonnes">
        <div className="panel">
          <div className="panel-head"><h2>Disponibilités hebdomadaires</h2></div>
          <div className="panel-corps">
            <p className="hint">Les créneaux proposés aux clients sont découpés dans ces plages, par tranches de {parametres.duree_creneau_minutes} minutes.</p>
            <ul className="liste-plages">
              {[1, 2, 3, 4, 5, 6, 7].map((jour) => {
                const plagesDuJour = disponibilites.filter((p) => p.jour_semaine === jour);
                return (
                  <li key={jour}>
                    <span className="plage-jour">{JOURS_SEMAINE[jour]}</span>
                    <div className="plage-liste">
                      {plagesDuJour.length === 0 && <span className="text-muted">Fermé</span>}
                      {plagesDuJour.map((p) => (
                        <span key={p.id} className={`plage${p.actif ? "" : " inactive"}`}>
                          {p.heure_debut.slice(0, 5)}–{p.heure_fin.slice(0, 5)}
                          <form action={basculerDisponibilite}>
                            <input type="hidden" name="id" value={p.id} />
                            <input type="hidden" name="actif" value={String(p.actif)} />
                            <button type="submit" title={p.actif ? "Désactiver" : "Réactiver"} className="plage-bouton">
                              <Icone nom={p.actif ? "eye" : "lock"} taille={13} />
                            </button>
                          </form>
                          <form action={supprimerDisponibilite}>
                            <input type="hidden" name="id" value={p.id} />
                            <BoutonConfirmation confirmation="Supprimer cette plage ?" className="plage-bouton" titre="Supprimer">
                              <Icone nom="close" taille={13} />
                            </BoutonConfirmation>
                          </form>
                        </span>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
            <form action={ajouterDisponibilite} className="ligne-formulaire ajout-plage">
              <select name="jour_semaine" aria-label="Jour" defaultValue="1">
                {[1, 2, 3, 4, 5, 6, 7].map((j) => <option key={j} value={j}>{JOURS_SEMAINE[j]}</option>)}
              </select>
              <input type="time" name="heure_debut" defaultValue="09:00" required aria-label="Début" />
              <input type="time" name="heure_fin" defaultValue="12:00" required aria-label="Fin" />
              <BoutonEnvoi className="btn btn-dark btn-sm"><Icone nom="plus" taille={15} /> Ajouter</BoutonEnvoi>
            </form>
          </div>
        </div>

        <div className="pile">
          <div className="panel">
            <div className="panel-head"><h2>Fermetures &amp; congés</h2></div>
            <div className="panel-corps">
              {fermetures.length === 0 ? (
                <p className="text-muted">Aucune fermeture à venir.</p>
              ) : (
                <ul className="liste-simple">
                  {fermetures.map((f) => (
                    <li key={f.id}>
                      <span>
                        <strong>{f.date_debut === f.date_fin ? formatDateCourte(`${f.date_debut}T12:00:00Z`) : `${formatDateCourte(`${f.date_debut}T12:00:00Z`)} → ${formatDateCourte(`${f.date_fin}T12:00:00Z`)}`}</strong>
                        {f.motif && <span className="text-muted"> · {f.motif}</span>}
                      </span>
                      <form action={supprimerFermeture}>
                        <input type="hidden" name="id" value={f.id} />
                        <BoutonConfirmation confirmation="Supprimer cette fermeture ?" className="icon-btn" titre="Supprimer">
                          <Icone nom="trash" taille={15} />
                        </BoutonConfirmation>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
              <form action={ajouterFermeture} className="formulaire-fermeture">
                <div className="field-row">
                  <div className="field"><label htmlFor="date_debut">Du</label><input id="date_debut" type="date" name="date_debut" min={aujourdHui} required /></div>
                  <div className="field"><label htmlFor="date_fin">Au</label><input id="date_fin" type="date" name="date_fin" min={aujourdHui} /></div>
                </div>
                <div className="field"><label htmlFor="motif">Motif <span className="optionnel">facultatif</span></label><input id="motif" name="motif" placeholder="Congés, chantier long…" /></div>
                <BoutonEnvoi className="btn btn-dark btn-sm">Bloquer ces dates</BoutonEnvoi>
              </form>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><h2>Réglages de réservation</h2></div>
            <form action={enregistrerReglagesReservation} className="panel-corps">
              <label className="check-row interrupteur">
                <input type="checkbox" name="reservations_ouvertes" defaultChecked={parametres.reservations_ouvertes} />
                <span>Réservations en ligne ouvertes</span>
              </label>
              <div className="field-row field-row-3">
                <div className="field">
                  <label htmlFor="duree">Durée d&apos;un créneau</label>
                  <select id="duree" name="duree_creneau_minutes" defaultValue={String(parametres.duree_creneau_minutes)}>
                    {[30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} min</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="delai">Délai minimum</label>
                  <select id="delai" name="delai_min_heures" defaultValue={String(parametres.delai_min_heures)}>
                    {[2, 12, 24, 48, 72].map((h) => <option key={h} value={h}>{h} h avant</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="horizon">Réservable jusqu&apos;à</label>
                  <select id="horizon" name="horizon_jours" defaultValue={String(parametres.horizon_jours)}>
                    {[14, 30, 60, 90].map((j) => <option key={j} value={j}>{j} jours</option>)}
                  </select>
                </div>
              </div>
              <BoutonEnvoi className="btn btn-primary btn-sm">Enregistrer</BoutonEnvoi>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
