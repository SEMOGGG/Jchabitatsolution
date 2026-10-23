"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SignOutButton } from "@clerk/nextjs";
import Icone, { type NomIcone } from "@/components/Icone";

type Lien = { href: string; libelle: string; icone: NomIcone; adminSeulement?: boolean; badge?: number };

export default function BarreLaterale({
  nom,
  email,
  role,
  nouvellesDemandes,
}: {
  nom: string;
  email: string;
  role: "admin" | "editeur";
  nouvellesDemandes: number;
}) {
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => setOuvert(false), [chemin]);

  const liens: Lien[] = [
    { href: "/admin", libelle: "Tableau de bord", icone: "grid" },
    { href: "/admin/demandes", libelle: "Demandes", icone: "document", badge: nouvellesDemandes },
    { href: "/admin/planning", libelle: "Planning", icone: "calendar" },
    { href: "/admin/galerie", libelle: "Galerie", icone: "image" },
    { href: "/admin/avis", libelle: "Avis clients", icone: "star" },
    { href: "/admin/utilisateurs", libelle: "Utilisateurs", icone: "users", adminSeulement: true },
    { href: "/admin/parametres", libelle: "Paramètres", icone: "settings", adminSeulement: true },
    { href: "/admin/journal", libelle: "Journal d'activité", icone: "list", adminSeulement: true },
  ];

  const initiales = nom
    .split(/\s+/)
    .slice(0, 2)
    .map((m) => m.charAt(0).toUpperCase())
    .join("");

  return (
    <aside className={`app-sidebar${ouvert ? " is-open" : ""}`}>
      <div className="sidebar-haut">
        <Link href="/admin" className="brand">
          <span className="brand-mark">
            <img src="/images/logo-mark.png" alt="Logo JC Habitat Solutions" />
          </span>
          <span>JC Habitat Solutions</span>
        </Link>
        <button type="button" className="sidebar-toggle" onClick={() => setOuvert((v) => !v)} aria-label="Menu" aria-expanded={ouvert}>
          <Icone nom={ouvert ? "close" : "menu"} taille={22} />
        </button>
      </div>

      <nav className="app-nav">
        <span className="group-label">Gestion</span>
        {liens
          .filter((l) => !l.adminSeulement || role === "admin")
          .map((lien) => {
            const actif = lien.href === "/admin" ? chemin === "/admin" : chemin.startsWith(lien.href);
            return (
              <Link key={lien.href} href={lien.href} className={actif ? "active" : ""}>
                <Icone nom={lien.icone} />
                {lien.libelle}
                {lien.badge ? <span className="nav-badge">{lien.badge}</span> : null}
              </Link>
            );
          })}
        <span className="group-label">Site</span>
        <Link href="/" target="_blank">
          <Icone nom="external" />
          Voir le site
        </Link>
      </nav>

      <div className="app-user">
        <span className="avatar">{initiales}</span>
        <span className="who">
          <strong>{nom}</strong>
          <span>{role === "admin" ? "Administrateur" : "Éditeur"} · {email}</span>
        </span>
        <SignOutButton redirectUrl="/">
          <button type="button" className="bouton-deconnexion" title="Se déconnecter">
            <Icone nom="logout" taille={17} />
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
