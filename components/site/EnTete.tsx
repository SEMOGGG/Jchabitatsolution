"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    setOuvert(false);
  }, [chemin]);

  return (
    <header className="site-header">
      <div className="container nav">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <img src="/images/logo-mark.png" alt="Logo JC Habitat Solutions" />
          </span>
          <span>
            JC Habitat Solutions<small>Nettoyage professionnel</small>
          </span>
        </Link>
        <nav className={`nav-links${ouvert ? " is-open" : ""}`} aria-label="Navigation principale">
          {LIENS.map((lien) => (
            <Link key={lien.href} href={lien.href} className={chemin === lien.href ? "active" : ""}>
              {lien.libelle}
            </Link>
          ))}
          <Link href="/devis" className="btn btn-primary btn-sm nav-cta-mobile">
            Demander un devis
          </Link>
        </nav>
        <div className="nav-actions">
          <Link href="/devis" className="btn btn-primary btn-sm">
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
    </header>
  );
}
