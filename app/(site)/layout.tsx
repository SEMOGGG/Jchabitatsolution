import EnTete from "@/components/site/EnTete";
import PiedDePage from "@/components/site/PiedDePage";
import Apparition from "@/components/site/Apparition";
import { lireParametres } from "@/lib/donnees";

export const revalidate = 300;

export default async function LayoutSite({ children }: { children: React.ReactNode }) {
  const parametres = await lireParametres();
  return (
    <>
      <EnTete />
      <main>{children}</main>
      <PiedDePage parametres={parametres} />
      <Apparition />
    </>
  );
}
