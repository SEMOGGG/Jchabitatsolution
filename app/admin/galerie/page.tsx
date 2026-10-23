import Icone from "@/components/Icone";
import Flash from "@/components/admin/Flash";
import BoutonEnvoi from "@/components/admin/BoutonEnvoi";
import BoutonConfirmation from "@/components/admin/BoutonConfirmation";
import TeleversementGalerie from "@/components/admin/TeleversementGalerie";
import { exigerAcces } from "@/lib/auth";
import { supabaseAdmin, supabaseConfigure } from "@/lib/supabase";
import { CATEGORIES_GALERIE } from "@/lib/constantes";
import type { ElementGalerie } from "@/lib/types";
import { basculerChamp, deplacerElement, modifierElement, supprimerElement } from "./actions";

export const metadata = { title: "Galerie" };

export default async function AdminGalerie({ searchParams }: { searchParams: Promise<{ categorie?: string; message?: string; type?: string }> }) {
  await exigerAcces();
  const params = await searchParams;
  let elements: ElementGalerie[] = [];
  if (supabaseConfigure()) {
    const { data } = await supabaseAdmin().from("galerie").select("*").order("ordre").order("created_at", { ascending: false });
    elements = (data ?? []) as ElementGalerie[];
  }
  const filtre = params.categorie && CATEGORIES_GALERIE.includes(params.categorie as (typeof CATEGORIES_GALERIE)[number]) ? params.categorie : null;
  const affiches = filtre ? elements.filter((e) => e.categorie === filtre) : elements;
  const enAvant = elements.filter((e) => e.en_avant && e.visible).length;

  return (
    <>
      <div className="app-topbar">
        <div>
          <h1>Galerie</h1>
          <p className="sub">
            {elements.length} élément(s) · {elements.filter((e) => e.type === "avant_apres").length} avant / après · {enAvant} en avant sur l&apos;accueil
          </p>
        </div>
        <a href="/galerie" target="_blank" className="btn btn-outline btn-sm">Voir la galerie <Icone nom="external" taille={15} /></a>
      </div>

      <Flash message={params.message} type={params.type} />

      <div className="panel" style={{ marginBottom: "1.5rem" }}>
        <div className="panel-head"><h2>Ajouter des photos</h2></div>
        <TeleversementGalerie />
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Photos publiées</h2>
          <div className="onglets-liens">
            <a href="/admin/galerie" className={`chip${!filtre ? " active" : ""}`}>Toutes</a>
            {CATEGORIES_GALERIE.map((c) => {
              const n = elements.filter((e) => e.categorie === c).length;
              if (!n) return null;
              return (
                <a key={c} href={`/admin/galerie?categorie=${encodeURIComponent(c)}`} className={`chip${filtre === c ? " active" : ""}`}>
                  {c} <span className="chip-nombre">{n}</span>
                </a>
              );
            })}
          </div>
        </div>

        {affiches.length === 0 ? (
          <p className="panel-vide">Aucune photo pour le moment — utilisez le formulaire ci-dessus.</p>
        ) : (
          <div className="admin-galerie">
            {affiches.map((e, index) => (
              <div key={e.id} className={`admin-galerie-carte${e.visible ? "" : " masque"}`}>
                <div className="admin-galerie-image">
                  {e.type === "avant_apres" ? (
                    <div className="duo">
                      <img src={e.image_avant_url ?? ""} alt="Avant" />
                      <img src={e.image_apres_url ?? ""} alt="Après" />
                    </div>
                  ) : (
                    <img src={e.image_url ?? ""} alt={e.titre} />
                  )}
                  <div className="badges">
                    {e.type === "avant_apres" && <span className="badge">Avant / après</span>}
                    {e.en_avant && <span className="badge badge-accent">Accueil</span>}
                    {!e.visible && <span className="badge badge-sombre">Masqué</span>}
                  </div>
                </div>
                <div className="admin-galerie-infos">
                  <strong>{e.titre}</strong>
                  <span className="cell-sub">{e.categorie}{e.lieu ? ` · ${e.lieu}` : ""}</span>
                </div>
                <div className="admin-galerie-actions">
                  {!filtre && (
                    <>
                      <form action={deplacerElement}>
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="sens" value="haut" />
                        <button type="submit" className="icon-btn" title="Monter" disabled={index === 0}><Icone nom="arrow-up" taille={14} /></button>
                      </form>
                      <form action={deplacerElement}>
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="sens" value="bas" />
                        <button type="submit" className="icon-btn" title="Descendre" disabled={index === affiches.length - 1}><Icone nom="arrow-down" taille={14} /></button>
                      </form>
                    </>
                  )}
                  <form action={basculerChamp}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="champ" value="en_avant" />
                    <input type="hidden" name="valeur" value={String(e.en_avant)} />
                    <button type="submit" className={`icon-btn${e.en_avant ? " actif" : ""}`} title={e.en_avant ? "Retirer de l'accueil" : "Mettre en avant sur l'accueil"}>
                      <Icone nom="star" taille={14} />
                    </button>
                  </form>
                  <form action={basculerChamp}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="champ" value="visible" />
                    <input type="hidden" name="valeur" value={String(e.visible)} />
                    <button type="submit" className="icon-btn" title={e.visible ? "Masquer" : "Afficher"}>
                      <Icone nom={e.visible ? "eye" : "lock"} taille={14} />
                    </button>
                  </form>
                  <form action={supprimerElement}>
                    <input type="hidden" name="id" value={e.id} />
                    <BoutonConfirmation confirmation="Supprimer définitivement cette photo ?" className="icon-btn" titre="Supprimer">
                      <Icone nom="trash" taille={14} />
                    </BoutonConfirmation>
                  </form>
                </div>
                <details className="admin-galerie-edition">
                  <summary>Modifier</summary>
                  <form action={modifierElement} className="pile">
                    <input type="hidden" name="id" value={e.id} />
                    <div className="field"><label>Titre</label><input name="titre" defaultValue={e.titre} required /></div>
                    <div className="field">
                      <label>Catégorie</label>
                      <select name="categorie" defaultValue={e.categorie}>
                        {CATEGORIES_GALERIE.map((c) => <option key={c} value={c}>{c}</option>)}
                        {!CATEGORIES_GALERIE.includes(e.categorie as (typeof CATEGORIES_GALERIE)[number]) && <option value={e.categorie}>{e.categorie}</option>}
                      </select>
                    </div>
                    <div className="field"><label>Lieu</label><input name="lieu" defaultValue={e.lieu ?? ""} /></div>
                    <div className="field"><label>Description</label><textarea name="description" rows={2} defaultValue={e.description ?? ""} /></div>
                    <label className="check-row"><input type="checkbox" name="visible" defaultChecked={e.visible} /> <span>Visible sur le site</span></label>
                    <label className="check-row"><input type="checkbox" name="en_avant" defaultChecked={e.en_avant} /> <span>En avant sur l&apos;accueil</span></label>
                    <BoutonEnvoi className="btn btn-dark btn-sm">Enregistrer</BoutonEnvoi>
                  </form>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
