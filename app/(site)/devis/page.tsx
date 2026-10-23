import type { Metadata } from "next";
import FormulaireDevis from "@/components/devis/FormulaireDevis";
import TitreAnime from "@/components/motion/TitreAnime";
import { Apparait } from "@/components/motion/Apparait";
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
        <span className="hero-halo" aria-hidden="true" />
        <div className="container">
          <Apparait><span className="eyebrow">Devis &amp; rendez-vous</span></Apparait>
          <TitreAnime texte="Réservez un créneau pour votre devis" surligne="créneau" className="h2 page-hero-titre" />
          <Apparait delai={0.35}>
            <p className="lede" style={{ marginTop: ".8rem" }}>
              Choisissez un créneau libre, décrivez votre projet en deux mots et laissez votre e-mail. {parametres.dirigeant} vous confirme le rendez-vous et la suite se fait par e-mail.
            </p>
          </Apparait>
        </div>
      </section>
      <section className="section-tight">
        <div className="container">
          <Apparait delai={0.2}>
            <FormulaireDevis />
          </Apparait>
        </div>
      </section>
    </>
  );
}
