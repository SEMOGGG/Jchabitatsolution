"use client";

import { useRef, useState } from "react";
import Icone from "@/components/Icone";

export default function AvantApres({
  avant,
  apres,
  titre,
  grand = false,
}: {
  avant: string;
  apres: string;
  titre: string;
  grand?: boolean;
}) {
  const conteneur = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [glisse, setGlisse] = useState(false);

  function deplacer(clientX: number) {
    const rect = conteneur.current?.getBoundingClientRect();
    if (!rect) return;
    const pourcentage = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(98, Math.max(2, pourcentage)));
  }

  return (
    <div
      ref={conteneur}
      className={`ba-photo${grand ? " ba-photo-grand" : ""}`}
      onPointerDown={(e) => {
        e.stopPropagation();
        setGlisse(true);
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        deplacer(e.clientX);
      }}
      onPointerMove={(e) => glisse && deplacer(e.clientX)}
      onPointerUp={() => setGlisse(false)}
      onPointerCancel={() => setGlisse(false)}
      onClick={(e) => e.stopPropagation()}
      role="slider"
      aria-label={`Comparer avant et après — ${titre}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPosition((p) => Math.max(2, p - 5));
        if (e.key === "ArrowRight") setPosition((p) => Math.min(98, p + 5));
      }}
    >
      <img src={avant} alt={`${titre} — avant`} draggable={false} />
      <img
        src={apres}
        alt={`${titre} — après`}
        draggable={false}
        className="ba-photo-apres"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      />
      <span className="ba-tag before">AVANT</span>
      <span className="ba-tag after">APRÈS</span>
      <div className="ba-handle" style={{ left: `${position}%` }}>
        <div className="ba-grip">
          <Icone nom="drag" taille={16} />
        </div>
      </div>
    </div>
  );
}
