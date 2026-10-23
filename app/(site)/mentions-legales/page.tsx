import type { Metadata } from "next";
import Link from "next/link";
import { lireParametres } from "@/lib/donnees";

export const metadata: Metadata = { title: "Mentions légales" };

export default async function MentionsLegales() {
  const p = await lireParametres();
  return (
    <>
      <div className="legal-hero">
        <div className="container">
          <span className="eyebrow">Informations légales</span>
          <h1 className="h2" style={{ marginTop: ".8rem" }}>Mentions légales</h1>
          <p className="updated">Dernière mise à jour : octobre 2026</p>
        </div>
      </div>
      <div className="container">
        <div className="legal-page">
          <div className="callout">
            Modèle à compléter avec les informations exactes de l&apos;entreprise (forme juridique, SIRET, adresse du siège) et à faire relire avant la mise en ligne définitive.
          </div>

          <h2>Éditeur du site</h2>
          <p>Le présent site est édité par <strong>{p.entreprise_nom}</strong>, exploité par {p.dirigeant}.</p>
          <ul>
            <li>Forme juridique : <em>[à compléter]</em></li>
            <li>SIRET : <em>[à compléter]</em></li>
            <li>Adresse du siège : <em>[à compléter]</em></li>
            <li>Téléphone : <a href={`tel:${p.telephone.replace(/\s+/g, "")}`}>{p.telephone}</a></li>
            <li>E-mail : <a href={`mailto:${p.email_contact}`}>{p.email_contact}</a></li>
          </ul>

          <h2>Directeur de la publication</h2>
          <p>{p.dirigeant}, en qualité de dirigeant de {p.entreprise_nom}.</p>

          <h2>Hébergement</h2>
          <p>
            Site hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com.
            Les données sont stockées par Supabase (base de données et fichiers), l&apos;authentification de l&apos;espace professionnel est assurée par Clerk et l&apos;envoi des e-mails par Resend.
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des contenus du site (textes, photographies de chantiers, logo, mise en page) est la propriété de {p.entreprise_nom}, sauf mention contraire. Toute reproduction sans autorisation préalable est interdite.
          </p>

          <h2>Données personnelles</h2>
          <p>
            Le traitement des données collectées via le formulaire de demande de devis est détaillé dans la{" "}
            <Link href="/politique-confidentialite">politique de confidentialité</Link>.
          </p>

          <h2>Droit applicable</h2>
          <p>Le présent site est soumis au droit français. En cas de litige, une solution amiable sera recherchée en priorité.</p>
        </div>
      </div>
    </>
  );
}
