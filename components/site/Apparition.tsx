"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Apparition() {
  const chemin = usePathname();

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)"));
    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observateur = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((entree) => {
          if (entree.isIntersecting) {
            entree.target.classList.add("is-visible");
            observateur.unobserve(entree.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    elements.forEach((el) => observateur.observe(el));
    return () => observateur.disconnect();
  }, [chemin]);

  return null;
}
