import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

export const metadata: Metadata = { title: "Accès refusé", robots: { index: false } };

export default function AccesRefuse() {
  return (
    <div className="page-centree">
      <div className="merci">
        <img src="/images/logo-mark.png" alt="" width={56} height={52} style={{ margin: "0 auto 1.2rem" }} />
        <h1 className="h2">Accès non autorisé</h1>
        <p className="lede">Votre compte est bien connecté, mais il n&apos;a pas encore accès au back-office. Demandez à un administrateur de vous attribuer un rôle.</p>
        <div className="flex gap-md" style={{ justifyContent: "center", marginTop: "1.6rem", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-outline">Retour au site</Link>
          <SignOutButton redirectUrl="/">
            <button type="button" className="btn btn-primary">Se déconnecter</button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
