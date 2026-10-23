import type { Metadata } from "next";
import Link from "next/link";
import Icone from "@/components/Icone";
import CocheAnimee from "@/components/motion/CocheAnimee";
import { formatCreneau } from "@/lib/temps";

export const metadata: Metadata = {
  title: "Demande envoyée",
  robots: { index: false },
};

export default async function PageMerci({ searchParams }: { searchParams: Promise<{ creneau?: string }> }) {
  const { creneau } = await searchParams;
  const creneauValide = creneau && !Number.isNaN(new Date(creneau).getTime()) ? creneau : null;

  return (
    <section>
      <div className="container">
        <div className="merci">
          <CocheAnimee />
          <h1 className="h2">Demande bien envoyée</h1>
          {creneauValide ? (
            <p className="lede">
              Votre créneau du <strong>{formatCreneau(creneauValide, null)}</strong> est réservé. Vous allez recevoir un e-mail de confirmation.
            </p>
          ) : (
            <p className="lede">Vous allez recevoir un e-mail de confirmation. Nous revenons vers vous très vite pour fixer un rendez-vous.</p>
          )}
          <p className="text-muted">Pensez à vérifier vos courriers indésirables si vous ne voyez rien d&apos;ici quelques minutes.</p>
          <div className="flex gap-md" style={{ justifyContent: "center", flexWrap: "wrap", marginTop: "2rem" }}>
            <Link href="/" className="btn btn-outline">Retour à l&apos;accueil</Link>
            <Link href="/galerie" className="btn btn-primary">Voir la galerie <Icone nom="arrow-right" taille={16} /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
