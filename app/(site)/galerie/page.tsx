import type { Metadata } from "next";
import Link from "next/link";
import Icone from "@/components/Icone";
import GrilleGalerie from "@/components/galerie/GrilleGalerie";
import TitreAnime from "@/components/motion/TitreAnime";
import { Apparait } from "@/components/motion/Apparait";
import { lireGalerie } from "@/lib/donnees";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Galerie des chantiers",
  description: "Photos de chantiers, nettoyages et avant / après réalisés par JC Habitat Solutions en Île-de-France.",
};

export default async function PageGalerie() {
  const elements = await lireGalerie();
  const nombreAvantApres = elements.filter((e) => e.type === "avant_apres").length;

  return (
    <>
      <section className="page-hero">
        <span className="hero-halo" aria-hidden="true" />
        <div className="container">
          <Apparait><span className="eyebrow">Galerie</span></Apparait>
          <TitreAnime texte="Chantiers, nettoyages et avant / après" surligne="avant" className="h2 page-hero-titre" />
          <Apparait delai={0.35}>
            <p className="lede" style={{ marginTop: ".8rem" }}>
              {elements.length} photo{elements.length > 1 ? "s" : ""} de chantiers réels
              {nombreAvantApres > 0 ? `, dont ${nombreAvantApres} comparatif${nombreAvantApres > 1 ? "s" : ""} avant / après à faire glisser` : ""}.
            </p>
          </Apparait>
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <GrilleGalerie elements={elements} />
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <Apparait className="cta-band">
            <span className="cta-reflet" aria-hidden="true" />
            <div>
              <h2>Un chantier similaire à prévoir ?</h2>
              <p>Réservez un créneau et joignez une photo : c&apos;est le plus rapide pour obtenir un devis précis.</p>
            </div>
            <Link href="/devis" className="btn btn-dark">
              Demander un devis <Icone nom="arrow-right" taille={17} />
            </Link>
          </Apparait>
        </div>
      </section>
    </>
  );
}
