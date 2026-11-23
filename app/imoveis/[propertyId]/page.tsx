import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  LuArrowDown,
  LuArrowLeft,
  LuBath,
  LuBedDouble,
  LuCalendarCheck,
  LuChevronRight,
  LuCigarette,
  LuClipboardList,
  LuHouse,
  LuInfo,
  LuMapPin,
  LuShieldCheck,
  LuSignpost,
  LuSofa,
  LuSparkles,
  LuStar,
  LuX,
} from "react-icons/lu";
import { AvailabilityCheck } from "@/components/availability-check";
import { FavoriteButton } from "@/components/favorite-button";
import { IconList } from "@/components/icon-list";
import { PropertyPhotoGrid } from "@/components/property-gallery";
import { PropertyTabs, type PropertyTab } from "@/components/property-tabs";
import { propertyTypeColorClassNames, propertyTypeIcons } from "@/components/property-type-tag";
import { OwnerPreviewBanner, PublicListingAside, PublicPropertyLoadNotice } from "@/components/public-property-parts";
import { RoomRow, RoomStatusLegend } from "@/components/room-row";
import { ScrollRow } from "@/components/scroll-row";
import { SharedAreaPhotos } from "@/components/shared-area-photos";
import { SiteHeader } from "@/components/site-header";
import { iconOf, propertyFeatureIcons, sharedAreaTypeIcons } from "@/lib/amenity-icons";
import { getCurrentUser } from "@/lib/current-user";
import { initialsOf } from "@/lib/initials";
import {
  cleaningSummary,
  formatCents,
  formatLocation,
  labelOf,
  propertyFeatureLabels,
  propertyTypeLabels,
  publicPropertyDetailSchema,
  sharedAreaTypeLabels,
  smokingPolicyLabels,
  MediaKind,
} from "@/lib/properties";
import { getFavoriteRoomIds } from "@/lib/room-listings";
import { getApiData } from "@/lib/server-api";

function PanelBlock({ icon: Icon, title, count, aside, children }: { icon: IconType; title: string; count?: number; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="not-first:mt-7">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="flex items-center gap-2 text-base font-bold text-(--text-primary) md:text-lg">
          <Icon aria-hidden="true" className="size-5 shrink-0 text-(--primary-text) md:size-6" />
          {title}
          {count !== undefined ? <span className="tabular-nums">({count})</span> : null}
        </h2>
        {aside}
      </div>
      <div className="mt-3 text-sm leading-relaxed text-(--text-secondary)">{children}</div>
    </section>
  );
}

export async function generateMetadata({ params }: PageProps<"/imoveis/[propertyId]">): Promise<Metadata> {
  const { propertyId } = await params;
  const result = await getApiData(`/properties/${propertyId}`, publicPropertyDetailSchema);
  if (result.status !== "ok") return { title: "Local não encontrado | DOMUS X" };
  const place = [result.data.city, result.data.state].filter(Boolean).join(" · ");
  return {
    title: `${result.data.title}${place ? ` · ${place}` : ""} | DOMUS X`,
  };
}

const hostSinceFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric", timeZone: "America/Sao_Paulo" });

function formatHostSince(iso: string) {
  const parts = hostSinceFormatter.formatToParts(new Date(iso));
  const month = parts.find((part) => part.type === "month")?.value.replace(".", "");
  const year = parts.find((part) => part.type === "year")?.value;
  return `${month}/${year}`;
}

function formatIsoDate(iso: string) {
  return iso.split("-").reverse().join("/");
}

export default async function PublicPropertyPage({ params, searchParams }: PageProps<"/imoveis/[propertyId]">) {
  const [{ propertyId }, { previa, entrada, saida }] = await Promise.all([params, searchParams]);
  const preview = previa === "1";
  const query = new URLSearchParams();
  if (typeof entrada === "string") query.set("checkIn", entrada);
  if (typeof saida === "string") query.set("checkOut", saida);
  const [{ user }, result] = await Promise.all([getCurrentUser(), getApiData(`/properties/${propertyId}?${query.toString()}`, publicPropertyDetailSchema)]);

  if (result.status !== "ok") {
    return (
      <>
        <SiteHeader user={user} />
        <PublicPropertyLoadNotice notFound={result.status === "not-found"} retryHref={`/imoveis/${propertyId}`} />
      </>
    );
  }

  const property = result.data;
  const favoriteRoomIds = new Set(await getFavoriteRoomIds(Boolean(user)));
  const photos = property.media.map((item, index) => ({
    id: item.id,
    url: item.url,
    type: item.type,
    alt: `${item.type === MediaKind.VIDEO ? "Vídeo" : "Foto"} ${index === 0 ? "principal" : index + 1} de ${property.title}`,
  }));
  const cleaning = cleaningSummary(property.hasCleaner, property.cleaningFrequency);
  const lowestPrice = property.rooms.length > 0 ? Math.min(...property.rooms.map((room) => room.priceCents)) : undefined;
  const roomCount = property.rooms.length === 1 ? "1 quarto disponível" : `${property.rooms.length} quartos disponíveis`;
  const TypeIcon = propertyTypeIcons[property.type];
  const highlights = [
    {
      icon: LuBedDouble,
      count: property.rooms.length,
      label: property.rooms.length === 1 ? "Quarto" : "Quartos",
    },
    ...property.features.map((feature) => ({
      count: undefined,
      icon: iconOf(propertyFeatureIcons, feature),
      label: labelOf(propertyFeatureLabels, feature),
    })),
  ];

  const { period } = property.availability;
  const verifiedRoomCount = property.rooms.filter((room) => room.verified).length;
  const visibleRooms = period ? property.rooms.filter((room) => room.availabilityStatus === "AVAILABLE") : property.rooms;
  const periodLabel = period
    ? period.checkOut === period.checkIn
      ? `em ${formatIsoDate(period.checkIn)}`
      : `de ${formatIsoDate(period.checkIn)} a ${formatIsoDate(period.checkOut)}`
    : undefined;

  const roomsPanel = (
    <PanelBlock icon={LuBedDouble} title="Quartos e disponibilidade" count={visibleRooms.length} aside={<RoomStatusLegend />}>
      {periodLabel ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-xl bg-(--primary-soft) px-3 py-2 text-(--text-primary)" aria-live="polite">
          <p className="flex items-center gap-2">
            <LuCalendarCheck aria-hidden="true" size={16} className="shrink-0 text-(--primary-text)" />
            <span>
              <strong className="tabular-nums">
                {visibleRooms.length} de {property.rooms.length}
              </strong>{" "}
              {property.rooms.length === 1 ? "quarto livre" : "quartos livres"} {periodLabel}
            </span>
          </p>
          <Link
            href={`/imoveis/${property.id}${preview ? "?previa=1" : ""}`}
            scroll={false}
            className="inline-flex items-center gap-1 text-sm font-semibold text-(--primary-text) transition-colors hover:text-(--text-primary)"
          >
            <LuX aria-hidden="true" size={14} /> Limpar consulta
          </Link>
        </div>
      ) : null}
      {visibleRooms.length > 0 ? (
        <ul className="grid grid-cols-1 gap-2">
          {visibleRooms.map((room) => (
            <li key={room.id}>
              <RoomRow
                room={room}
                href={`/imoveis/${property.id}/quartos/${room.id}${preview ? "?previa=1" : ""}`}
                action={
                  <FavoriteButton
                    roomId={room.id}
                    roomTitle={room.title}
                    initialFavorited={favoriteRoomIds.has(room.id)}
                    signedIn={Boolean(user)}
                    loginReturnPath={`/imoveis/${property.id}/quartos/${room.id}`}
                  />
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-(--border) p-6">{period ? "Nenhum quarto livre nessas datas. Tente outra data." : "Nenhum quarto disponível no momento."}</p>
      )}
      {property.rooms.length > 0 ? (
        <AvailabilityCheck
          key={period ? `${period.checkIn}-${period.checkOut}` : "hoje"}
          today={property.availability.today}
          windowEnd={property.availability.windowEnd}
          period={period}
          preview={preview}
        />
      ) : null}
    </PanelBlock>
  );

  const tabs: PropertyTab[] = [
    {
      id: "quartos",
      label: "Quartos",
      icon: <LuBedDouble size={18} />,
      panel: roomsPanel,
    },
  ];

  if (property.features.length > 0 || property.sharedAreas.length > 0 || property.sharedBathroomCount > 0) {
    tabs.push({
      id: "ambientes",
      label: "Ambientes",
      icon: <LuHouse size={18} />,
      panel: (
        <>
          {property.features.length > 0 ? (
            <PanelBlock icon={LuHouse} title="O que o local oferece">
              <IconList
                items={property.features.map((feature) => ({
                  icon: iconOf(propertyFeatureIcons, feature),
                  label: labelOf(propertyFeatureLabels, feature),
                }))}
              />
            </PanelBlock>
          ) : null}
          {property.sharedAreas.length > 0 || property.sharedBathroomCount > 0 ? (
            <PanelBlock icon={LuSofa} title="Áreas compartilhadas">
              <ul className="grid gap-3 sm:grid-cols-2">
                {property.sharedAreas.map((area, index) => {
                  const Icon = sharedAreaTypeIcons[area.type];
                  const name = area.label ?? sharedAreaTypeLabels[area.type];
                  return (
                    <li key={`${area.type}-${index}`} className="flex items-start gap-3 rounded-xl border border-(--border) bg-(--surface) p-4">
                      <Icon aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-(--primary-text)" />
                      <div className="min-w-0">
                        <p className="font-semibold text-(--text-primary)">{name}</p>
                        {area.description ? <p className="mt-1">{area.description}</p> : null}
                        {area.media.length > 0 ? <SharedAreaPhotos areaName={name} media={area.media} /> : null}
                      </div>
                    </li>
                  );
                })}
                {property.sharedBathroomCount > 0 ? (
                  <li className="flex items-start gap-3 rounded-xl border border-(--border) bg-(--surface) p-4">
                    <LuBath aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-(--primary-text)" />
                    <div className="min-w-0">
                      <p className="font-semibold text-(--text-primary)">
                        {property.sharedBathroomCount} {property.sharedBathroomCount === 1 ? "banheiro compartilhado" : "banheiros compartilhados"}
                      </p>
                      {property.sharedBathrooms.some((bathroom) => bathroom.media.length > 0) ? (
                        <SharedAreaPhotos areaName="Banheiros compartilhados" media={property.sharedBathrooms.flatMap((bathroom) => bathroom.media)} />
                      ) : null}
                    </div>
                  </li>
                ) : null}
              </ul>
            </PanelBlock>
          ) : null}
        </>
      ),
    });
  }

  if (property.houseRules || property.generalInfo) {
    tabs.push({
      id: "regras",
      label: "Regras",
      icon: <LuClipboardList size={18} />,
      panel: (
        <>
          {property.houseRules ? (
            <PanelBlock icon={LuClipboardList} title="Regras da casa">
              <p className="whitespace-pre-line">{property.houseRules}</p>
            </PanelBlock>
          ) : null}
          {property.generalInfo ? (
            <PanelBlock icon={LuInfo} title="Informações úteis">
              <p className="whitespace-pre-line">{property.generalInfo}</p>
            </PanelBlock>
          ) : null}
        </>
      ),
    });
  }

  if (cleaning || property.smokingPolicy) {
    tabs.push({
      id: "politica",
      label: "Política",
      icon: <LuShieldCheck size={18} />,
      panel: (
        <PanelBlock icon={LuShieldCheck} title="Faxina e fumantes">
          <ul className="grid gap-3 sm:grid-cols-2">
            {cleaning ? (
              <li className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--surface) p-4">
                <LuSparkles aria-hidden="true" size={18} className="shrink-0 text-(--primary-text)" />
                <span className="font-semibold text-(--text-primary)">{cleaning}</span>
              </li>
            ) : null}
            {property.smokingPolicy ? (
              <li className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--surface) p-4">
                <LuCigarette aria-hidden="true" size={18} className="shrink-0 text-(--primary-text)" />
                <span className="font-semibold text-(--text-primary)">{smokingPolicyLabels[property.smokingPolicy]}</span>
              </li>
            ) : null}
          </ul>
        </PanelBlock>
      ),
    });
  }

  return (
    <>
      <SiteHeader user={user} />
      {preview ? <OwnerPreviewBanner propertyId={property.id} /> : null}
      <main className="px-4 pt-4 pb-28 sm:px-6 md:pt-6 md:pb-16">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-(--text-secondary) transition-colors hover:text-(--text-primary)">
            <LuArrowLeft aria-hidden="true" size={16} /> Início
          </Link>

          <header className="mt-3 flex items-center gap-3">
            <span
              role="img"
              aria-label={`Tipo do imóvel: ${propertyTypeLabels[property.type]}`}
              title={propertyTypeLabels[property.type]}
              className={`flex size-12 shrink-0 items-center justify-center rounded-xl border md:size-14 ${propertyTypeColorClassNames[property.type]}`}
            >
              <TypeIcon aria-hidden="true" size={26} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <h1 className="wrap-break-word text-xl font-extrabold tracking-tight text-(--text-primary) md:text-2xl">{property.title}</h1>
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-(--text-secondary)">
                <LuMapPin aria-hidden="true" size={14} className="shrink-0 text-(--primary-text)" /> {formatLocation(property)}
              </p>
            </div>
            <p className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-(--border-strong)/60 bg-(--surface) px-3 py-1.5 text-sm md:self-center">
              <LuStar aria-hidden="true" size={16} className="fill-(--gold) text-(--gold)" />
              <strong className="font-extrabold text-(--text-primary)">Novo</strong>
              <span className="hidden text-(--text-secondary) sm:inline">(sem avaliações)</span>
            </p>
          </header>

          <PropertyPhotoGrid title={property.title} photos={photos} />

          {property.description ? <p className="mt-3 max-w-prose whitespace-pre-line text-sm leading-relaxed text-(--text-primary) md:text-base">{property.description}</p> : null}

          <ScrollRow className="mt-3 py-1">
            {highlights.map(({ icon: Icon, count, label }) => (
              <li
                key={label}
                className="flex shrink-0 items-center gap-2 border-l border-(--border) px-4 text-sm font-semibold whitespace-nowrap text-(--text-primary) first:border-l-0 first:pl-0 last:pr-0 sm:flex-1 sm:justify-center sm:gap-2.5 sm:first:justify-start"
              >
                <Icon aria-hidden="true" className="size-5 shrink-0 text-(--primary-text) sm:size-6" />
                <span>
                  {count !== undefined ? <span className="mr-1 tabular-nums">{count} </span> : null}
                  {label}
                </span>
              </li>
            ))}
          </ScrollRow>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
            <div className="min-w-0">
              <section id="quartos" aria-label="Detalhes do imóvel" className="scroll-mt-28">
                <PropertyTabs label="Detalhes do imóvel" tabs={tabs} />
              </section>

              <section aria-label="Anfitrião" className="mt-6 flex flex-wrap items-center gap-x-3.5 gap-y-3 border-y border-(--border) py-4">
                <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--primary) text-base font-bold text-(--on-primary) ring-2 ring-(--border-accent) ring-offset-2 ring-offset-(--background)">
                  {property.host.avatarUrl ? (
                    <Image src={property.host.avatarUrl} alt="" fill sizes="56px" className="object-cover" />
                  ) : (
                    <span aria-hidden="true">{initialsOf(property.host.name)}</span>
                  )}
                </span>
                <div className="min-w-0 flex-1 sm:flex-initial">
                  <p className="text-xs text-(--text-secondary)">Anfitrião</p>
                  <p className="truncate text-base font-bold text-(--text-primary) md:text-lg">{property.host.name}</p>
                  <p className="text-xs whitespace-nowrap text-(--text-secondary)">Desde {formatHostSince(property.host.since)}</p>
                </div>
                {verifiedRoomCount > 0 ? (
                  <p className="order-last -mt-1 flex w-full items-center gap-2 pl-17.5 text-sm text-(--text-secondary) sm:order-none sm:mt-0 sm:w-auto sm:border-l sm:border-(--border) sm:py-1 sm:pl-4">
                    <LuShieldCheck aria-hidden="true" className="size-5 shrink-0 text-(--success)" />
                    <span>
                      <strong className="font-bold text-(--text-primary) tabular-nums">
                        {verifiedRoomCount} de {property.rooms.length}
                      </strong>{" "}
                      {property.rooms.length === 1 ? "quarto verificado" : "quartos verificados"}
                    </span>
                  </p>
                ) : null}
                <Link
                  href={`/anfitriao/${property.host.id}`}
                  className="ml-auto inline-flex min-h-10 shrink-0 items-center gap-1 rounded-xl border border-(--border) px-3 text-sm font-semibold text-(--primary-text) transition-colors hover:border-(--primary)/40 hover:bg-(--primary-soft) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                >
                  Ver perfil <LuChevronRight aria-hidden="true" size={14} />
                </Link>
              </section>

              <section aria-labelledby="location-title" className="mt-4">
                <div className="flex items-center gap-3 rounded-xl border border-(--border-accent) bg-(--surface) py-2 pr-2 pl-3.5">
                  <LuMapPin aria-hidden="true" className="size-5 shrink-0 text-(--primary-text)" />
                  <div className="min-w-0 flex-1 text-sm font-semibold text-(--text-primary) sm:font-normal md:text-[15px]">
                    <h2 id="location-title" className="block text-xs font-medium whitespace-nowrap text-(--text-secondary) sm:inline sm:text-[length:inherit] sm:font-bold sm:text-(--text-primary)">
                      Localização aproximada<span className="hidden sm:inline">:</span>
                    </h2>{" "}
                    {formatLocation(property)}
                    {property.referencePoints.length > 0 ? (
                      <div className="mt-1 flex items-start gap-1.5 text-xs font-semibold text-(--primary-text)">
                        <LuSignpost aria-hidden="true" size={14} className="mt-px shrink-0" />
                        <ul aria-label="Pontos de referência" className="flex flex-wrap items-center gap-x-1.5">
                          {property.referencePoints.map((point, index) => (
                            <li key={point} className="flex items-center gap-1.5">
                              {index > 0 ? (
                                <span aria-hidden="true" className="text-(--text-secondary)">
                                  ·
                                </span>
                              ) : null}
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                  {property.city ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([property.neighborhood, property.city, property.state].filter(Boolean).join(", "))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-2.5 text-sm font-bold whitespace-nowrap text-(--primary-text) transition-colors hover:bg-(--primary-soft) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                    >
                      <span className="sm:hidden">Mapa</span>
                      <span className="hidden sm:inline">Ver no mapa</span>
                      <LuChevronRight aria-hidden="true" size={16} />
                      <span className="sr-only">(abre em nova aba)</span>
                    </a>
                  ) : null}
                </div>
              </section>
            </div>

            <PublicListingAside preview={preview} flush>
              {lowestPrice !== undefined ? (
                <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
                  <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-(--text-secondary) uppercase">
                    <LuBedDouble aria-hidden="true" size={14} /> A partir de
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-(--text-primary)">
                    {formatCents(lowestPrice)} <span className="text-sm font-semibold text-(--text-secondary)">/ diária</span>
                  </p>
                  <p className="mt-1 text-sm text-(--text-secondary)">{roomCount}</p>
                  <a
                    href="#quartos"
                    className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-(--primary) px-5 text-sm font-bold text-(--on-primary) transition-colors hover:bg-(--primary-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                  >
                    Escolher quarto
                    <LuArrowDown aria-hidden="true" size={16} />
                  </a>
                </div>
              ) : null}
            </PublicListingAside>
          </div>
        </div>
      </main>
    </>
  );
}
