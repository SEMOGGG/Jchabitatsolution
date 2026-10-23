import Icone from "@/components/Icone";
import Flash from "@/components/admin/Flash";
import BoutonEnvoi from "@/components/admin/BoutonEnvoi";
import BoutonConfirmation from "@/components/admin/BoutonConfirmation";
import { exigerAcces } from "@/lib/auth";
import { supabaseAdmin, supabaseConfigure } from "@/lib/supabase";
import type { Avis } from "@/lib/types";
import { ajouterAvis, basculerAvis, modifierAvis, supprimerAvis } from "./actions";

export const metadata = { title: "Avis clients" };

function ChampsAvis({ avis }: { avis?: Avis }) {
  return (
    <>
      <div className="field-row">
        <div className="field"><label>Nom du client</label><input name="nom_client" defaultValue={avis?.nom_client} required /></div>
        <div className="field"><label>Fonction / contexte <span className="optionnel">facultatif</span></label><input name="fonction" defaultValue={avis?.fonction ?? ""} placeholder="ex : Gérante, cabinet dentaire" /></div>
      </div>
      <div className="field"><label>Avis</label><textarea name="texte" rows={3} defaultValue={avis?.texte} required /></div>
      <div className="field champ-note">
        <label>Note</label>
        <select name="note" defaultValue={String(avis?.note ?? 5)}>
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} ({n}/5)</option>)}
        </select>
      </div>
    </>
  );
}

export default async function AdminAvis({ searchParams }: { searchParams: Promise<{ message?: string; type?: string }> }) {
  await exigerAcces();
  const params = await searchParams;
  let avis: Avis[] = [];
  if (supabaseConfigure()) {
    const { data } = await supabaseAdmin().from("avis").select("*").order("ordre");
    avis = (data ?? []) as Avis[];
  }

  return (
    <>
      <div className="app-topbar">
        <div>
          <h1>Avis clients</h1>
          <p className="sub">{avis.filter((a) => a.visible).length} avis affiché(s) sur la page d&apos;accueil.</p>
        </div>
      </div>

      <Flash message={params.message} type={params.type} />

      <div className="grid grid-2 admin-deux-colonnes">
        <div className="panel">
          <div className="panel-head"><h2>Ajouter un avis</h2></div>
          <form action={ajouterAvis} className="panel-corps">
            <ChampsAvis />
            <BoutonEnvoi className="btn btn-primary"><Icone nom="plus" taille={15} /> Ajouter</BoutonEnvoi>
          </form>
        </div>

        <div className="panel">
          <div className="panel-head"><h2>Avis existants</h2></div>
          {avis.length === 0 ? (
            <p className="panel-vide">Aucun avis pour le moment.</p>
          ) : (
            <ul className="liste-avis">
              {avis.map((a) => (
                <li key={a.id} className={a.visible ? "" : "masque"}>
                  <div className="avis-entete">
                    <div>
                      <strong>{a.nom_client}</strong>
                      <span className="cell-sub">{a.fonction} · {"★".repeat(a.note)}</span>
                    </div>
                    <div className="row-actions">
                      <form action={basculerAvis}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="visible" value={String(a.visible)} />
                        <button type="submit" className="icon-btn" title={a.visible ? "Masquer" : "Afficher"}><Icone nom={a.visible ? "eye" : "lock"} taille={14} /></button>
                      </form>
                      <form action={supprimerAvis}>
                        <input type="hidden" name="id" value={a.id} />
                        <BoutonConfirmation confirmation="Supprimer cet avis ?" className="icon-btn" titre="Supprimer"><Icone nom="trash" taille={14} /></BoutonConfirmation>
                      </form>
                    </div>
                  </div>
                  <p>« {a.texte} »</p>
                  <details>
                    <summary>Modifier</summary>
                    <form action={modifierAvis} className="pile">
                      <input type="hidden" name="id" value={a.id} />
                      <ChampsAvis avis={a} />
                      <label className="check-row"><input type="checkbox" name="visible" defaultChecked={a.visible} /> <span>Visible</span></label>
                      <BoutonEnvoi className="btn btn-dark btn-sm">Enregistrer</BoutonEnvoi>
                    </form>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
