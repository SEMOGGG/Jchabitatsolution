"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Icone from "@/components/Icone";
import AvantApres from "./AvantApres";
import type { ElementGalerie } from "@/lib/types";

const TOUTES = "Toutes";
const AVANT_APRES = "Avant / après";
const EASE = [0.22, 1, 0.36, 1] as const;

export default function GrilleGalerie({ elements }: { elements: ElementGalerie[] }) {
  const [filtre, setFiltre] = useState<string>(TOUTES);
  const [ouvert, setOuvert] = useState<number | null>(null);
  const [sens, setSens] = useState(1);

  const categories = useMemo(() => {
    const presentes = Array.from(new Set(elements.map((e) => e.categorie)));
    return [TOUTES, AVANT_APRES, ...presentes];
  }, [elements]);

  const visibles = useMemo(() => {
    if (filtre === TOUTES) return elements;
    if (filtre === AVANT_APRES) return elements.filter((e) => e.type === "avant_apres");
    return elements.filter((e) => e.categorie === filtre);
  }, [elements, filtre]);

  const fermer = useCallback(() => setOuvert(null), []);
  const suivant = useCallback(() => {
    setSens(1);
    setOuvert((i) => (i === null ? null : (i + 1) % visibles.length));
  }, [visibles.length]);
  const precedent = useCallback(() => {
    setSens(-1);
    setOuvert((i) => (i === null ? null : (i - 1 + visibles.length) % visibles.length));
  }, [visibles.length]);

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

  function compter(categorie: string): number {
    if (categorie === TOUTES) return elements.length;
    if (categorie === AVANT_APRES) return elements.filter((e) => e.type === "avant_apres").length;
    return elements.filter((e) => e.categorie === categorie).length;
  }

  return (
    <>
      <div className="galerie-filtres" role="tablist" aria-label="Filtrer par catégorie">
        {categories.map((categorie) => {
          const nombre = compter(categorie);
          if (nombre === 0 && categorie !== TOUTES) return null;
          const actif = filtre === categorie;
          return (
            <button
              key={categorie}
              type="button"
              role="tab"
              aria-selected={actif}
              className={`chip chip-anime${actif ? " active" : ""}`}
              onClick={() => setFiltre(categorie)}
            >
              {actif && <motion.span layoutId="chip-fond" className="chip-fond" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="chip-texte">
                {categorie} <span className="chip-nombre">{nombre}</span>
              </span>
            </button>
          );
        })}
      </div>

      {visibles.length === 0 ? (
        <p className="text-muted">Aucune photo dans cette catégorie pour le moment.</p>
      ) : (
        <motion.div
          key={filtre}
          className="galerie-grille"
          initial="cache"
          animate="visible"
          variants={{ cache: {}, visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {visibles.map((element, index) => (
            <motion.figure
              key={element.id}
              className="galerie-item"
              variants={{
                cache: { opacity: 0, y: 24, scale: 0.97 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
              }}
            >
              {element.type === "avant_apres" && element.image_avant_url && element.image_apres_url ? (
                <AvantApres avant={element.image_avant_url} apres={element.image_apres_url} titre={element.titre} />
              ) : (
                <button type="button" className="galerie-photo" onClick={() => { setSens(1); setOuvert(index); }} aria-label={`Agrandir : ${element.titre}`}>
                  <img src={element.image_url ?? ""} alt={element.titre} loading="lazy" />
                  <span className="galerie-loupe" aria-hidden="true"><Icone nom="search" taille={18} /></span>
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
            </motion.figure>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {courant && (
          <motion.div
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={courant.titre}
            onClick={fermer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button type="button" className="lightbox-fermer" onClick={fermer} aria-label="Fermer">
              <Icone nom="close" taille={22} />
            </button>
            {visibles.length > 1 && (
              <>
                <button type="button" className="lightbox-nav precedent" onClick={(e) => { e.stopPropagation(); precedent(); }} aria-label="Photo précédente">
                  <Icone nom="chevron-left" taille={26} />
                </button>
                <button type="button" className="lightbox-nav suivant" onClick={(e) => { e.stopPropagation(); suivant(); }} aria-label="Photo suivante">
                  <Icone nom="chevron-right" taille={26} />
                </button>
              </>
            )}
            <AnimatePresence mode="wait" custom={sens}>
              <motion.div
                key={courant.id}
                className="lightbox-contenu"
                onClick={(e) => e.stopPropagation()}
                custom={sens}
                initial={{ opacity: 0, x: 60 * sens, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -60 * sens, scale: 0.96 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                {courant.type === "avant_apres" && courant.image_avant_url && courant.image_apres_url ? (
                  <AvantApres avant={courant.image_avant_url} apres={courant.image_apres_url} titre={courant.titre} grand />
                ) : (
                  <img src={courant.image_url ?? ""} alt={courant.titre} />
                )}
                <div className="lightbox-legende">
                  <span className="tag">{courant.categorie}{courant.lieu ? ` · ${courant.lieu}` : ""}</span>
                  <strong>{courant.titre}</strong>
                  {courant.description && <p>{courant.description}</p>}
                  {visibles.length > 1 && ouvert !== null && <span className="lightbox-compteur">{ouvert + 1} / {visibles.length}</span>}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
