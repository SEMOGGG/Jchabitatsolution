import Link from "next/link";
import Icone, { type NomIcone } from "@/components/Icone";
import AvantApres from "@/components/galerie/AvantApres";
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
      <section className="section-tight">
        <div className="container">
          <div className="grid grid-2 hero-grille">
            <div className="reveal">
              <span className="eyebrow">Nettoyage professionnel — Île-de-France</span>
              <h1 style={{ marginTop: "1rem" }}>Des locaux impeccables, visibles avant même votre visite.</h1>
              <p className="lede" style={{ marginTop: "1.3rem" }}>
                Bureaux, commerces, copropriétés, mairies et écoles : je prends en charge le nettoyage de vos espaces, avec une prise de rendez-vous en ligne et un suivi par e-mail.
              </p>
              <div className="flex gap-md" style={{ marginTop: "2rem", flexWrap: "wrap" }}>
                <Link href="/devis" className="btn btn-primary">
                  Réserver un créneau <Icone nom="arrow-right" taille={17} />
                </Link>
                <Link href="/galerie" className="btn btn-outline">
                  Voir la galerie
                </Link>
              </div>
              <div className="flex items-center gap-sm hero-garantie">
                <Icone nom="shield-check" taille={17} />
                Devis sans engagement · Réponse sous 24 à 48h
              </div>
            </div>
            <div className="reveal hero-photo-wrap">
              <div className="hero-photo">
                <img src="/images/hero-mairie.jpg" alt="Façade de la mairie de Sceaux entretenue par JC Habitat Solutions" />
              </div>
              <div className="hero-photo-tag">
                <strong>Mairie de Sceaux</strong>
                <span>Entretien de façade &amp; extérieurs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="stat-strip">
        <div className="stat"><span className="num">2 684 m²</span><span className="label">nettoyés en une seule intervention (école)</span></div>
        <div className="stat"><span className="num">Pro &amp; collectivités</span><span className="label">bureaux, commerces, mairies, écoles</span></div>
        <div className="stat"><span className="num">&lt; 48h</span><span className="label">délai de réponse à un devis</span></div>
      </div>

      <section id="services">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Mes prestations</span>
            <h2>Un service pour chaque type d&apos;espace</h2>
            <p className="lede">Fréquence, périmètre et exigences : chaque prestation est cadrée dès la demande de devis.</p>
          </div>
          <div className="grid grid-3">
            {SERVICES.map((service) => (
              <div key={service.titre} className="card service-card reveal">
                <span className="icon"><Icone nom={service.icone} taille={24} /></span>
                <h3>{service.titre}</h3>
                <p>{service.texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="realisations" className="section-surface">
        <div className="container">
          <div className="section-head-ligne reveal">
            <div className="section-head">
              <span className="eyebrow">Mes réalisations</span>
              <h2>Des interventions récentes, en photo</h2>
              <p className="lede">Un aperçu des derniers chantiers — retrouvez-les tous dans la galerie.</p>
            </div>
            <Link href="/galerie" className="btn btn-outline">
              Toute la galerie <Icone nom="arrow-right" taille={17} />
            </Link>
          </div>
          {realisations.length === 0 ? (
            <p className="text-muted">Les premières réalisations arrivent bientôt.</p>
          ) : (
            <div className="grid grid-3 realisations-grille">
              {realisations.map((r) => (
                <div key={r.id} className="work-card reveal">
                  <div className="thumb">
                    {r.type === "avant_apres" && r.image_avant_url && r.image_apres_url ? (
                      <AvantApres avant={r.image_avant_url} apres={r.image_apres_url} titre={r.titre} />
                    ) : (
                      <img src={r.image_url ?? ""} alt={r.titre} loading="lazy" />
                    )}
                  </div>
                  <div className="meta">
                    <span className="tag">{r.categorie}{r.lieu ? ` · ${r.lieu}` : ""}</span>
                    <h4>{r.titre}</h4>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="etapes">
        <div className="container">
          <div className="grid grid-2 etapes-grille">
            <div className="reveal etapes-intro">
              <span className="eyebrow">Comment ça marche</span>
              <h2 style={{ marginTop: "1rem" }}>De la demande à l&apos;intervention</h2>
              <p className="lede" style={{ marginTop: "1rem" }}>
                Un parcours volontairement simple : vous réservez un créneau en ligne, la suite se règle directement par e-mail.
              </p>
              <Link href="/devis" className="btn btn-primary" style={{ marginTop: "1.8rem" }}>
                Réserver un créneau <Icone nom="arrow-right" taille={17} />
              </Link>
            </div>
            <div className="steps reveal">
              {ETAPES.map((etape) => (
                <div key={etape.titre} className="step">
                  <span className="idx" />
                  <div>
                    <h3>{etape.titre}</h3>
                    <p>{etape.texte}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {avis.length > 0 && (
        <section className="section-surface">
          <div className="container">
            <div className="section-head reveal">
              <span className="eyebrow">Témoignages</span>
              <h2>Ce qu&apos;en disent mes clients</h2>
            </div>
            <div className="grid grid-3">
              {avis.map((a) => (
                <div key={a.id} className="quote-card reveal">
                  <div className="etoiles" aria-label={`${a.note} sur 5`}>
                    {"★".repeat(a.note)}
                    <span className="etoiles-vides">{"★".repeat(5 - a.note)}</span>
                  </div>
                  <p>« {a.texte} »</p>
                  <div className="who">
                    <span className="avatar">{initiales(a.nom_client)}</span>
                    <span>
                      {a.nom_client}
                      {a.fonction && <small>{a.fonction}</small>}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="container">
          <div className="cta-band reveal">
            <div>
              <h2>Besoin d&apos;un devis rapide et sans engagement ?</h2>
              <p>Choisissez un créneau dans le planning en moins de deux minutes. Réponse sous 24 à 48h.</p>
            </div>
            <Link href="/devis" className="btn btn-dark">
              Réserver un créneau <Icone nom="arrow-right" taille={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
