export async function compresserImage(fichier: File, tailleMax = 1800, qualite = 0.82): Promise<File> {
  if (!fichier.type.startsWith("image/")) return fichier;
  try {
    const bitmap = await createImageBitmap(fichier);
    const ratio = Math.min(1, tailleMax / Math.max(bitmap.width, bitmap.height));
    const largeur = Math.round(bitmap.width * ratio);
    const hauteur = Math.round(bitmap.height * ratio);
    const canvas = document.createElement("canvas");
    canvas.width = largeur;
    canvas.height = hauteur;
    const contexte = canvas.getContext("2d");
    if (!contexte) return fichier;
    contexte.drawImage(bitmap, 0, 0, largeur, hauteur);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", qualite));
    if (!blob) return fichier;
    if (blob.size >= fichier.size && fichier.type === "image/jpeg") return fichier;
    const nom = fichier.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], nom, { type: "image/jpeg" });
  } catch {
    return fichier;
  }
}
