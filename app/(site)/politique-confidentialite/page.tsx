import type { Metadata } from "next";
import { lireParametres } from "@/lib/donnees";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default async function PolitiqueConfidentialite() {
  const p = await lireParametres();
  return (
    <>
      <div className="legal-hero">
        <div className="container">
          <span className="eyebrow">Vos données</span>
          <h1 className="h2" style={{ marginTop: ".8rem" }}>Politique de confidentialité</h1>
          <p className="updated">Dernière mise à jour : octobre 2026</p>
        </div>
      </div>
      <div className="container">
        <div className="legal-page">
          <div className="callout">Modèle RGPD décrivant les données réellement collectées par ce site, à faire valider avant la mise en ligne définitive.</div>

          <h2>Responsable du traitement</h2>
          <p>
            {p.entreprise_nom} ({p.dirigeant}) est responsable du traitement des données collectées sur ce site. Contact :{" "}
            <a href={`mailto:${p.email_contact}`}>{p.email_contact}</a>.
          </p>

          <h2>Données collectées</h2>
          <p>Lorsque vous envoyez une demande de devis, nous collectons :</p>
          <ul>
            <li>votre prénom, votre nom et votre adresse e-mail ;</li>
            <li>la nature de votre projet et, si vous les ajoutez, vos précisions et une photo des lieux ;</li>
            <li>le créneau de rendez-vous choisi ;</li>
            <li>une empreinte anonymisée de votre adresse IP, utilisée uniquement pour limiter les envois abusifs.</li>
          </ul>
          <p>Aucune donnée bancaire n&apos;est collectée. Aucun compte client n&apos;est nécessaire.</p>

          <h2>Finalités</h2>
          <ul>
            <li>traiter votre demande, organiser le rendez-vous et établir un devis ;</li>
            <li>vous envoyer les e-mails liés à votre demande (accusé de réception, confirmation, suivi).</li>
          </ul>
          <p>La base légale est l&apos;exécution de mesures précontractuelles prises à votre demande.</p>

          <h2>Durée de conservation</h2>
          <p>Les demandes sont conservées 3 ans après le dernier contact, puis supprimées. Vous pouvez demander leur suppression à tout moment.</p>

          <h2>Destinataires et sous-traitants</h2>
          <p>
            Vos données sont destinées uniquement à {p.entreprise_nom}. Elles ne sont ni vendues ni cédées. Elles sont hébergées et traitées par des prestataires techniques
            nécessaires au fonctionnement du site : Vercel (hébergement), Supabase (base de données et stockage des photos), Resend (envoi des e-mails) et Clerk (connexion à l&apos;espace professionnel).
          </p>

          <h2>Vos droits</h2>
          <p>
            Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition et de portabilité. Écrivez à{" "}
            <a href={`mailto:${p.email_contact}`}>{p.email_contact}</a>. Vous pouvez aussi introduire une réclamation auprès de la CNIL.
          </p>

          <h2>Cookies</h2>
          <p>Le site public n&apos;utilise aucun cookie publicitaire ni de mesure d&apos;audience. Seuls des cookies techniques sont utilisés pour la connexion à l&apos;espace professionnel.</p>
        </div>
      </div>
    </>
  );
}
