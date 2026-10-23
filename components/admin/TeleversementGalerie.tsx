"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icone from "@/components/Icone";
import { compresserImage } from "@/lib/image-client";
import { CATEGORIES_GALERIE } from "@/lib/constantes";
import { ajouterAvantApres, ajouterPhoto } from "@/app/admin/galerie/actions";

type Mode = "photos" | "avant_apres";
type Progression = { total: number; faits: number; erreurs: string[] };

export default function TeleversementGalerie() {
  const router = useRouter();
  const formulaire = useRef<HTMLFormElement>(null);
  const [mode, setMode] = useState<Mode>("photos");
  const [fichiers, setFichiers] = useState<File[]>([]);
  const [avant, setAvant] = useState<File | null>(null);
  const [apres, setApres] = useState<File | null>(null);
  const [progression, setProgression] = useState<Progression | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; texte: string } | null>(null);
  const enCours = progression !== null && progression.faits < progression.total;

  const apercus = useMemo(
    () => fichiers.slice(0, 12).map((f, i) => ({ cle: `${i}-${f.name}-${f.size}`, nom: f.name, url: URL.createObjectURL(f) })),
    [fichiers]
  );
  useEffect(() => () => apercus.forEach((a) => URL.revokeObjectURL(a.url)), [apercus]);

  function reinitialiser() {
    setFichiers([]);
    setAvant(null);
    setApres(null);
    formulaire.current?.reset();
  }

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const base = new FormData(e.currentTarget);
    base.delete("images");
    base.delete("image_avant");
    base.delete("image_apres");

    if (mode === "photos") {
      if (fichiers.length === 0) {
        setMessage({ ok: false, texte: "Sélectionnez au moins une photo." });
        return;
      }
      const erreurs: string[] = [];
      setProgression({ total: fichiers.length, faits: 0, erreurs });
      for (let i = 0; i < fichiers.length; i++) {
        const donnees = new FormData();
        base.forEach((valeur, cle) => donnees.append(cle, valeur));
        donnees.set("image", await compresserImage(fichiers[i]));
        const resultat = await ajouterPhoto(donnees);
        if (!resultat.ok) erreurs.push(`${fichiers[i].name} : ${resultat.message}`);
        setProgression({ total: fichiers.length, faits: i + 1, erreurs: [...erreurs] });
      }
      const reussies = fichiers.length - erreurs.length;
      setMessage({
        ok: erreurs.length === 0,
        texte: erreurs.length === 0 ? `${reussies} photo(s) ajoutée(s) à la galerie.` : `${reussies} ajoutée(s), ${erreurs.length} en erreur.`,
      });
    } else {
      if (!avant || !apres) {
        setMessage({ ok: false, texte: "Ajoutez une photo « avant » et une photo « après »." });
        return;
      }
      setProgression({ total: 1, faits: 0, erreurs: [] });
      base.set("image_avant", await compresserImage(avant));
      base.set("image_apres", await compresserImage(apres));
      const resultat = await ajouterAvantApres(base);
      setProgression({ total: 1, faits: 1, erreurs: resultat.ok ? [] : [resultat.message] });
      setMessage({ ok: resultat.ok, texte: resultat.message });
    }
    reinitialiser();
    router.refresh();
  }

  return (
    <form ref={formulaire} onSubmit={envoyer} className="panel-corps televersement">
      <div className="tabs tabs-larges">
        <button type="button" className={mode === "photos" ? "active" : ""} onClick={() => setMode("photos")}>Photos</button>
        <button type="button" className={mode === "avant_apres" ? "active" : ""} onClick={() => setMode("avant_apres")}>Avant / après</button>
      </div>

      {mode === "photos" ? (
        <label className="depot-fichier">
          <Icone nom="upload" taille={26} />
          <strong>{fichiers.length ? `${fichiers.length} photo(s) sélectionnée(s)` : "Sélectionner une ou plusieurs photos"}</strong>
          <span className="hint">Les photos sont redimensionnées automatiquement avant l&apos;envoi</span>
          <input type="file" name="images" accept="image/*" multiple onChange={(e) => setFichiers(Array.from(e.target.files ?? []))} />
        </label>
      ) : (
        <div className="field-row">
          <label className="depot-fichier depot-petit">
            <strong>{avant ? avant.name : "Photo AVANT"}</strong>
            <span className="hint">{avant ? "Cliquer pour changer" : "Choisir une image"}</span>
            <input type="file" name="image_avant" accept="image/*" onChange={(e) => setAvant(e.target.files?.[0] ?? null)} />
          </label>
          <label className="depot-fichier depot-petit">
            <strong>{apres ? apres.name : "Photo APRÈS"}</strong>
            <span className="hint">{apres ? "Cliquer pour changer" : "Choisir une image"}</span>
            <input type="file" name="image_apres" accept="image/*" onChange={(e) => setApres(e.target.files?.[0] ?? null)} />
          </label>
        </div>
      )}

      {apercus.length > 0 && mode === "photos" && (
        <div className="miniatures">
          {apercus.map((a) => (
            <img key={a.cle} src={a.url} alt={a.nom} />
          ))}
          {fichiers.length > 12 && <span className="miniature-plus">+{fichiers.length - 12}</span>}
        </div>
      )}

      <div className="field-row">
        <div className="field">
          <label htmlFor="g-categorie">Catégorie</label>
          <select id="g-categorie" name="categorie" required defaultValue="">
            <option value="" disabled>Choisir…</option>
            {CATEGORIES_GALERIE.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="g-lieu">Lieu <span className="optionnel">facultatif</span></label>
          <input id="g-lieu" name="lieu" placeholder="ex : Sceaux" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="g-titre">
          Titre {mode === "photos" && <span className="optionnel">facultatif — sinon la catégorie est utilisée</span>}
        </label>
        <input id="g-titre" name="titre" placeholder="ex : Remise en état d'un hall d'immeuble" required={mode === "avant_apres"} />
      </div>
      <div className="field">
        <label htmlFor="g-description">Description <span className="optionnel">facultatif</span></label>
        <textarea id="g-description" name="description" rows={2} />
      </div>
      <label className="check-row">
        <input type="checkbox" name="en_avant" />
        <span>Mettre en avant sur la page d&apos;accueil</span>
      </label>

      {progression && enCours && (
        <div className="barre-progression" aria-live="polite">
          <div style={{ width: `${(progression.faits / progression.total) * 100}%` }} />
          <span>Envoi {progression.faits} / {progression.total}…</span>
        </div>
      )}
      {message && (
        <div className={`alert ${message.ok ? "alert-success" : "alert-error"}`}>
          <Icone nom={message.ok ? "check" : "alert"} />
          <span>
            {message.texte}
            {progression?.erreurs.length ? <><br />{progression.erreurs.join(" · ")}</> : null}
          </span>
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={enCours}>
        <Icone nom="upload" taille={16} /> {enCours ? "Envoi en cours…" : "Ajouter à la galerie"}
      </button>
    </form>
  );
}
