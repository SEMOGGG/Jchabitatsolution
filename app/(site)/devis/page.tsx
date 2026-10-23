import type { Metadata } from "next";
import FormulaireDevis from "@/components/devis/FormulaireDevis";
import { lireParametres } from "@/lib/donnees";

export const metadata: Metadata = {
  title: "Demander un devis",
  description: "Réservez un créneau en ligne pour votre demande de devis de nettoyage professionnel.",
};

export default async function PageDevis() {
  const parametres = await lireParametres();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Devis &amp; rendez-vous</span>
          <h1 className="h2" style={{ marginTop: ".8rem" }}>Réservez un créneau pour votre devis</h1>
          <p className="lede" style={{ marginTop: ".8rem" }}>
            Choisissez un créneau libre, décrivez votre projet en deux mots et laissez votre e-mail. {parametres.dirigeant} vous confirme le rendez-vous et la suite se fait par e-mail.
          </p>
        </div>
      </section>
      <section className="section-tight">
        <div className="container">
          <FormulaireDevis />
        </div>
      </section>
    </>
  );
}
