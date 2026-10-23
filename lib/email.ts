import "server-only";
import { Resend } from "resend";
import { lireParametres } from "./donnees";
import { formatCreneau } from "./temps";
import type { Demande } from "./types";

type PieceJointe = { filename: string; content: Buffer };

function echapper(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function urlSite(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function resendConfigure(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function gabarit(titre: string, corps: string, bouton?: { texte: string; url: string }): string {
  const blocBouton = bouton
    ? `<p style="margin:28px 0;"><a href="${echapper(bouton.url)}" style="background:#1FA9D4;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600;display:inline-block;">${echapper(bouton.texte)}</a></p>`
    : "";
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#F4FAFD;padding:32px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #DCE7ED;">
    <img src="${urlSite()}/images/logo-mark.png" alt="JC Habitat Solutions" width="48" height="44" style="display:block;margin-bottom:20px;" />
    <h1 style="font-size:20px;color:#0A2A40;margin:0 0 16px;">${echapper(titre)}</h1>
    <div style="font-size:15px;line-height:1.6;color:#4C6B7A;">${corps}</div>
    ${blocBouton}
    <p style="font-size:12px;color:#7C97A4;margin-top:32px;">JC Habitat Solutions — Nettoyage professionnel — Île-de-France</p>
  </div>
</div>`;
}

function ligne(libelle: string, valeur: string): string {
  return `<tr><td style="padding:6px 12px 6px 0;color:#7C97A4;vertical-align:top;white-space:nowrap;">${echapper(libelle)}</td><td style="padding:6px 0;color:#0A2A40;">${valeur}</td></tr>`;
}

async function envoyer(options: {
  a: string;
  sujet: string;
  html: string;
  repondreA?: string;
  piecesJointes?: PieceJointe[];
}): Promise<boolean> {
  if (!resendConfigure()) {
    console.warn("RESEND_API_KEY manquante : e-mail non envoyé →", options.sujet);
    return false;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "JC Habitat Solutions <onboarding@resend.dev>",
    to: options.a,
    subject: options.sujet,
    html: options.html,
    replyTo: options.repondreA,
    attachments: options.piecesJointes,
  });
  if (error) {
    console.error("Erreur Resend :", error);
    return false;
  }
  return true;
}

export async function emailNouvelleDemandeAdmin(demande: Demande, photo?: PieceJointe): Promise<boolean> {
  const parametres = await lireParametres();
  const destinataire = process.env.ADMIN_NOTIFICATION_EMAIL || parametres.email_notifications;
  const corps = `<p>Nouvelle demande reçue depuis le site.</p>
<table style="border-collapse:collapse;font-size:14px;margin:16px 0;">
  ${ligne("Client", echapper(`${demande.prenom} ${demande.nom}`))}
  ${ligne("E-mail", `<a href="mailto:${echapper(demande.email)}">${echapper(demande.email)}</a>`)}
  ${ligne("Projet", echapper(demande.nature_projet))}
  ${ligne("Créneau", echapper(formatCreneau(demande.creneau_debut, demande.creneau_fin)))}
  ${demande.description ? ligne("Précisions", echapper(demande.description).replace(/\n/g, "<br>")) : ""}
  ${ligne("Photo", photo ? "Jointe à cet e-mail" : "Aucune")}
</table>
<p>Répondez directement à cet e-mail pour écrire au client.</p>`;
  return envoyer({
    a: destinataire,
    sujet: `Nouvelle demande — ${demande.nature_projet} — ${demande.prenom} ${demande.nom}`,
    html: gabarit("Nouvelle demande de devis", corps, {
      texte: "Ouvrir dans le back-office",
      url: `${urlSite()}/admin/demandes/${demande.id}`,
    }),
    repondreA: demande.email,
    piecesJointes: photo ? [photo] : undefined,
  });
}

export async function emailAccuseReceptionClient(demande: Demande): Promise<boolean> {
  const parametres = await lireParametres();
  const corps = `<p>Bonjour ${echapper(demande.prenom)},</p>
<p>Votre demande a bien été reçue. Voici le récapitulatif :</p>
<table style="border-collapse:collapse;font-size:14px;margin:16px 0;">
  ${ligne("Projet", echapper(demande.nature_projet))}
  ${ligne("Créneau souhaité", echapper(formatCreneau(demande.creneau_debut, demande.creneau_fin)))}
</table>
<p>${echapper(parametres.dirigeant)} revient vers vous par e-mail pour confirmer le rendez-vous et préparer votre devis.</p>
<p>Pour toute question : ${echapper(parametres.telephone)} ou en répondant à cet e-mail.</p>`;
  return envoyer({
    a: demande.email,
    sujet: "Votre demande a bien été reçue — JC Habitat Solutions",
    html: gabarit("Demande bien reçue", corps),
    repondreA: parametres.email_contact,
  });
}

export async function emailRdvConfirme(demande: Demande): Promise<boolean> {
  const parametres = await lireParametres();
  const corps = `<p>Bonjour ${echapper(demande.prenom)},</p>
<p>Votre rendez-vous est confirmé :</p>
<p style="font-size:16px;color:#0A2A40;font-weight:600;">${echapper(formatCreneau(demande.creneau_debut, demande.creneau_fin))}</p>
<p>Si vous avez un empêchement, répondez simplement à cet e-mail ou appelez le ${echapper(parametres.telephone)}.</p>`;
  return envoyer({
    a: demande.email,
    sujet: "Votre rendez-vous est confirmé — JC Habitat Solutions",
    html: gabarit("Rendez-vous confirmé", corps),
    repondreA: parametres.email_contact,
  });
}

export async function emailRdvAnnule(demande: Demande, motif?: string): Promise<boolean> {
  const parametres = await lireParametres();
  const corps = `<p>Bonjour ${echapper(demande.prenom)},</p>
<p>Le rendez-vous prévu le ${echapper(formatCreneau(demande.creneau_debut, demande.creneau_fin))} a dû être annulé.</p>
${motif ? `<p>${echapper(motif).replace(/\n/g, "<br>")}</p>` : ""}
<p>Vous pouvez choisir un nouveau créneau à tout moment sur le site, ou répondre à cet e-mail.</p>`;
  return envoyer({
    a: demande.email,
    sujet: "Rendez-vous annulé — JC Habitat Solutions",
    html: gabarit("Rendez-vous annulé", corps, { texte: "Choisir un nouveau créneau", url: `${urlSite()}/devis` }),
    repondreA: parametres.email_contact,
  });
}

export async function emailLibre(demande: Demande, sujet: string, message: string): Promise<boolean> {
  const parametres = await lireParametres();
  const corps = `<p>${echapper(message).replace(/\n/g, "<br>")}</p>
<p style="margin-top:24px;">${echapper(parametres.dirigeant)}<br>${echapper(parametres.entreprise_nom)} — ${echapper(parametres.telephone)}</p>`;
  return envoyer({
    a: demande.email,
    sujet,
    html: gabarit(sujet, corps),
    repondreA: parametres.email_contact,
  });
}
