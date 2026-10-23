import Link from "next/link";
import type { Parametres } from "@/lib/types";

export default function PiedDePage({ parametres }: { parametres: Parametres }) {
  const telephoneLien = parametres.telephone.replace(/\s+/g, "");
  return (
    <footer className="site-footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/" className="brand" style={{ color: "var(--paper)" }}>
              <span className="brand-mark">
                <img src="/images/logo-mark.png" alt="Logo JC Habitat Solutions" />
              </span>
              <span>{parametres.entreprise_nom}</span>
            </Link>
            <p>Nettoyage professionnel pour bureaux, commerces, collectivités et particuliers, avec un suivi clair de chaque demande.</p>
          </div>
          <div>
            <h4>Services</h4>
            <ul>
              <li><Link href="/#services">Bureaux &amp; commerces</Link></li>
              <li><Link href="/#services">Collectivités &amp; bâtiments publics</Link></li>
              <li><Link href="/#services">Salons &amp; instituts</Link></li>
              <li><Link href="/#services">Vitrerie en hauteur</Link></li>
              <li><Link href="/#services">Façades &amp; remise en état</Link></li>
            </ul>
          </div>
          <div>
            <h4>Ressources</h4>
            <ul>
              <li><Link href="/galerie">Galerie des chantiers</Link></li>
              <li><Link href="/devis">Demander un devis</Link></li>
              <li><Link href="/#etapes">Comment ça marche</Link></li>
              <li><Link href="/admin">Espace pro</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>{parametres.zone_intervention}</li>
              <li><a href={`tel:${telephoneLien}`}>{parametres.telephone}</a></li>
              <li><a href={`mailto:${parametres.email_contact}`}>{parametres.email_contact}</a></li>
              <li>{parametres.horaires}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {parametres.entreprise_nom} — Tous droits réservés.</p>
          <div className="flex gap-md">
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/politique-confidentialite">Politique de confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
