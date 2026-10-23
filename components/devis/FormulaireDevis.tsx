"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import Icone from "@/components/Icone";
import { compresserImage } from "@/lib/image-client";
import { soumettreDemande } from "@/app/(site)/devis/actions";
import { NATURES_PROJET } from "@/lib/constantes";
import type { JourCreneaux } from "@/lib/types";

const FUSEAU = "Europe/Paris";
const JOURS_PAR_PAGE = 7;

const formatJour = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", weekday: "short" });
const formatNumero = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", day: "numeric" });
const formatMois = new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", month: "short" });
const formatHeure = new Intl.DateTimeFormat("fr-FR", { timeZone: FUSEAU, hour: "2-digit", minute: "2-digit" });
const formatLong = new Intl.DateTimeFormat("fr-FR", { timeZone: FUSEAU, weekday: "long", day: "numeric", month: "long" });

function dateUtc(dateIso: string): Date {
  return new Date(`${dateIso}T12:00:00Z`);
}

type EtatPlanning = { chargement: boolean; ouvert: boolean; jours: JourCreneaux[]; erreur: boolean; configure: boolean };

export default function FormulaireDevis() {
  const router = useRouter();
  const [planning, setPlanning] = useState<EtatPlanning>({ chargement: true, ouvert: true, jours: [], erreur: false, configure: true });
  const [page, setPage] = useState(0);
  const [jourChoisi, setJourChoisi] = useState<string | null>(null);
  const [creneau, setCreneau] = useState<string | null>(null);
  const [sansCreneau, setSansCreneau] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "erreur" | "info"; texte: string } | null>(null);
  const [etapes, setEtapes] = useState({ projet: false, coordonnees: false });
  const [envoiEnCours, demarrerEnvoi] = useTransition();
  const champPhoto = useRef<HTMLInputElement>(null);
  const derniereMaj = useRef<Date | null>(null);

  const chargerCreneaux = useCallback(async () => {
    try {
      const reponse = await fetch("/api/creneaux", { cache: "no-store" });
      const donnees = await reponse.json();
      derniereMaj.current = new Date();
      setPlanning({
        chargement: false,
        ouvert: Boolean(donnees.ouvert),
        jours: donnees.jours ?? [],
        erreur: !reponse.ok,
        configure: donnees.configure !== false,
      });
    } catch {
      setPlanning((p) => ({ ...p, chargement: false, erreur: true }));
    }
  }, []);

  useEffect(() => {
    chargerCreneaux();
    const intervalle = window.setInterval(chargerCreneaux, 60000);
    const auRetour = () => document.visibilityState === "visible" && chargerCreneaux();
    document.addEventListener("visibilitychange", auRetour);
    return () => {
      window.clearInterval(intervalle);
      document.removeEventListener("visibilitychange", auRetour);
    };
  }, [chargerCreneaux]);

  useEffect(() => {
    if (!jourChoisi && planning.jours.length > 0) setJourChoisi(planning.jours[0].date);
    if (creneau) {
      const existeEncore = planning.jours.some((j) => j.creneaux.some((c) => c.debut === creneau));
      if (!existeEncore) {
        setCreneau(null);
        setMessage({ type: "info", texte: "Le créneau sélectionné n'est plus disponible, merci d'en choisir un autre." });
      }
    }
  }, [planning.jours, jourChoisi, creneau]);

  useEffect(() => {
    if (!photo) {
      setApercu(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setApercu(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const totalPages = Math.max(1, Math.ceil(planning.jours.length / JOURS_PAR_PAGE));
  const joursAffiches = useMemo(
    () => planning.jours.slice(page * JOURS_PAR_PAGE, page * JOURS_PAR_PAGE + JOURS_PAR_PAGE),
    [planning.jours, page]
  );
  const creneauxDuJour = planning.jours.find((j) => j.date === jourChoisi)?.creneaux ?? [];
  const planningVide = !planning.chargement && (planning.jours.length === 0 || !planning.ouvert);

  async function choisirPhoto(fichier: File | undefined) {
    if (!fichier) return;
    if (!fichier.type.startsWith("image/")) {
      setMessage({ type: "erreur", texte: "Le fichier doit être une image (JPG, PNG ou WEBP)." });
      return;
    }
    const compressee = await compresserImage(fichier);
    if (compressee.size > 4 * 1024 * 1024) {
      setMessage({ type: "erreur", texte: "La photo est trop lourde même après compression (4 Mo maximum)." });
      return;
    }
    setMessage(null);
    setPhoto(compressee);
  }

  function envoyer(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    setMessage(null);
    if (!creneau && !sansCreneau && !planningVide) {
      setMessage({ type: "erreur", texte: "Choisissez un créneau dans le planning, ou cochez « Être recontacté sans créneau »." });
      document.getElementById("planning")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const formulaire = new FormData(evenement.currentTarget);
    formulaire.delete("photo");
    if (photo) formulaire.set("photo", photo);
    if (creneau && !sansCreneau) formulaire.set("creneau", creneau);

    demarrerEnvoi(async () => {
      const resultat = await soumettreDemande(formulaire);
      if (resultat.ok) {
        const parametres = new URLSearchParams();
        if (resultat.creneau) parametres.set("creneau", resultat.creneau);
        router.push(`/devis/merci?${parametres.toString()}`);
        return;
      }
      setMessage({ type: "erreur", texte: resultat.message });
      if (resultat.creneauPris) {
        setCreneau(null);
        await chargerCreneaux();
        document.getElementById("planning")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  return (
    <form
      className="devis-formulaire"
      onSubmit={envoyer}
      noValidate={false}
      onChange={(e) => {
        const f = e.currentTarget;
        const valeur = (nom: string) => ((f.elements.namedItem(nom) as HTMLInputElement | null)?.value ?? "").trim();
        setEtapes({
          projet: valeur("nature_projet") !== "",
          coordonnees: valeur("prenom") !== "" && valeur("nom") !== "" && /\S+@\S+\.\S+/.test(valeur("email")),
        });
      }}
    >
      <div className="devis-colonne">
        <div className="panel devis-bloc" id="planning">
          <div className="panel-head">
            <h2><NumeroEtape numero={1} fait={Boolean(creneau) || sansCreneau || planningVide} /> Choisissez un créneau</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={chargerCreneaux} title="Actualiser le planning">
              <span>Actualiser</span>
            </button>
          </div>
          <div className="devis-bloc-corps">
            {planning.chargement && <p className="text-muted">Chargement du planning…</p>}

            {planningVide && (
              <div className="alert alert-info">
                <Icone nom="info" />
                <span>
                  {!planning.configure
                    ? "Le planning en ligne sera bientôt disponible. Envoyez votre demande, nous vous recontactons par e-mail pour fixer un rendez-vous."
                    : "Aucun créneau n'est disponible pour le moment. Envoyez votre demande, nous vous recontactons par e-mail pour fixer un rendez-vous."}
                </span>
              </div>
            )}

            {!planning.chargement && !planningVide && (
              <>
                <div className="calendrier-entete">
                  <button type="button" className="icon-btn" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} aria-label="Jours précédents">
                    <Icone nom="chevron-left" taille={16} />
                  </button>
                  <div className="calendrier-jours" role="listbox" aria-label="Jours disponibles">
                    {joursAffiches.map((jour) => {
                      const d = dateUtc(jour.date);
                      const actif = jour.date === jourChoisi;
                      return (
                        <button
                          key={jour.date}
                          type="button"
                          role="option"
                          aria-selected={actif}
                          className={`calendrier-jour${actif ? " active" : ""}`}
                          onClick={() => setJourChoisi(jour.date)}
                          disabled={sansCreneau}
                        >
                          <span className="cj-nom">{formatJour.format(d).replace(".", "")}</span>
                          <span className="cj-num">{formatNumero.format(d)}</span>
                          <span className="cj-mois">{formatMois.format(d).replace(".", "")}</span>
                          <span className="cj-dispo">{jour.creneaux.length} dispo</span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    aria-label="Jours suivants"
                  >
                    <Icone nom="chevron-right" taille={16} />
                  </button>
                </div>

                {jourChoisi && !sansCreneau && (
                  <div className="creneaux">
                    <p className="creneaux-titre">{formatLong.format(dateUtc(jourChoisi))}</p>
                    <motion.div
                      key={jourChoisi}
                      className="creneaux-grille"
                      initial="cache"
                      animate="visible"
                      variants={{ cache: {}, visible: { transition: { staggerChildren: 0.035 } } }}
                    >
                      {creneauxDuJour.map((c) => (
                        <motion.button
                          key={c.debut}
                          type="button"
                          className={`creneau${creneau === c.debut ? " active" : ""}`}
                          onClick={() => setCreneau(c.debut)}
                          aria-pressed={creneau === c.debut}
                          variants={{ cache: { opacity: 0, y: 10, scale: 0.92 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                          whileTap={{ scale: 0.94 }}
                        >
                          {formatHeure.format(new Date(c.debut))}
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>
                )}
              </>
            )}

            {!planningVide && !planning.chargement && (
              <label className="check-row" style={{ marginTop: "1.2rem" }}>
                <input type="checkbox" checked={sansCreneau} onChange={(e) => setSansCreneau(e.target.checked)} />
                <span>Aucun créneau ne me convient — être recontacté par e-mail sans rendez-vous.</span>
              </label>
            )}

            {derniereMaj.current && !planning.chargement && (
              <p className="planning-maj">Planning mis à jour à {formatHeure.format(derniereMaj.current)} · actualisation automatique</p>
            )}
          </div>
        </div>

        <div className="panel devis-bloc">
          <div className="panel-head">
            <h2><NumeroEtape numero={2} fait={etapes.projet} /> Votre projet</h2>
          </div>
          <div className="devis-bloc-corps">
            <div className="field">
              <label htmlFor="nature_projet">Nature du projet</label>
              <select id="nature_projet" name="nature_projet" required defaultValue="">
                <option value="" disabled>Choisissez…</option>
                {NATURES_PROJET.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="description">Précisions <span className="optionnel">facultatif</span></label>
              <textarea id="description" name="description" rows={3} maxLength={2000} placeholder="Surface, fréquence, accès, contraintes particulières…" />
            </div>
            <div className="field">
              <label>Photo <span className="optionnel">facultatif</span></label>
              {apercu ? (
                <div className="photo-apercu">
                  <img src={apercu} alt="Aperçu de la photo jointe" />
                  <div>
                    <strong>{photo?.name}</strong>
                    <span className="hint">{photo ? `${Math.round(photo.size / 1024)} Ko` : ""}</span>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => { setPhoto(null); if (champPhoto.current) champPhoto.current.value = ""; }}>
                      Retirer
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  className="depot-fichier"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); choisirPhoto(e.dataTransfer.files[0]); }}
                >
                  <Icone nom="camera" taille={26} />
                  <strong>Ajouter une photo des lieux</strong>
                  <span className="hint">JPG, PNG ou WEBP — glissez-la ici ou cliquez</span>
                  <input
                    ref={champPhoto}
                    type="file"
                    name="photo"
                    accept="image/jpeg,image/png,image/webp,image/*"
                    onChange={(e) => choisirPhoto(e.target.files?.[0])}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="panel devis-bloc">
          <div className="panel-head">
            <h2><NumeroEtape numero={3} fait={etapes.coordonnees} /> Vos coordonnées</h2>
          </div>
          <div className="devis-bloc-corps">
            <div className="field-row">
              <div className="field">
                <label htmlFor="prenom">Prénom</label>
                <input id="prenom" name="prenom" autoComplete="given-name" required maxLength={80} />
              </div>
              <div className="field">
                <label htmlFor="nom">Nom</label>
                <input id="nom" name="nom" autoComplete="family-name" required maxLength={80} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="email">Adresse e-mail</label>
              <input id="email" name="email" type="email" autoComplete="email" required maxLength={190} placeholder="vous@exemple.fr" />
              <span className="hint">La confirmation et la suite de votre demande se font par e-mail.</span>
            </div>
            <div className="champ-piege" aria-hidden="true">
              <label htmlFor="site_web">Ne pas remplir</label>
              <input id="site_web" name="site_web" tabIndex={-1} autoComplete="off" />
            </div>
            <label className="check-row">
              <input type="checkbox" name="consentement" required />
              <span>
                J&apos;accepte que mes données soient utilisées pour traiter ma demande, conformément à la{" "}
                <Link href="/politique-confidentialite" target="_blank">politique de confidentialité</Link>.
              </span>
            </label>
          </div>
        </div>
      </div>

      <aside className="devis-recap">
        <div className="panel">
          <div className="panel-head"><h2>Récapitulatif</h2></div>
          <div className="devis-bloc-corps">
            <div className="recap-ligne">
              <Icone nom="calendar" />
              <div>
                <span className="recap-libelle">Rendez-vous</span>
                <TexteAnime
                  texte={
                    sansCreneau || planningVide
                      ? "À convenir par e-mail"
                      : creneau
                        ? `${formatLong.format(new Date(creneau))} à ${formatHeure.format(new Date(creneau))}`
                        : "Aucun créneau choisi"
                  }
                />
              </div>
            </div>
            <div className="recap-ligne">
              <Icone nom="camera" />
              <div>
                <span className="recap-libelle">Photo</span>
                <TexteAnime texte={photo ? "1 photo jointe" : "Aucune"} />
              </div>
            </div>

            {message && (
              <div className={`alert ${message.type === "erreur" ? "alert-error" : "alert-info"}`} role="alert">
                <Icone nom={message.type === "erreur" ? "alert" : "info"} />
                <span>{message.texte}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={envoiEnCours}>
              {envoiEnCours ? "Envoi en cours…" : "Envoyer ma demande"}
              {!envoiEnCours && <Icone nom="send" taille={16} />}
            </button>
            <p className="hint recap-note">Sans engagement · aucune donnée bancaire demandée</p>
          </div>
        </div>
      </aside>
    </form>
  );
}

function NumeroEtape({ numero, fait }: { numero: number; fait: boolean }) {
  return (
    <span className={`devis-numero${fait ? " fait" : ""}`} aria-label={fait ? `Étape ${numero} complétée` : `Étape ${numero}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={fait ? "fait" : "numero"}
          initial={{ scale: 0.4, opacity: 0, rotate: -30 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 26 }}
          style={{ display: "inline-flex" }}
        >
          {fait ? <Icone nom="check" taille={14} /> : numero}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function TexteAnime({ texte }: { texte: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.strong
        key={texte}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        style={{ display: "block" }}
      >
        {texte}
      </motion.strong>
    </AnimatePresence>
  );
}
