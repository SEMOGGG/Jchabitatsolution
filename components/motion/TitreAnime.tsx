"use client";

import { motion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function TitreAnime({
  texte,
  surligne,
  className,
  niveau = "h1",
  delai = 0,
  auChargement = true,
}: {
  texte: string;
  surligne?: string;
  className?: string;
  niveau?: "h1" | "h2";
  delai?: number;
  auChargement?: boolean;
}) {
  const mots = texte.split(" ");
  const Balise = motion[niveau];
  const declencheur = auChargement
    ? { initial: "cache", animate: "visible" }
    : { initial: "cache", whileInView: "visible", viewport: { once: true, margin: "-80px" } };

  return (
    <Balise
      className={`titre-anime ${className ?? ""}`}
      aria-label={texte}
      {...declencheur}
      variants={{ cache: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: delai } } }}
    >
      {mots.map((mot, index) => {
        const estSurligne = surligne && mot.replace(/[,.]/g, "") === surligne;
        return (
          <span key={`${mot}-${index}`} className="mot-masque" aria-hidden="true">
            <motion.span
              className={`mot${estSurligne ? " mot-surligne" : ""}`}
              variants={{
                cache: { y: "110%", rotate: 4 },
                visible: { y: "0%", rotate: 0, transition: { duration: 0.8, ease: EASE } },
              }}
            >
              {mot}
              {estSurligne && (
                <motion.span
                  className="trait-surligne"
                  variants={{
                    cache: { scaleX: 0 },
                    visible: { scaleX: 1, transition: { duration: 0.7, ease: EASE, delay: 0.55 } },
                  }}
                />
              )}
            </motion.span>
            {index < mots.length - 1 ? " " : ""}
          </span>
        );
      })}
    </Balise>
  );
}
