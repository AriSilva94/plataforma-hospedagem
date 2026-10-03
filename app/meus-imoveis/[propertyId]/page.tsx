import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { LuArrowRight, LuChevronDown, LuCircleAlert, LuCircleCheck, LuEye, LuExternalLink, LuImage, LuPencil, LuPlus } from "react-icons/lu";
import { OwnerDataNotice } from "@/components/owner/owner-notice";
import { OwnerPage } from "@/components/owner/owner-page";
import { PropertyStatusBadge } from "@/components/owner/property-status-badge";
import { StatusBadge } from "@/components/owner/status-badge";
import { PropertyStatusActions } from "@/components/owner/property-status-actions";
import { RoomAvailabilityToggle } from "@/components/owner/room-availability-toggle";
import { RoomPriceEditor } from "@/components/owner/room-price-editor";
import { cardClassName, primaryButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { getApiData } from "@/lib/server-api";
import { completenessHint, isRoomCriterion } from "@/lib/completeness";
import { firstPendingStep, requirementLabels, setupStepHref } from "@/lib/setup-steps";
import {
  bathroomTypeLabels,
  formatCents,
  formatLocation,
  genderIdentityLabels,
  propertyDetailSchema,
  publishRequirements,
  propertyTypeLabels,
  sharedAreaTypeLabels,
  type PropertyDetail,
  type PropertyStatus,
} from "@/lib/properties";

type Room = PropertyDetail["rooms"][number];

function PropertySection({ title, editHref, children }: { title: string; editHref: string; children: ReactNode }) {
  return (
    <section className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <div className="mt-0.5 text-sm text-(--gray)">{children}</div>
      </div>
      <Link
        href={editHref}
        aria-label={`Editar ${title}`}
        className="-mr-2 inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-(--blue-light) transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-(--blue-light)"
      >
        <LuPencil aria-hidden="true" size={14} />
        Editar
      </Link>
    </section>
  );
}

function privateAddress(property: PropertyDetail): string | undefined {
  const line = [
    [property.street, property.number].filter(Boolean).join(", "),
    property.complement,
    property.postalCode ? `CEP ${property.postalCode.replace(/^(\d{5})(\d{3})$/, "$1-$2")}` : null,
  ].filter(Boolean);
  return line.length > 0 ? line.join(" · ") : undefined;
}

function visibilityWarning(property: PropertyDetail, availableCount: number): string | undefined {
  if (property.status === "UNAVAILABLE") return "Imóvel pausado: não aparece na busca até você reativá-lo.";
  if (property.status === "ACTIVE" && availableCount === 0) return "Publicado, mas fora da busca: deixe ao menos um quarto reservável.";
  return undefined;
}

function priceRange(rooms: Room[]): string | undefined {
  if (rooms.length === 0) return undefined;
  const prices = rooms.map((room) => room.priceCents);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `${formatCents(min)} / diária` : `${formatCents(min)} a ${formatCents(max)} / diária`;
}

function propertySummary(property: PropertyDetail, rooms: Room[], availableCount: number): string {
  const roomCount = rooms.length > 0 ? `${availableCount} de ${rooms.length} ${rooms.length === 1 ? "quarto reservável" : "quartos reserváveis"}` : undefined;
  return [propertyTypeLabels[property.type], roomCount, priceRange(rooms)].filter(Boolean).join(" · ");
}

function RoomRow({
  propertyId,
  propertyStatus,
  room,
  warnBeforePause,
  focusAfterChangeId,
}: {
  propertyId: string;
  propertyStatus: PropertyStatus;
  room: Room;
  warnBeforePause: boolean;
  focusAfterChangeId?: string;
}) {
  const complete = room.completenessScore >= 100;
  const missingInRoom = room.completenessMissing.find(isRoomCriterion);
  const nextStep = missingInRoom ? completenessHint(missingInRoom, propertyId, room.id).label : "pendências no imóvel";
  const roomHref = `/meus-imoveis/${propertyId}/quartos/${room.id}`;
  return (
    <li className="flex flex-col gap-3 p-4 @2xl:flex-row @2xl:items-center @2xl:gap-6 @2xl:px-5">
      <Link
        href={roomHref}
        className="group flex min-w-0 flex-1 items-center gap-4 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--blue-light)"
      >
        <div
          className={`relative size-20 shrink-0 overflow-hidden rounded-xl bg-(--surface-raised) ${room.status === "AVAILABLE" ? "" : "opacity-50 grayscale"}`}
        >
          {room.coverUrl ? (
            <Image src={room.coverUrl} alt="" fill sizes="80px" className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-(--gray)">
              <LuImage aria-hidden="true" size={22} />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="min-w-0 wrap-break-word font-bold text-white group-hover:text-(--blue-light)">{room.title}</h3>
          <p className="mt-1 text-sm text-(--gray)">
            {room.capacity === 1 ? "1 pessoa" : `${room.capacity} pessoas`} · Banheiro {bathroomTypeLabels[room.bathroomType].toLowerCase()}
          </p>
          <p className="mt-0.5 truncate text-xs text-(--gray)">{room.acceptedAudiences.map((audience) => genderIdentityLabels[audience]).join(", ")}</p>
          <p className={`mt-1.5 flex items-center gap-1.5 text-xs font-semibold ${complete ? "text-(--success)" : "text-(--warning)"}`}>
            {complete ? <LuCircleCheck aria-hidden="true" size={14} /> : <LuCircleAlert aria-hidden="true" size={14} />}
            {complete ? "Anúncio completo" : `Anúncio ${room.completenessScore}% · ${nextStep}`}
          </p>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-4 border-t border-(--line) pt-3 @2xl:justify-end @2xl:border-0 @2xl:pt-0">
        {room.status === "INACTIVE" ? (
          <p className="text-lg font-extrabold text-(--gray)">
            {formatCents(room.priceCents)} <span className="text-sm font-semibold">/ diária</span>
          </p>
        ) : (
          <RoomPriceEditor roomId={room.id} roomTitle={room.title} priceCents={room.priceCents} />
        )}
        <div className="min-w-0 flex-1 @2xl:w-44 @2xl:flex-none">
          {room.status === "INACTIVE" ? (
            <Link
              href={roomHref}
              aria-label={`Abrir ${room.title} para reativar`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-semibold text-(--blue-light) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-(--blue-light)"
            >
              Abrir para reativar
              <LuArrowRight aria-hidden="true" size={14} />
            </Link>
          ) : (
            <RoomAvailabilityToggle
              roomId={room.id}
              roomTitle={room.title}
              status={room.status}
              propertyStatus={propertyStatus}
              warnBeforePause={warnBeforePause}
              focusAfterChangeId={focusAfterChangeId}
            />
          )}
        </div>
      </div>
    </li>
  );
}

const roomListClassName = "divide-y divide-(--line) overflow-hidden rounded-2xl border border-(--line-strong) bg-(--surface)";

export default async function PropertyDetailsPage({ params, searchParams }: PageProps<"/meus-imoveis/[propertyId]">) {
  const [{ propertyId }, { publicado, quartos }] = await Promise.all([params, searchParams]);
  const result = await getApiData(`/owner/properties/${propertyId}`, propertyDetailSchema);

  if (result.status !== "ok") {
    return <OwnerDataNotice status={result.status} retryHref={`/meus-imoveis/${propertyId}`} />;
  }

  const property = result.data;
  const editHref = (section: string) => `/meus-imoveis/${property.id}/editar?secao=${section}`;
  const images = property.media.filter((item) => item.type === "IMAGE");
  const cover = images[0];
  const videoCount = property.media.length - images.length;
  const address = privateAddress(property);
  const listedRooms = property.rooms.filter((room) => room.status !== "INACTIVE");
  const archivedRooms = property.rooms.filter((room) => room.status === "INACTIVE");
  const availableCount = listedRooms.filter((room) => room.status === "AVAILABLE").length;
  const visible = property.status === "ACTIVE" && availableCount > 0;
  const warning = visibilityWarning(property, availableCount);
  const warnBeforePause = (room: Room) => property.status === "ACTIVE" && room.status === "AVAILABLE" && availableCount === 1;
  const pausedCount = listedRooms.length - availableCount;
  const showRoomFilter = availableCount > 0 && pausedCount > 0;
  const roomFilter = showRoomFilter && (quartos === "reservaveis" || quartos === "pausados") ? quartos : undefined;
  const shownRooms = roomFilter ? listedRooms.filter((room) => room.status === (roomFilter === "reservaveis" ? "AVAILABLE" : "UNAVAILABLE")) : listedRooms;
  const roomFilterTabs = [
    { value: undefined, label: "Todos", count: listedRooms.length },
    { value: "reservaveis", label: "Reserváveis", count: availableCount },
    { value: "pausados", label: "Pausados", count: pausedCount },
  ] as const;
  const nextRequirement = publishRequirements.find((requirement) => property.missingRequirements.includes(requirement));
  const firstRoom = listedRooms[0] ?? property.rooms[0];
  const propertyMissing = firstRoom ? firstRoom.completenessMissing.filter((criterion) => !isRoomCriterion(criterion)) : [];

  return (
    <OwnerPage
      wide
      title={property.title}
      badge={
        property.status === "ACTIVE" && availableCount === 0 ? (
          <StatusBadge tone="warning">Publicado · fora da busca</StatusBadge>
        ) : (
          <PropertyStatusBadge status={property.status} />
        )
      }
      description={propertySummary(property, listedRooms, availableCount)}
      back={{ href: "/meus-imoveis", label: "Meus imóveis" }}
      actions={
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex flex-wrap gap-3">
            {visible ? (
              <Link href={`/imoveis/${property.id}?previa=1`} target="_blank" className={secondaryButtonClassName}>
                <LuEye aria-hidden="true" size={16} />
                Ver como o hóspede vê
                <LuExternalLink aria-hidden="true" size={14} />
              </Link>
            ) : null}
            {property.status === "DRAFT" && nextRequirement ? (
              <Link href={setupStepHref(property.id, firstPendingStep(property.missingRequirements))} className={primaryButtonClassName}>
                Continuar cadastro
                <LuArrowRight aria-hidden="true" size={16} />
              </Link>
            ) : null}
            <PropertyStatusActions propertyId={property.id} status={property.status} canPublish={property.missingRequirements.length === 0} />
          </div>
        </div>
      }
    >
      {property.status === "ACTIVE" && publicado === "1" ? (
        <section
          aria-labelledby="published-heading"
          className="mt-6 flex flex-col gap-4 rounded-2xl border border-[rgba(47,191,135,.38)] bg-[rgba(47,191,135,.1)] p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <LuCircleCheck aria-hidden="true" size={24} className="mt-0.5 shrink-0 text-(--success)" />
            <div>
              <h2 id="published-heading" className="text-lg font-bold text-white">
                Imóvel publicado
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-(--gray)">
                Ele aparece para os hóspedes enquanto tiver um quarto reservável. Você pode pausá-lo a qualquer momento.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/imoveis/${property.id}?previa=1`} target="_blank" className={primaryButtonClassName}>
              Ver como o hóspede vê
            </Link>
            <Link href={`/meus-imoveis/${property.id}/quartos/novo`} className={secondaryButtonClassName}>
              Adicionar outro quarto
            </Link>
          </div>
        </section>
      ) : null}

      {property.status === "DRAFT" ? (
        <section aria-labelledby="draft-heading" className="mt-6 rounded-2xl border border-(--line-strong) bg-(--surface-raised) p-4 sm:p-5">
          <div>
            <h2 id="draft-heading" className="font-bold text-white">
              {nextRequirement ? "Falta pouco para publicar" : "Tudo pronto para publicar"}
            </h2>
            <p className="mt-1 text-sm text-(--gray)">
              {publishRequirements.length - property.missingRequirements.length} de {publishRequirements.length} itens concluídos
              {nextRequirement ? ` · Próximo: ${requirementLabels[nextRequirement]}` : " · Revise e publique quando quiser."}
            </p>
          </div>
        </section>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section aria-labelledby="rooms-heading" className="@container">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="rooms-heading"
                tabIndex={-1}
                className="rounded-lg text-xl font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--blue-light)"
              >
                Quartos <span className="font-semibold text-(--gray)">({listedRooms.length})</span>
              </h2>
              <p className="mt-1 text-sm text-(--gray)">Pause, ajuste o valor ou abra o quarto para editar os detalhes e as fotos.</p>
            </div>
            <Link href={`/meus-imoveis/${property.id}/quartos/novo`} className={listedRooms.length > 0 ? secondaryButtonClassName : primaryButtonClassName}>
              <LuPlus aria-hidden="true" size={17} />
              Adicionar quarto
            </Link>
          </div>

          {warning ? (
            <p className="mt-4 flex items-start gap-3 rounded-2xl border border-[rgba(232,177,58,.38)] bg-[rgba(232,177,58,.1)] p-4 text-sm leading-relaxed text-white">
              <LuCircleAlert aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-(--warning)" />
              {warning}
            </p>
          ) : null}

          {listedRooms.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-(--line-strong) p-6 text-sm text-(--gray)">
              {archivedRooms.length > 0
                ? "Nenhum quarto ativo. Reative um quarto arquivado ou adicione um novo."
                : "Nenhum quarto cadastrado. Adicione os quartos e suítes que poderão ser reservados."}
            </p>
          ) : (
            <>
              {showRoomFilter ? (
                <nav aria-label="Filtrar quartos" className="mt-4 flex flex-wrap gap-2">
                  {roomFilterTabs.map((tab) => {
                    const active = roomFilter === tab.value;
                    return (
                      <Link
                        key={tab.label}
                        href={tab.value ? `/meus-imoveis/${property.id}?quartos=${tab.value}` : `/meus-imoveis/${property.id}`}
                        scroll={false}
                        aria-current={active ? "page" : undefined}
                        className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light) ${
                          active ? "border-(--blue-light) bg-[rgba(11,99,227,.14)] text-white" : "border-(--line-strong) text-(--gray) hover:text-white"
                        }`}
                      >
                        {tab.label}
                        <span className="text-xs text-(--gray)">{tab.count}</span>
                      </Link>
                    );
                  })}
                </nav>
              ) : null}
              <ul className={`mt-4 ${roomListClassName}`}>
                {shownRooms.map((room) => (
                  <RoomRow
                    key={room.id}
                    propertyId={property.id}
                    propertyStatus={property.status}
                    room={room}
                    warnBeforePause={warnBeforePause(room)}
                    focusAfterChangeId={roomFilter ? "rooms-heading" : undefined}
                  />
                ))}
              </ul>
            </>
          )}

          {archivedRooms.length > 0 ? (
            <details open={listedRooms.length === 0} className="group mt-4">
              <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg text-sm font-semibold text-(--gray) transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--blue-light) [&::-webkit-details-marker]:hidden">
                <LuChevronDown aria-hidden="true" size={16} className="transition-transform group-open:rotate-180" />
                Arquivados ({archivedRooms.length})
              </summary>
              <ul className={`mt-2 ${roomListClassName}`}>
                {archivedRooms.map((room) => (
                  <RoomRow key={room.id} propertyId={property.id} propertyStatus={property.status} room={room} warnBeforePause={false} />
                ))}
              </ul>
            </details>
          ) : null}
        </section>

        <aside aria-labelledby="property-heading" className={`${cardClassName} lg:sticky lg:top-24`}>
          <h2 id="property-heading" className="font-bold text-white">
            O imóvel
          </h2>
          {cover ? (
            <div className="relative mt-4 h-28 overflow-hidden rounded-xl bg-(--surface-raised)">
              <Image src={cover.url} alt="Foto de capa do imóvel" fill sizes="320px" className="object-cover" />
            </div>
          ) : null}
          <div className="mt-3 divide-y divide-(--line)">
            <PropertySection title="Fotos e vídeos" editHref={editHref("midia")}>
              <p>
                {images.length === 1 ? "1 foto" : `${images.length} fotos`}
                {videoCount > 0 ? ` · ${videoCount === 1 ? "1 vídeo" : `${videoCount} vídeos`}` : null}
              </p>
            </PropertySection>

            <PropertySection title="Sobre" editHref={editHref("geral")}>
              <p className="truncate">{property.description || "Sem descrição."}</p>
              <p>{property.features.length === 1 ? "1 comodidade" : `${property.features.length} comodidades`}</p>
            </PropertySection>

            <PropertySection title="Localização" editHref={editHref("localizacao")}>
              <p className="line-clamp-2">
                <span className="font-semibold text-white">Pública: </span>
                {formatLocation(property)}
              </p>
              <p className="line-clamp-2">
                <span className="font-semibold text-white">Só você vê: </span>
                {address ?? "endereço não informado"}
              </p>
            </PropertySection>

            <PropertySection title="Áreas compartilhadas" editHref={editHref("areas")}>
              <p className="truncate">
                {property.sharedAreas.length > 0
                  ? property.sharedAreas.map((area) => area.label ?? sharedAreaTypeLabels[area.type]).join(" · ")
                  : "Nenhuma. Opcional."}
              </p>
            </PropertySection>
          </div>
          {firstRoom && propertyMissing.length > 0 ? (
            <section aria-labelledby="property-completeness-heading" className="mt-4 rounded-xl bg-(--surface-raised) p-4">
              <h3 id="property-completeness-heading" className="flex items-center gap-2 text-sm font-bold text-white">
                <LuCircleAlert aria-hidden="true" size={16} className="shrink-0 text-(--warning)" />
                Para completar os anúncios
              </h3>
              <ul className="mt-2 flex flex-col">
                {propertyMissing.map((criterion) => {
                  const hint = completenessHint(criterion, property.id, firstRoom.id);
                  return (
                    <li key={criterion}>
                      <Link
                        href={hint.href}
                        className="-mx-2 flex min-h-11 items-center justify-between gap-3 rounded-lg px-2 text-sm font-semibold text-(--blue-light) transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-(--blue-light)"
                      >
                        {hint.label}
                        <LuArrowRight aria-hidden="true" size={14} className="shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </OwnerPage>
  );
}
