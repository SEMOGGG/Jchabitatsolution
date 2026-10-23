import Icone from "@/components/Icone";
import Flash from "@/components/admin/Flash";
import BoutonEnvoi from "@/components/admin/BoutonEnvoi";
import { exigerAdmin } from "@/lib/auth";
import { lireParametres } from "@/lib/donnees";
import { supabaseConfigure } from "@/lib/supabase";
import { resendConfigure } from "@/lib/email";
import { enregistrerParametres, envoyerEmailTest } from "./actions";

export const metadata = { title: "Paramètres" };

function Etat({ ok, libelle, detail }: { ok: boolean; libelle: string; detail: string }) {
  return (
    <li className="etat-service">
      <span className={`pastille ${ok ? "ok" : "ko"}`} />
      <div>
        <strong>{libelle}</strong>
        <span className="cell-sub">{detail}</span>
      </div>
    </li>
  );
}

export default async function PageParametres({ searchParams }: { searchParams: Promise<{ message?: string; type?: string }> }) {
  const utilisateur = await exigerAdmin();
  const params = await searchParams;
  const p = await lireParametres();

  const services = [
    { ok: supabaseConfigure(), libelle: "Supabase", detail: supabaseConfigure() ? "Base de données et stockage connectés" : "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquantes" },
    { ok: resendConfigure(), libelle: "Resend", detail: resendConfigure() ? `Expéditeur : ${process.env.EMAIL_FROM ?? "onboarding@resend.dev"}` : "RESEND_API_KEY manquante" },
    { ok: Boolean(process.env.CLERK_SECRET_KEY), libelle: "Clerk", detail: "Authentification du back-office" },
    { ok: Boolean(process.env.NEXT_PUBLIC_SITE_URL), libelle: "URL du site", detail: process.env.NEXT_PUBLIC_SITE_URL ?? "NEXT_PUBLIC_SITE_URL manquante (liens des e-mails)" },
  ];

  return (
    <>
      <div className="app-topbar">
        <div>
          <h1>Paramètres</h1>
          <p className="sub">Coordonnées affichées sur le site et dans les e-mails.</p>
        </div>
      </div>

      <Flash message={params.message} type={params.type} />

      <div className="grid grid-2 admin-deux-colonnes">
        <div className="panel">
          <div className="panel-head"><h2>Entreprise</h2></div>
          <form action={enregistrerParametres} className="panel-corps">
            <div className="field-row">
              <div className="field"><label htmlFor="entreprise_nom">Nom de l&apos;entreprise</label><input id="entreprise_nom" name="entreprise_nom" defaultValue={p.entreprise_nom} required /></div>
              <div className="field"><label htmlFor="dirigeant">Dirigeant</label><input id="dirigeant" name="dirigeant" defaultValue={p.dirigeant} required /></div>
            </div>
            <div className="field-row">
              <div className="field"><label htmlFor="telephone">Téléphone</label><input id="telephone" name="telephone" defaultValue={p.telephone} required /></div>
              <div className="field"><label htmlFor="email_contact">E-mail de contact (public)</label><input id="email_contact" type="email" name="email_contact" defaultValue={p.email_contact} required /></div>
            </div>
            <div className="field">
              <label htmlFor="email_notifications">E-mail qui reçoit les nouvelles demandes</label>
              <input id="email_notifications" type="email" name="email_notifications" defaultValue={p.email_notifications} required />
              {process.env.ADMIN_NOTIFICATION_EMAIL && (
                <span className="hint">La variable ADMIN_NOTIFICATION_EMAIL ({process.env.ADMIN_NOTIFICATION_EMAIL}) est définie et prend le dessus sur ce champ.</span>
              )}
            </div>
            <div className="field"><label htmlFor="zone_intervention">Zone d&apos;intervention</label><input id="zone_intervention" name="zone_intervention" defaultValue={p.zone_intervention} required /></div>
            <div className="field"><label htmlFor="horaires">Horaires affichés</label><input id="horaires" name="horaires" defaultValue={p.horaires} required /></div>
            <BoutonEnvoi>Enregistrer</BoutonEnvoi>
          </form>
        </div>

        <div className="pile">
          <div className="panel">
            <div className="panel-head"><h2>Services connectés</h2></div>
            <ul className="panel-corps liste-etats">
              {services.map((s) => <Etat key={s.libelle} {...s} />)}
            </ul>
          </div>
          <div className="panel">
            <div className="panel-head"><h2>Tester l&apos;envoi d&apos;e-mails</h2></div>
            <form action={envoyerEmailTest} className="panel-corps">
              <div className="field">
                <label htmlFor="destinataire">Destinataire</label>
                <input id="destinataire" type="email" name="destinataire" defaultValue={utilisateur.email} />
                <span className="hint">Sans domaine vérifié dans Resend, l&apos;envoi ne fonctionne que vers l&apos;adresse du compte Resend.</span>
              </div>
              <BoutonEnvoi className="btn btn-outline" texteEnvoi="Envoi…"><Icone nom="send" taille={15} /> Envoyer un e-mail de test</BoutonEnvoi>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
