import type { Metadata } from "next";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = { title: "Espace pro", robots: { index: false } };

export default function PageConnexion() {
  return (
    <div className="auth-shell">
      <aside className="auth-visual">
        <div className="content">
          <Link href="/" className="brand" style={{ color: "var(--paper)" }}>
            <span className="brand-mark">
              <img src="/images/logo-mark.png" alt="Logo JC Habitat Solutions" />
            </span>
            <span>JC Habitat Solutions</span>
          </Link>
          <h2 style={{ marginTop: "3rem", maxWidth: "15ch" }}>Back-office : demandes, planning et galerie.</h2>
        </div>
        <p className="quote">Accès réservé à l&apos;équipe. Les comptes sont créés sur invitation depuis le back-office.</p>
      </aside>
      <div className="auth-form-wrap">
        <div className="clerk-conteneur">
          <Link href="/" className="top-link">← Retour au site</Link>
          <SignIn path="/connexion" routing="path" forceRedirectUrl="/admin" />
        </div>
      </div>
    </div>
  );
}
