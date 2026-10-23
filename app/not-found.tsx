import Link from "next/link";

export default function PageIntrouvable() {
  return (
    <div className="page-centree">
      <div className="merci">
        <img src="/images/logo-mark.png" alt="" width={56} height={52} style={{ margin: "0 auto 1.2rem" }} />
        <h1 className="h2">Page introuvable</h1>
        <p className="lede">Cette page n&apos;existe pas ou a été déplacée.</p>
        <div className="flex gap-md" style={{ justifyContent: "center", marginTop: "1.6rem", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary">Retour à l&apos;accueil</Link>
          <Link href="/devis" className="btn btn-outline">Demander un devis</Link>
        </div>
      </div>
    </div>
  );
}
