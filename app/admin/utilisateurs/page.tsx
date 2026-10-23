import { clerkClient } from "@clerk/nextjs/server";
import Icone from "@/components/Icone";
import Flash from "@/components/admin/Flash";
import BoutonEnvoi from "@/components/admin/BoutonEnvoi";
import BoutonConfirmation from "@/components/admin/BoutonConfirmation";
import { exigerAdmin, roleDepuisMetadonnees } from "@/lib/auth";
import { formatDateCourte, formatRelatif } from "@/lib/temps";
import { basculerBlocage, changerRole, inviterUtilisateur, revoquerInvitation, supprimerUtilisateur } from "./actions";

export const metadata = { title: "Utilisateurs" };

const LIBELLES_ROLES: Record<string, string> = { admin: "Administrateur", editeur: "Éditeur", aucun: "Aucun accès" };

export default async function PageUtilisateurs({ searchParams }: { searchParams: Promise<{ message?: string; type?: string }> }) {
  const moi = await exigerAdmin();
  const params = await searchParams;
  const client = await clerkClient();

  const [utilisateurs, invitations] = await Promise.all([
    client.users.getUserList({ limit: 100, orderBy: "-created_at" }),
    client.invitations.getInvitationList({ status: "pending" }),
  ]);

  const emailsForces = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

  return (
    <>
      <div className="app-topbar">
        <div>
          <h1>Utilisateurs</h1>
          <p className="sub">Comptes ayant accès au back-office. L&apos;inscription publique est désactivée : les accès se font sur invitation.</p>
        </div>
      </div>

      <Flash message={params.message} type={params.type} />

      <div className="grid grid-2 admin-deux-colonnes">
        <div className="panel">
          <div className="panel-head"><h2>Inviter une personne</h2></div>
          <form action={inviterUtilisateur} className="panel-corps">
            <div className="field">
              <label htmlFor="email">Adresse e-mail</label>
              <input id="email" name="email" type="email" required placeholder="prenom@exemple.fr" />
            </div>
            <div className="field">
              <label htmlFor="role">Rôle</label>
              <select id="role" name="role" defaultValue="editeur">
                <option value="editeur">Éditeur — demandes, planning, galerie, avis</option>
                <option value="admin">Administrateur — tout, y compris utilisateurs et paramètres</option>
              </select>
            </div>
            <BoutonEnvoi texteEnvoi="Envoi…"><Icone nom="send" taille={15} /> Envoyer l&apos;invitation</BoutonEnvoi>
            <p className="hint" style={{ marginTop: ".8rem" }}>La personne reçoit un e-mail de Clerk pour créer son mot de passe ; son rôle est appliqué automatiquement.</p>
          </form>
        </div>

        <div className="panel">
          <div className="panel-head"><h2>Invitations en attente</h2></div>
          {invitations.data.length === 0 ? (
            <p className="panel-vide">Aucune invitation en attente.</p>
          ) : (
            <ul className="liste-simple panel-corps">
              {invitations.data.map((inv) => (
                <li key={inv.id}>
                  <span>
                    <strong>{inv.emailAddress}</strong>
                    <span className="cell-sub"> · {LIBELLES_ROLES[String(inv.publicMetadata?.role ?? "editeur")]} · envoyée {formatRelatif(new Date(inv.createdAt).toISOString())}</span>
                  </span>
                  <form action={revoquerInvitation}>
                    <input type="hidden" name="id" value={inv.id} />
                    <BoutonConfirmation confirmation="Révoquer cette invitation ?" className="btn btn-ghost btn-sm">Révoquer</BoutonConfirmation>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h2>Comptes ({utilisateurs.totalCount})</h2></div>
        <div className="table-defilante">
          <table>
            <thead>
              <tr><th>Utilisateur</th><th>Rôle</th><th>Dernière connexion</th><th>Créé le</th><th></th></tr>
            </thead>
            <tbody>
              {utilisateurs.data.map((u) => {
                const email = u.primaryEmailAddress?.emailAddress ?? u.emailAddresses[0]?.emailAddress ?? "";
                const role = roleDepuisMetadonnees(email, u.publicMetadata as Record<string, unknown>) ?? "aucun";
                const force = emailsForces.includes(email.toLowerCase());
                const estMoi = u.id === moi.id;
                const nom = [u.firstName, u.lastName].filter(Boolean).join(" ") || email;
                return (
                  <tr key={u.id} className={u.banned ? "ligne-bloquee" : ""}>
                    <td>
                      <div className="utilisateur-cellule">
                        <img src={u.imageUrl} alt="" width={32} height={32} />
                        <div>
                          <span className="cell-primary">{nom}{estMoi && " (vous)"}</span>
                          <div className="cell-sub">{email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {estMoi || force ? (
                        <span className="pill pill-progress">{LIBELLES_ROLES[role]}{force ? " · ADMIN_EMAILS" : ""}</span>
                      ) : (
                        <form action={changerRole} className="ligne-formulaire">
                          <input type="hidden" name="id" value={u.id} />
                          <select name="role" defaultValue={role} aria-label="Rôle">
                            <option value="admin">Administrateur</option>
                            <option value="editeur">Éditeur</option>
                            <option value="aucun">Aucun accès</option>
                          </select>
                          <BoutonEnvoi className="btn btn-outline btn-sm" texteEnvoi="…">OK</BoutonEnvoi>
                        </form>
                      )}
                      {u.banned && <span className="pill pill-refused" style={{ marginLeft: ".4rem" }}>Bloqué</span>}
                    </td>
                    <td>{u.lastSignInAt ? formatRelatif(new Date(u.lastSignInAt).toISOString()) : <span className="text-muted">Jamais</span>}</td>
                    <td>{formatDateCourte(new Date(u.createdAt))}</td>
                    <td className="row-actions">
                      {!estMoi && (
                        <>
                          <form action={basculerBlocage}>
                            <input type="hidden" name="id" value={u.id} />
                            <input type="hidden" name="bloque" value={String(u.banned)} />
                            <BoutonConfirmation
                              confirmation={u.banned ? "Débloquer ce compte ?" : "Bloquer ce compte ? Il ne pourra plus se connecter."}
                              className="icon-btn"
                              titre={u.banned ? "Débloquer" : "Bloquer"}
                            >
                              <Icone nom="lock" taille={14} />
                            </BoutonConfirmation>
                          </form>
                          <form action={supprimerUtilisateur}>
                            <input type="hidden" name="id" value={u.id} />
                            <BoutonConfirmation confirmation={`Supprimer définitivement le compte de ${email} ?`} className="icon-btn" titre="Supprimer">
                              <Icone nom="trash" taille={14} />
                            </BoutonConfirmation>
                          </form>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
