import { z } from "@/lib/zod";
import { OwnerDataNotice } from "@/components/owner/owner-notice";
import { OwnerPage } from "@/components/owner/owner-page";
import { RoomForm } from "@/components/owner/room-form";
import { getApiData } from "@/lib/server-api";

export default async function NewRoomPage({ params }: PageProps<"/meus-imoveis/[propertyId]/quartos/novo">) {
  const { propertyId } = await params;
  const result = await getApiData(`/owner/properties/${propertyId}`, z.object({ id: z.string(), title: z.string() }));

  if (result.status !== "ok") {
    return <OwnerDataNotice status={result.status} retryHref={`/meus-imoveis/${propertyId}/quartos/novo`} />;
  }

  return (
    <OwnerPage
      title="Novo quarto"
      description={`Quarto dentro de ${result.data.title}. Depois de criar, você poderá adicionar as fotos.`}
      back={{ href: `/meus-imoveis/${propertyId}`, label: result.data.title }}
    >
      <RoomForm propertyId={propertyId} />
    </OwnerPage>
  );
}
