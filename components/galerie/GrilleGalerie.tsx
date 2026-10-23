"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Icone from "@/components/Icone";
import AvantApres from "./AvantApres";
import type { ElementGalerie } from "@/lib/types";

const TOUTES = "Toutes";

export default function GrilleGalerie({ elements }: { elements: ElementGalerie[] }) {
  const [filtre, setFiltre] = useState<string>(TOUTES);
  const [ouvert, setOuvert] = useState<number | null>(null);

  const categories = useMemo(() => {
    const presentes = Array.from(new Set(elements.map((e) => e.categorie)));
    return [TOUTES, "Avant / après", ...presentes];
  }, [elements]);

  const visibles = useMemo(() => {
    if (filtre === TOUTES) return elements;
    if (filtre === "Avant / après") return elements.filter((e) => e.type === "avant_apres");
    return elements.filter((e) => e.categorie === filtre);
  }, [elements, filtre]);

  const fermer = useCallback(() => setOuvert(null), []);
  const suivant = useCallback(
    () => setOuvert((i) => (i === null ? null : (i + 1) % visibles.length)),
    [visibles.length]
  );
  const precedent = useCallback(
    () => setOuvert((i) => (i === null ? null : (i - 1 + visibles.length) % visibles.length)),
    [visibles.length]
  );

  useEffect(() => {
    if (ouvert === null) return;
    function touche(e: KeyboardEvent) {
      if (e.key === "Escape") fermer();
      if (e.key === "ArrowRight") suivant();
      if (e.key === "ArrowLeft") precedent();
    }
    document.addEventListener("keydown", touche);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", touche);
      document.body.style.overflow = "";
    };
  }, [ouvert, fermer, suivant, precedent]);

  const courant = ouvert !== null ? visibles[ouvert] : null;

  return (
    <>
      <div className="galerie-filtres" role="tablist" aria-label="Filtrer par catégorie">
        {categories.map((categorie) => {
          const nombre =
            categorie === TOUTES
              ? elements.length
              : categorie === "Avant / après"
                ? elements.filter((e) => e.type === "avant_apres").length
                : elements.filter((e) => e.categorie === categorie).length;
          if (nombre === 0 && categorie !== TOUTES) return null;
          return (
            <button
              key={categorie}
              type="button"
              role="tab"
              aria-selected={filtre === categorie}
              className={`chip${filtre === categorie ? " active" : ""}`}
              onClick={() => setFiltre(categorie)}
            >
              {categorie} <span className="chip-nombre">{nombre}</span>
            </button>
          );
        })}
      </div>

      {visibles.length === 0 ? (
        <p className="text-muted">Aucune photo dans cette catégorie pour le moment.</p>
      ) : (
        <div className="galerie-grille">
          {visibles.map((element, index) => (
            <figure key={element.id} className="galerie-item">
              {element.type === "avant_apres" && element.image_avant_url && element.image_apres_url ? (
                <AvantApres avant={element.image_avant_url} apres={element.image_apres_url} titre={element.titre} />
              ) : (
                <button type="button" className="galerie-photo" onClick={() => setOuvert(index)} aria-label={`Agrandir : ${element.titre}`}>
                  <img src={element.image_url ?? ""} alt={element.titre} loading="lazy" />
                </button>
              )}
              <figcaption>
                <span className="tag">{element.categorie}{element.lieu ? ` · ${element.lieu}` : ""}</span>
                <strong>{element.titre}</strong>
                {element.type === "avant_apres" && (
                  <button type="button" className="lien-agrandir" onClick={() => setOuvert(index)}>
                    Agrandir
                  </button>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {courant && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={courant.titre} onClick={fermer}>
          <button type="button" className="lightbox-fermer" onClick={fermer} aria-label="Fermer">
            <Icone nom="close" taille={22} />
          </button>
          {visibles.length > 1 && (
            <>
              <button
                type="button"
                className="lightbox-nav precedent"
                onClick={(e) => { e.stopPropagation(); precedent(); }}
                aria-label="Photo précédente"
              >
                <Icone nom="chevron-left" taille={26} />
              </button>
              <button
                type="button"
                className="lightbox-nav suivant"
                onClick={(e) => { e.stopPropagation(); suivant(); }}
                aria-label="Photo suivante"
              >
                <Icone nom="chevron-right" taille={26} />
              </button>
            </>
          )}
          <div className="lightbox-contenu" onClick={(e) => e.stopPropagation()}>
            {courant.type === "avant_apres" && courant.image_avant_url && courant.image_apres_url ? (
              <AvantApres avant={courant.image_avant_url} apres={courant.image_apres_url} titre={courant.titre} grand />
            ) : (
              <img src={courant.image_url ?? ""} alt={courant.titre} />
            )}
            <div className="lightbox-legende">
              <span className="tag">{courant.categorie}{courant.lieu ? ` · ${courant.lieu}` : ""}</span>
              <strong>{courant.titre}</strong>
              {courant.description && <p>{courant.description}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
