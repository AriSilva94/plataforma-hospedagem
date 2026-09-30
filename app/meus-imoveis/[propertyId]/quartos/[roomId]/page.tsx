import { MediaGallery } from "@/components/owner/media-gallery";
import { OwnerDataNotice } from "@/components/owner/owner-notice";
import { OwnerPage } from "@/components/owner/owner-page";
import { RoomStatusBadge } from "@/components/owner/property-status-badge";
import { RoomForm } from "@/components/owner/room-form";
import { SectionTabs } from "@/components/owner/section-tabs";
import { getApiData } from "@/lib/server-api";
import { roomDetailSchema } from "@/lib/properties";

const sections = [
  { id: "dados", label: "Dados, características e preço" },
  { id: "fotos", label: "Fotos" },
] as const;

export default async function EditRoomPage({ params, searchParams }: PageProps<"/meus-imoveis/[propertyId]/quartos/[roomId]">) {
  const [{ propertyId, roomId }, { secao }] = await Promise.all([params, searchParams]);
  const section = sections.find((item) => item.id === secao)?.id ?? "dados";
  const result = await getApiData(`/owner/rooms/${roomId}`, roomDetailSchema);

  if (result.status === "ok" && result.data.property.id !== propertyId) {
    return <OwnerDataNotice status="not-found" retryHref="/meus-imoveis" />;
  }
  if (result.status !== "ok") {
    return <OwnerDataNotice status={result.status} retryHref={`/meus-imoveis/${propertyId}/quartos/${roomId}?secao=${section}`} />;
  }

  const room = result.data;

  return (
    <OwnerPage
      title={room.title}
      eyebrow={<RoomStatusBadge status={room.status} />}
      description={`Quarto em ${room.property.title}`}
      back={{ href: `/meus-imoveis/${propertyId}`, label: room.property.title }}
    >
      <SectionTabs
        label="Seções do quarto"
        current={section}
        tabs={sections.map((item) => ({ ...item, href: `/meus-imoveis/${propertyId}/quartos/${room.id}?secao=${item.id}` }))}
      />
      {section === "dados" ? <RoomForm propertyId={propertyId} room={room} /> : null}
      {section === "fotos" ? (
        <MediaGallery basePath={`/owner/rooms/${room.id}`} initialMedia={room.media} allowVideo={false} maxImages={20} />
      ) : null}
    </OwnerPage>
  );
}
