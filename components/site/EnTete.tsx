"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import Icone from "@/components/Icone";

const LIENS = [
  { href: "/", libelle: "Accueil" },
  { href: "/#services", libelle: "Services" },
  { href: "/galerie", libelle: "Galerie" },
  { href: "/#etapes", libelle: "Comment ça marche" },
  { href: "/#contact", libelle: "Contact" },
];

export default function EnTete() {
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const [defile, setDefile] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setDefile(y > 12));

  useEffect(() => {
    setOuvert(false);
  }, [chemin]);

  return (
    <header className={`site-header${defile ? " defile" : ""}`}>
      <div className="container nav">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <img src="/images/logo-mark.png" alt="Logo JC Habitat Solutions" />
          </span>
          <span>
            JC Habitat Solutions<small>Nettoyage professionnel</small>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Navigation principale">
          {LIENS.map((lien) => (
            <Link key={lien.href} href={lien.href} className={chemin === lien.href ? "active" : ""}>
              {lien.libelle}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <Link href="/devis" className="btn btn-primary btn-sm nav-cta">
            Demander un devis
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={ouvert}
            onClick={() => setOuvert((v) => !v)}
          >
            <Icone nom={ouvert ? "close" : "menu"} taille={22} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {ouvert && (
          <motion.nav
            className="menu-mobile"
            aria-label="Navigation mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="menu-mobile-liens"
              initial="cache"
              animate="visible"
              variants={{ cache: {}, visible: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}
            >
              {LIENS.map((lien) => (
                <motion.div key={lien.href} variants={{ cache: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}>
                  <Link href={lien.href} onClick={() => setOuvert(false)}>
                    {lien.libelle}
                    <Icone nom="arrow-right" taille={16} />
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={{ cache: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
                <Link href="/devis" className="btn btn-primary btn-block" onClick={() => setOuvert(false)}>
                  Demander un devis
                </Link>
              </motion.div>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
