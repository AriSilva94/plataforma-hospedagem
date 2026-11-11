import { LuBedDouble, LuCalendarDays, LuImages } from "react-icons/lu";
import { AvailabilityEditor } from "@/components/owner/availability-editor";
import { MediaGallery } from "@/components/owner/media-gallery";
import { OwnerDataNotice } from "@/components/owner/owner-notice";
import { OwnerPage } from "@/components/owner/owner-page";
import { RoomCompletenessHints, RoomCompletenessSummary } from "@/components/owner/room-completeness";
import { RoomForm } from "@/components/owner/room-form";
import { RoomStatusStrip } from "@/components/owner/room-status-strip";
import { SectionTabs } from "@/components/owner/section-tabs";
import { roomAvailabilitySchema } from "@/lib/availability";
import { roomCriterionSection } from "@/lib/completeness";
import { getApiData } from "@/lib/server-api";
import { bathroomTypeLabels, formatCents, roomDetailSchema } from "@/lib/properties";

const sections = [
  { id: "dados", label: "Dados e preço", icon: LuBedDouble },
  { id: "fotos", label: "Fotos", icon: LuImages },
  { id: "disponibilidade", label: "Disponibilidade", icon: LuCalendarDays },
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

  const availability = section === "disponibilidade" ? await getApiData(`/owner/rooms/${roomId}/availability`, roomAvailabilitySchema) : undefined;
  const room = result.data;
  const summary = [
    room.capacity === 1 ? "1 pessoa" : `${room.capacity} pessoas`,
    `${formatCents(room.priceCents)} / diária`,
    `Banheiro ${bathroomTypeLabels[room.bathroomType].toLowerCase()}`,
  ].join(" · ");
  const showCompleteness = room.status !== "INACTIVE";
  const pendingSections = new Set<string | undefined>(showCompleteness ? room.completenessMissing.map(roomCriterionSection) : []);

  return (
    <OwnerPage
      title={room.title}
      description={summary}
      back={{ href: `/meus-imoveis/${propertyId}`, label: room.property.title }}
      actions={showCompleteness ? <RoomCompletenessSummary score={room.completenessScore} missingCount={room.completenessMissing.length} /> : undefined}
      divider={false}
    >
      <RoomStatusStrip
        roomId={room.id}
        roomTitle={room.title}
        status={room.status}
        propertyStatus={room.property.status}
        availableRoomCount={room.property.availableRoomCount}
        verificationStatus={room.verificationStatus}
        verificationRejectedReason={room.verificationRejectedReason}
      />
      {showCompleteness ? <RoomCompletenessHints propertyId={propertyId} roomId={room.id} missing={room.completenessMissing} section={section} /> : null}
      <SectionTabs
        label="Seções do quarto"
        current={section}
        tabs={sections.map((item) => ({
          ...item,
          href: `/meus-imoveis/${propertyId}/quartos/${room.id}?secao=${item.id}`,
          pending: pendingSections.has(item.id),
        }))}
      />
      {section === "dados" ? <RoomForm propertyId={propertyId} room={room} /> : null}
      {section === "fotos" ? (
        <MediaGallery basePath={`/owner/rooms/${room.id}`} initialMedia={room.media} allowVideo={false} maxImages={20} />
      ) : null}
      {availability?.status === "ok" ? <AvailabilityEditor roomId={room.id} initial={availability.data} /> : null}
      {availability && availability.status !== "ok" ? (
        <OwnerDataNotice status={availability.status} retryHref={`/meus-imoveis/${propertyId}/quartos/${roomId}?secao=${section}`} />
      ) : null}
    </OwnerPage>
  );
}
