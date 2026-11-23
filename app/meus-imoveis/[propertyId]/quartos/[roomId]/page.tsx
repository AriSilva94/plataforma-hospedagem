import { LuBanknote, LuBath, LuBedDouble, LuCalendarDays, LuCrown, LuImages, LuUsers } from "react-icons/lu";
import { AvailabilityEditor } from "@/components/owner/availability-editor";
import { MediaGallery } from "@/components/owner/media-gallery";
import { OwnerDataNotice } from "@/components/owner/owner-notice";
import { OwnerPage } from "@/components/owner/owner-page";
import { RoomCompletenessHints, RoomCompletenessSummary } from "@/components/owner/room-completeness";
import { RoomForm } from "@/components/owner/room-form";
import { RoomStoryEditor } from "@/components/owner/room-story-editor";
import { RoomStatusStrip } from "@/components/owner/room-status-strip";
import { SectionTabs } from "@/components/owner/section-tabs";
import { roomAvailabilitySchema } from "@/lib/availability";
import { roomCriterionSection } from "@/lib/completeness";
import { getApiData } from "@/lib/server-api";
import { bathroomTypeLabels, formatCents, roomDetailSchema } from "@/lib/properties";
import { isStoryExpired } from "@/lib/stories";

const sections = [
  { id: "dados", label: "Dados e preço", icon: LuBedDouble },
  { id: "fotos", label: "Fotos", icon: LuImages },
  { id: "story", label: "Story", icon: LuCrown },
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
  const summary = (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <span className="inline-flex items-center gap-1.5">
        <LuBanknote aria-hidden="true" size={15} className="text-(--primary-text)" />
        <strong className="font-bold text-(--text-primary) tabular-nums">{formatCents(room.priceCents)}</strong> / diária
      </span>
      <span className="inline-flex items-center gap-1.5">
        <LuUsers aria-hidden="true" size={15} className="text-(--lavender)" />
        {room.capacity === 1 ? "1 pessoa" : `${room.capacity} pessoas`}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <LuBath aria-hidden="true" size={15} className="text-(--lavender)" />
        Banheiro {bathroomTypeLabels[room.bathroomType].toLowerCase()}
      </span>
    </span>
  );
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
        <MediaGallery label={`Fotos de ${room.title}`} basePath={`/owner/rooms/${room.id}`} initialMedia={room.media} allowVideo maxImages={20} maxVideos={3} />
      ) : null}
      {section === "story" ? <RoomStoryEditor roomId={room.id} initialMedia={room.storyMedia} status={room.storyStatus} rejectedReason={room.storyRejectedReason} expiresAt={room.storyExpiresAt} expired={isStoryExpired(room.storyExpiresAt)} views={room.storyViews} /> : null}
      {availability?.status === "ok" ? <AvailabilityEditor roomId={room.id} initial={availability.data} /> : null}
      {availability && availability.status !== "ok" ? (
        <OwnerDataNotice status={availability.status} retryHref={`/meus-imoveis/${propertyId}/quartos/${roomId}?secao=${section}`} />
      ) : null}
    </OwnerPage>
  );
}
