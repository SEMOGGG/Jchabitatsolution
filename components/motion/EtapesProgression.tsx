"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

export default function EtapesProgression({ etapes }: { etapes: { titre: string; texte: string }[] }) {
  const conteneur = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: conteneur, offset: ["start 75%", "end 55%"] });
  const echelle = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  return (
    <ol ref={conteneur} className="etapes-anim">
      <span className="etapes-rail" aria-hidden="true">
        <motion.span className="etapes-rail-plein" style={{ scaleY: echelle }} />
      </span>
      {etapes.map((etape, index) => (
        <Etape key={etape.titre} etape={etape} index={index} total={etapes.length} progression={scrollYProgress} />
      ))}
    </ol>
  );
}

function Etape({
  etape,
  index,
  total,
  progression,
}: {
  etape: { titre: string; texte: string };
  index: number;
  total: number;
  progression: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const seuil = total > 1 ? index / (total - 1) : 0;
  const actif = useTransform(progression, [Math.max(0, seuil - 0.12), seuil], [0, 1]);
  const fond = useTransform(actif, [0, 1], ["#FFFFFF", "#1FA9D4"]);
  const texte = useTransform(actif, [0, 1], ["#7C97A4", "#FFFFFF"]);
  const bordure = useTransform(actif, [0, 1], ["#DCE7ED", "#1FA9D4"]);

  return (
    <motion.li
      className="etape-anim"
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
    >
      <motion.span className="etape-pastille" style={{ backgroundColor: fond, color: texte, borderColor: bordure }}>
        {String(index + 1).padStart(2, "0")}
      </motion.span>
      <div>
        <h3>{etape.titre}</h3>
        <p>{etape.texte}</p>
      </div>
    </motion.li>
  );
}
