"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const formateur = new Intl.NumberFormat("fr-FR");

export default function Compteur({ valeur, prefixe = "", suffixe = "", duree = 1.8 }: { valeur: number; prefixe?: string; suffixe?: string; duree?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true, margin: "-40px" });
  const reduit = useReducedMotion();
  const [affiche, setAffiche] = useState(reduit ? valeur : 0);

  useEffect(() => {
    if (!visible) return;
    if (reduit) {
      setAffiche(valeur);
      return;
    }
    const controle = animate(0, valeur, {
      duration: duree,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setAffiche(Math.round(v)),
    });
    return () => controle.stop();
  }, [visible, valeur, duree, reduit]);

  return (
    <span ref={ref} aria-label={`${prefixe}${formateur.format(valeur)}${suffixe}`}>
      <span aria-hidden="true">
        {prefixe}
        {formateur.format(affiche)}
        {suffixe}
      </span>
    </span>
  );
}
