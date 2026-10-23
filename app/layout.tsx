import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import "./globals.css";
import "./site.css";
import "./admin.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "JC Habitat Solutions — Nettoyage professionnel en Île-de-France",
    template: "%s — JC Habitat Solutions",
  },
  description:
    "Nettoyage professionnel pour bureaux, commerces, collectivités, vitrerie en hauteur et remise en état. Demande de devis et prise de rendez-vous en ligne.",
  icons: { icon: "/images/logo-mark.png" },
  openGraph: {
    title: "JC Habitat Solutions — Nettoyage professionnel",
    description: "Bureaux, commerces, collectivités, vitrerie en hauteur et remise en état en Île-de-France.",
    images: ["/images/hero-mairie.jpg"],
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      localization={frFR}
      appearance={{
        variables: {
          colorPrimary: "#1FA9D4",
          colorText: "#0A2A40",
          borderRadius: "10px",
          fontFamily: "Inter, sans-serif",
        },
      }}
    >
      <html lang="fr">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
