"use client";

import { motion } from "motion/react";
import AvantApres from "@/components/galerie/AvantApres";
import type { ElementGalerie } from "@/lib/types";

function classeBento(index: number): string {
  const position = index % 6;
  if (position === 0) return "bento-grand";
  if (position === 3) return "bento-large";
  return "";
}

export default function Bento({ elements }: { elements: ElementGalerie[] }) {
  return (
    <motion.div
      className="bento"
      initial="cache"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ cache: {}, visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {elements.map((e, index) => (
        <motion.figure
          key={e.id}
          className={`bento-carte ${classeBento(index)}`}
          variants={{
            cache: { opacity: 0, y: 40, scale: 0.97 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
          }}
        >
          {e.type === "avant_apres" && e.image_avant_url && e.image_apres_url ? (
            <AvantApres avant={e.image_avant_url} apres={e.image_apres_url} titre={e.titre} />
          ) : (
            <>
              <span className="bento-flou" style={{ backgroundImage: `url("${e.image_url}")` }} aria-hidden="true" />
              <img src={e.image_url ?? ""} alt={e.titre} loading="lazy" className="bento-image" />
            </>
          )}
          <figcaption className="bento-legende">
            <span>{e.categorie}{e.lieu ? ` · ${e.lieu}` : ""}</span>
            <strong>{e.titre}</strong>
          </figcaption>
        </motion.figure>
      ))}
    </motion.div>
  );
}
