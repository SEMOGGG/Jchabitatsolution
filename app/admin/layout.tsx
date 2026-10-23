import type { Metadata } from "next";
import BarreLaterale from "@/components/admin/BarreLaterale";
import { exigerAcces } from "@/lib/auth";
import { supabaseAdmin, supabaseConfigure } from "@/lib/supabase";
import Icone from "@/components/Icone";

export const metadata: Metadata = {
  title: { default: "Back-office", template: "%s — Back-office JC Habitat" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const utilisateur = await exigerAcces();
  const configure = supabaseConfigure();
  let nouvelles = 0;
  if (configure) {
    const { count } = await supabaseAdmin().from("demandes").select("id", { count: "exact", head: true }).eq("statut", "nouvelle");
    nouvelles = count ?? 0;
  }

  return (
    <div className="app-shell">
      <BarreLaterale nom={utilisateur.nom} email={utilisateur.email} role={utilisateur.role} nouvellesDemandes={nouvelles} />
      <main className="app-main">
        {!configure && (
          <div className="alert alert-error">
            <Icone nom="alert" />
            <span>Supabase n&apos;est pas encore configuré : ajoutez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans les variables d&apos;environnement, puis exécutez supabase/schema.sql.</span>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
