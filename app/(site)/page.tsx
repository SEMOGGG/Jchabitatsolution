import Link from "next/link";
import Icone, { type NomIcone } from "@/components/Icone";
import HeroRaclette from "@/components/motion/HeroRaclette";
import TitreAnime from "@/components/motion/TitreAnime";
import Compteur from "@/components/motion/Compteur";
import BandeauDefilant from "@/components/motion/BandeauDefilant";
import EtapesProgression from "@/components/motion/EtapesProgression";
import Bento from "@/components/motion/Bento";
import { Apparait, Cascade, ElementCascade } from "@/components/motion/Apparait";
import { lireAvisVisibles, lireGalerie } from "@/lib/donnees";

export const revalidate = 300;

const SERVICES: { icone: NomIcone; titre: string; texte: string }[] = [
  { icone: "building", titre: "Bureaux & commerces", texte: "Dépoussiérage, sols et sanitaires entretenus à la fréquence de votre choix." },
  { icone: "buildings", titre: "Collectivités & bâtiments publics", texte: "Mairies, écoles et gymnases : remise en état et entretien régulier." },
  { icone: "storefront", titre: "Salons & instituts", texte: "Un espace impeccable pour accueillir vos clients, à l'ouverture ou en journée." },
  { icone: "window", titre: "Vitrerie en hauteur", texte: "Nettoyage à la perche télescopique, sans échelle, jusqu'à plusieurs mètres de haut." },
  { icone: "broom", titre: "Façades & remise en état", texte: "Marches, statues, pierre : décapage et remise en état des extérieurs." },
  { icone: "home", titre: "Particuliers", texte: "Ménage régulier ou ponctuel à domicile, sur devis personnalisé." },
];

const ETAPES = [
  { titre: "Choisissez un créneau", texte: "Indiquez la nature de votre projet, ajoutez une photo si vous le souhaitez et réservez un créneau libre dans le planning." },
  { titre: "Confirmation par e-mail", texte: "Vous recevez un accusé de réception immédiat, puis la confirmation du rendez-vous." },
  { titre: "Évaluation sur place ou à distance", texte: "Selon la prestation, un échange ou une visite permet d'affiner le périmètre exact." },
  { titre: "Devis et intervention", texte: "Le devis détaillé et la suite se règlent directement par e-mail." },
];

const ZONES = [
  "Sceaux",
  "Mairies & écoles",
  "Roissy-en-Brie",
  "Vitrerie en hauteur",
  "Émerainville",
  "Salons & instituts",
  "Île-de-France",
  "Façades en pierre",
  "Bureaux & commerces",
];

function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .slice(0, 2)
    .map((m) => m.charAt(0).toUpperCase())
    .join("");
}

export default async function Accueil() {
  const [realisations, avis] = await Promise.all([lireGalerie({ seulementEnAvant: true, limite: 6 }), lireAvisVisibles()]);

  return (
    <>
      <section className="hero">
        <span className="hero-halo" aria-hidden="true" />
        <div className="container hero-grille">
          <div className="hero-texte">
            <Apparait>
              <span className="eyebrow">Nettoyage professionnel — Île-de-France</span>
            </Apparait>
            <TitreAnime texte="Des locaux impeccables, visibles avant même votre visite." surligne="impeccables" className="hero-titre" delai={0.15} />
            <Apparait delai={0.55}>
              <p className="lede">
                Bureaux, commerces, mairies, écoles, vitrerie en hauteur : je prends en charge le nettoyage de vos espaces, avec un rendez-vous réservé en ligne et un suivi par e-mail.
              </p>
            </Apparait>
            <Apparait delai={0.7} className="hero-actions">
              <Link href="/devis" className="btn btn-primary btn-grand">
                Réserver un créneau <Icone nom="arrow-right" taille={17} />
              </Link>
              <Link href="/galerie" className="btn btn-outline btn-grand">
                Voir les chantiers
              </Link>
            </Apparait>
            <Apparait delai={0.85} className="hero-garantie">
              <Icone nom="shield-check" taille={17} />
              Devis sans engagement · aucune donnée bancaire
            </Apparait>
          </div>
          <HeroRaclette image="/images/hero-mairie.jpg" legende="Mairie de Sceaux" sousLegende="Façade & extérieurs" />
        </div>
      </section>

      <BandeauDefilant elements={ZONES} />

      <section className="section-chiffres">
        <div className="container">
          <Cascade className="chiffres">
            <ElementCascade className="chiffre">
              <span className="chiffre-valeur"><Compteur valeur={2684} suffixe=" m²" /></span>
              <span className="chiffre-libelle">nettoyés en une seule intervention, dans une école</span>
            </ElementCascade>
            <ElementCascade className="chiffre">
              <span className="chiffre-valeur"><Compteur valeur={48} prefixe="< " suffixe=" h" duree={1.2} /></span>
              <span className="chiffre-libelle">pour recevoir une réponse à votre demande</span>
            </ElementCascade>
            <ElementCascade className="chiffre">
              <span className="chiffre-valeur"><Compteur valeur={6} duree={1} /></span>
              <span className="chiffre-libelle">types d&apos;espaces : bureaux, collectivités, salons, vitrerie, façades, domicile</span>
            </ElementCascade>
          </Cascade>
        </div>
      </section>

      <section id="services">
        <div className="container">
          <div className="section-head">
            <Apparait><span className="eyebrow">Mes prestations</span></Apparait>
            <TitreAnime niveau="h2" texte="Un service pour chaque type d'espace" auChargement={false} />
            <Apparait delai={0.2}>
              <p className="lede">Fréquence, périmètre et exigences : chaque prestation est cadrée dès la demande de devis.</p>
            </Apparait>
          </div>
          <Cascade className="grid grid-3 services-grille">
            {SERVICES.map((service) => (
              <ElementCascade key={service.titre} className="card service-card">
                <span className="icon"><Icone nom={service.icone} taille={24} /></span>
                <h3>{service.titre}</h3>
                <p>{service.texte}</p>
                <span className="service-reflet" aria-hidden="true" />
              </ElementCascade>
            ))}
          </Cascade>
        </div>
      </section>

      <section id="realisations" className="section-sombre">
        <div className="container">
          <div className="section-head-ligne">
            <div className="section-head">
              <Apparait><span className="eyebrow eyebrow-clair">Mes réalisations</span></Apparait>
              <TitreAnime niveau="h2" texte="Des chantiers réels, en photo" auChargement={false} />
              <Apparait delai={0.2}>
                <p className="lede">Un aperçu des derniers chantiers — tous les autres sont dans la galerie.</p>
              </Apparait>
            </div>
            <Apparait delai={0.3}>
              <Link href="/galerie" className="btn btn-primary">
                Toute la galerie <Icone nom="arrow-right" taille={17} />
              </Link>
            </Apparait>
          </div>
          {realisations.length === 0 ? <p className="text-muted">Les premières réalisations arrivent bientôt.</p> : <Bento elements={realisations} />}
        </div>
      </section>

      <section id="etapes">
        <div className="container">
          <div className="grid grid-2 etapes-grille">
            <div className="etapes-intro">
              <Apparait><span className="eyebrow">Comment ça marche</span></Apparait>
              <TitreAnime niveau="h2" texte="De la demande à l'intervention" auChargement={false} className="etapes-titre" />
              <Apparait delai={0.2}>
                <p className="lede" style={{ marginTop: "1rem" }}>
                  Un parcours volontairement simple : vous réservez un créneau en ligne, la suite se règle directement par e-mail.
                </p>
              </Apparait>
              <Apparait delai={0.3}>
                <Link href="/devis" className="btn btn-primary" style={{ marginTop: "1.8rem" }}>
                  Réserver un créneau <Icone nom="arrow-right" taille={17} />
                </Link>
              </Apparait>
            </div>
            <EtapesProgression etapes={ETAPES} />
          </div>
        </div>
      </section>

      {avis.length > 0 && (
        <section className="section-surface">
          <div className="container">
            <div className="section-head">
              <Apparait><span className="eyebrow">Témoignages</span></Apparait>
              <TitreAnime niveau="h2" texte="Ce qu'en disent mes clients" auChargement={false} />
            </div>
            <Cascade className="grid grid-3" intervalle={0.12}>
              {avis.map((a) => (
                <ElementCascade key={a.id} className="quote-card">
                  <span className="quote-guillemet" aria-hidden="true">“</span>
                  <div className="etoiles" aria-label={`${a.note} sur 5`}>
                    {"★".repeat(a.note)}
                    <span className="etoiles-vides">{"★".repeat(5 - a.note)}</span>
                  </div>
                  <p>{a.texte}</p>
                  <div className="who">
                    <span className="avatar">{initiales(a.nom_client)}</span>
                    <span>
                      {a.nom_client}
                      {a.fonction && <small>{a.fonction}</small>}
                    </span>
                  </div>
                </ElementCascade>
              ))}
            </Cascade>
          </div>
        </section>
      )}

      <section>
        <div className="container">
          <Apparait className="cta-band">
            <span className="cta-reflet" aria-hidden="true" />
            <div>
              <h2>Besoin d&apos;un devis rapide et sans engagement ?</h2>
              <p>Choisissez un créneau dans le planning en moins de deux minutes. Réponse sous 24 à 48h.</p>
            </div>
            <Link href="/devis" className="btn btn-dark btn-grand">
              Réserver un créneau <Icone nom="arrow-right" taille={17} />
            </Link>
          </Apparait>
        </div>
      </section>
    </>
  );
}
