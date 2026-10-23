import Link from "next/link";
import { notFound } from "next/navigation";
import Icone from "@/components/Icone";
import Flash from "@/components/admin/Flash";
import BoutonEnvoi from "@/components/admin/BoutonEnvoi";
import BoutonConfirmation from "@/components/admin/BoutonConfirmation";
import { exigerAcces } from "@/lib/auth";
import { supabaseAdmin, supabaseConfigure, BUCKET_DEMANDES } from "@/lib/supabase";
import { creneauxDisponibles } from "@/lib/creneaux";
import { STATUTS } from "@/lib/constantes";
import { formatCreneau, formatDateLongue, formatHeure } from "@/lib/temps";
import type { Demande } from "@/lib/types";
import { annulerRdv, changerStatut, confirmerRdv, deplacerRdv, enregistrerNote, envoyerEmail, supprimerDemande } from "../actions";

export const metadata = { title: "Demande" };

export default async function DetailDemande({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; type?: string }>;
}) {
  const utilisateur = await exigerAcces();
  const { id } = await params;
  const flash = await searchParams;
  if (!supabaseConfigure() || !/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = supabaseAdmin();
  const { data } = await supabase.from("demandes").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const d = data as Demande;

  let urlPhoto: string | null = null;
  if (d.photo_path) {
    const signee = await supabase.storage.from(BUCKET_DEMANDES).createSignedUrl(d.photo_path, 3600);
    urlPhoto = signee.data?.signedUrl ?? null;
  }

  const { data: historique } = await supabase
    .from("demandes")
    .select("id, created_at, nature_projet, statut")
    .eq("email", d.email)
    .neq("id", d.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const actif = d.statut !== "annulee" && d.statut !== "terminee";
  const { jours } = actif ? await creneauxDisponibles().catch(() => ({ jours: [] })) : { jours: [] };
  const sujetDefaut = `Votre demande de devis — ${d.nature_projet}`;

  return (
    <>
      <div className="app-topbar">
        <div>
          <Link href="/admin/demandes" className="lien-retour"><Icone nom="arrow-left" taille={15} /> Toutes les demandes</Link>
          <h1>{d.prenom} {d.nom}</h1>
          <p className="sub">
            {d.nature_projet} · reçue le {formatDateLongue(d.created_at)} à {formatHeure(d.created_at)}
          </p>
        </div>
        <span className={`pill pill-grand ${STATUTS[d.statut].classe}`}>{STATUTS[d.statut].libelle}</span>
      </div>

      <Flash message={flash.message} type={flash.type} />

      <div className="detail-grille">
        <div className="detail-principal">
          <div className="panel">
            <div className="panel-head"><h2>Demande</h2></div>
            <dl className="fiche">
              <dt>Nature du projet</dt><dd>{d.nature_projet}</dd>
              <dt>Rendez-vous</dt>
              <dd>{d.creneau_debut ? <strong>{formatCreneau(d.creneau_debut, d.creneau_fin)}</strong> : <span className="text-muted">À convenir par e-mail</span>}</dd>
              <dt>Précisions</dt><dd className="texte-long">{d.description || <span className="text-muted">Aucune</span>}</dd>
              <dt>Photo</dt>
              <dd>
                {urlPhoto ? (
                  <a href={urlPhoto} target="_blank" rel="noreferrer" className="photo-demande">
                    <img src={urlPhoto} alt="Photo jointe par le client" />
                    <span>Ouvrir en grand <Icone nom="external" taille={13} /></span>
                  </a>
                ) : (
                  <span className="text-muted">Aucune photo</span>
                )}
              </dd>
            </dl>
          </div>

          <div className="panel">
            <div className="panel-head"><h2>Écrire au client</h2></div>
            <form action={envoyerEmail} className="panel-corps">
              <input type="hidden" name="id" value={d.id} />
              <div className="field">
                <label htmlFor="sujet">Sujet</label>
                <input id="sujet" name="sujet" defaultValue={sujetDefaut} required />
              </div>
              <div className="field">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows={6} required defaultValue={`Bonjour ${d.prenom},\n\n`} />
                <span className="hint">Envoyé depuis l&apos;adresse du site ; les réponses du client arrivent sur l&apos;e-mail de contact.</span>
              </div>
              <label className="check-row">
                <input type="checkbox" name="marquer_devis" />
                <span>Passer la demande en « Devis envoyé »</span>
              </label>
              <div className="actions-ligne">
                <BoutonEnvoi texteEnvoi="Envoi…"><Icone nom="send" taille={16} /> Envoyer l&apos;e-mail</BoutonEnvoi>
                <a href={`mailto:${d.email}?subject=${encodeURIComponent(sujetDefaut)}`} className="btn btn-outline">
                  Ouvrir dans ma messagerie
                </a>
              </div>
            </form>
          </div>
        </div>

        <div className="detail-cote">
          <div className="panel">
            <div className="panel-head"><h2>Client</h2></div>
            <dl className="fiche fiche-compacte">
              <dt>Nom</dt><dd>{d.prenom} {d.nom}</dd>
              <dt>E-mail</dt><dd><a href={`mailto:${d.email}`}>{d.email}</a></dd>
            </dl>
            {historique && historique.length > 0 && (
              <div className="panel-corps historique">
                <span className="recap-libelle">Autres demandes de ce client</span>
                {historique.map((h) => (
                  <Link key={h.id} href={`/admin/demandes/${h.id}`}>
                    {h.nature_projet} · {formatDateLongue(h.created_at)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {d.creneau_debut && actif && (
            <div className="panel">
              <div className="panel-head"><h2>Rendez-vous</h2></div>
              <div className="panel-corps pile">
                {d.statut === "nouvelle" && (
                  <form action={confirmerRdv}>
                    <input type="hidden" name="id" value={d.id} />
                    <BoutonEnvoi className="btn btn-primary btn-block" texteEnvoi="Confirmation…">
                      <Icone nom="check" taille={16} /> Confirmer et prévenir le client
                    </BoutonEnvoi>
                  </form>
                )}
                {jours.length > 0 && (
                  <form action={deplacerRdv} className="pile">
                    <input type="hidden" name="id" value={d.id} />
                    <div className="field">
                      <label htmlFor="creneau">Déplacer vers</label>
                      <select id="creneau" name="creneau" required defaultValue="">
                        <option value="" disabled>Choisir un créneau libre…</option>
                        {jours.slice(0, 21).map((jour) => (
                          <optgroup key={jour.date} label={formatDateLongue(`${jour.date}T12:00:00Z`)}>
                            {jour.creneaux.map((c) => (
                              <option key={c.debut} value={c.debut}>{formatHeure(c.debut)}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <label className="check-row"><input type="checkbox" name="prevenir" defaultChecked /> <span>Prévenir le client par e-mail</span></label>
                    <BoutonEnvoi className="btn btn-outline btn-block">Déplacer le rendez-vous</BoutonEnvoi>
                  </form>
                )}
              </div>
            </div>
          )}

          <div className="panel">
            <div className="panel-head"><h2>Suivi</h2></div>
            <div className="panel-corps pile">
              <form action={changerStatut} className="ligne-formulaire">
                <input type="hidden" name="id" value={d.id} />
                <select name="statut" defaultValue={d.statut} aria-label="Statut">
                  {Object.entries(STATUTS).map(([valeur, s]) => (
                    <option key={valeur} value={valeur}>{s.libelle}</option>
                  ))}
                </select>
                <BoutonEnvoi className="btn btn-dark btn-sm">Appliquer</BoutonEnvoi>
              </form>
              <form action={enregistrerNote} className="pile">
                <input type="hidden" name="id" value={d.id} />
                <div className="field">
                  <label htmlFor="note_interne">Note interne</label>
                  <textarea id="note_interne" name="note_interne" rows={5} defaultValue={d.note_interne ?? ""} placeholder="Visible uniquement dans le back-office" />
                </div>
                <BoutonEnvoi className="btn btn-outline btn-sm">Enregistrer la note</BoutonEnvoi>
              </form>
            </div>
          </div>

          {actif && (
            <div className="panel panel-danger">
              <div className="panel-head"><h2>Annuler</h2></div>
              <form action={annulerRdv} className="panel-corps pile">
                <input type="hidden" name="id" value={d.id} />
                <div className="field">
                  <label htmlFor="motif">Message au client <span className="optionnel">facultatif</span></label>
                  <textarea id="motif" name="motif" rows={2} />
                </div>
                {d.creneau_debut && (
                  <label className="check-row"><input type="checkbox" name="prevenir" defaultChecked /> <span>Prévenir le client par e-mail</span></label>
                )}
                <BoutonConfirmation confirmation="Annuler cette demande ? Le créneau sera libéré." className="btn btn-outline btn-block">
                  Annuler la demande
                </BoutonConfirmation>
              </form>
            </div>
          )}

          {utilisateur.role === "admin" && (
            <form action={supprimerDemande} className="zone-suppression">
              <input type="hidden" name="id" value={d.id} />
              <BoutonConfirmation
                confirmation="Supprimer définitivement cette demande et sa photo ? (droit à l'effacement RGPD)"
                className="btn btn-ghost btn-sm bouton-danger"
              >
                <Icone nom="trash" taille={15} /> Supprimer définitivement
              </BoutonConfirmation>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
