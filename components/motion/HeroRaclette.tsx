"use client";

import { animate, motion, useMotionValue, useMotionTemplate, useReducedMotion, useTransform } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import Icone from "@/components/Icone";

const ETINCELLES = [
  { x: "18%", y: "22%", t: 0 },
  { x: "72%", y: "16%", t: 0.15 },
  { x: "58%", y: "48%", t: 0.3 },
  { x: "26%", y: "64%", t: 0.45 },
  { x: "84%", y: "70%", t: 0.6 },
];

export default function HeroRaclette({ image, legende, sousLegende }: { image: string; legende: string; sousLegende: string }) {
  const reduit = useReducedMotion();
  const progression = useMotionValue(reduit ? 104 : 0);
  const [termine, setTermine] = useState(Boolean(reduit));
  const [enCours, setEnCours] = useState(false);

  const droite = useTransform(progression, (p) => `${Math.max(0, 100 - p)}%`);
  const masque = useMotionTemplate`inset(0 ${droite} 0 0)`;
  const gauche = useTransform(progression, (p) => `${p}%`);
  const opaciteRaclette = useTransform(progression, [0, 4, 96, 104], [0, 1, 1, 0]);

  const lancer = useCallback(
    (delai = 0) => {
      if (reduit) return;
      setTermine(false);
      setEnCours(true);
      progression.set(0);
      const controle = animate(progression, 104, {
        duration: 2.4,
        delay: delai,
        ease: [0.65, 0, 0.35, 1],
        onComplete: () => {
          setTermine(true);
          setEnCours(false);
        },
      });
      return controle;
    },
    [progression, reduit]
  );

  useEffect(() => {
    const controle = lancer(0.7);
    return () => controle?.stop();
  }, [lancer]);

  return (
    <div className="hero-visuel">
      <motion.div
        className="hero-cadre"
        initial={{ opacity: 0, scale: 0.94, rotate: -1.5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <img src={image} alt="" className="hero-calque hero-sale" aria-hidden="true" />
        <span className="hero-salissure" aria-hidden="true" />
        <motion.img src={image} alt={legende} className="hero-calque hero-propre" style={{ clipPath: masque }} />

        <motion.div className="raclette" style={{ left: gauche, opacity: opaciteRaclette }} aria-hidden="true">
          <span className="raclette-traine" />
          <span className="raclette-lame" />
          <span className="raclette-manche" />
        </motion.div>

        {termine &&
          ETINCELLES.map((e, i) => (
            <motion.span
              key={i}
              className="etincelle"
              style={{ left: e.x, top: e.y }}
              initial={{ scale: 0, opacity: 0, rotate: 0 }}
              animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0], rotate: 90 }}
              transition={{ duration: 1.1, delay: e.t, ease: "easeOut" }}
              aria-hidden="true"
            >
              ✦
            </motion.span>
          ))}

        <button type="button" className="hero-rejouer" onClick={() => lancer(0)} disabled={enCours} aria-label="Rejouer l'animation de nettoyage">
          <Icone nom="window" taille={15} />
          {enCours ? "Nettoyage…" : "Repasser un coup"}
        </button>
      </motion.div>

      <motion.div
        className="hero-puce hero-puce-haut"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
        transition={{ opacity: { delay: 1.2, duration: 0.6 }, x: { delay: 1.2, duration: 0.6 }, y: { delay: 2, duration: 5, repeat: Infinity, ease: "easeInOut" } }}
      >
        <span className="hero-puce-icone"><Icone nom="clock" taille={16} /></span>
        <span><strong>Réponse &lt; 48h</strong><small>devis sans engagement</small></span>
      </motion.div>

      <motion.div
        className="hero-puce hero-puce-bas"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0, y: [0, 6, 0] }}
        transition={{ opacity: { delay: 1.45, duration: 0.6 }, x: { delay: 1.45, duration: 0.6 }, y: { delay: 2.2, duration: 6, repeat: Infinity, ease: "easeInOut" } }}
      >
        <span className="hero-puce-icone vert"><Icone nom="pin" taille={16} /></span>
        <span><strong>{legende}</strong><small>{sousLegende}</small></span>
      </motion.div>
    </div>
  );
}
