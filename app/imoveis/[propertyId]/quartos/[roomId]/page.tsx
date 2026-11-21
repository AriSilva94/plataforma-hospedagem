import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { FaWhatsapp } from "react-icons/fa6";
import {
  LuArrowLeft,
  LuBadgeCheck,
  LuBath,
  LuBedDouble,
  LuCalendarCheck,
  LuCalendarDays,
  LuCalendarX,
  LuCheck,
  LuChevronRight,
  LuCigarette,
  LuClipboardList,
  LuFileText,
  LuFlag,
  LuSofa,
  LuSparkles,
  LuTag,
  LuUsers,
} from "react-icons/lu";
import { FavoriteButton } from "@/components/favorite-button";
import { PageNotice } from "@/components/page-notice";
import { PropertyPhotoGrid } from "@/components/property-gallery";
import { OwnerPreviewBanner, PublicListingAside, PublicLocation, PublicPropertyLoadNotice } from "@/components/public-property-parts";
import { ScrollRow } from "@/components/scroll-row";
import { SiteHeader } from "@/components/site-header";
import { StayPicker } from "@/components/stay-picker";
import { iconOf, roomAmenityIcons, sharedAreaTypeIcons } from "@/lib/amenity-icons";
import { isBlockedDay, isOutsideWindow, parseIsoDate, roomAvailabilitySchema, type RoomAvailability } from "@/lib/availability";
import { getCurrentUser } from "@/lib/current-user";
import { initialsOf } from "@/lib/initials";
import {
  bathroomTypeLabels,
  bedsSummary,
  cleaningSummary,
  formatCents,
  formatLocation,
  genderIdentityLabels,
  labelOf,
  publicPropertyDetailSchema,
  roomAmenityLabels,
  sharedAreaTypeLabels,
  smokingPolicyLabels,
} from "@/lib/properties";
import { getFavoriteRoomIds } from "@/lib/room-listings";
import { getApiData } from "@/lib/server-api";

const SUPPORT_EMAIL = "contato@domusx.com.br";
const WHATSAPP_PLACEHOLDER_NUMBER = "5500000000000";
const UPCOMING_DAY_COUNT = 5;

const dayMonthFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });
const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });

function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function upcomingDays(availability: RoomAvailability) {
  const today = parseIsoDate(availability.today);
  return Array.from({ length: UPCOMING_DAY_COUNT }, (_, index) => addDays(today, index))
    .filter((day) => !isOutsideWindow(day, availability))
    .map((day, index) => ({
      day,
      label: index === 0 ? "Hoje" : index === 1 ? "Amanhã" : weekdayFormatter.format(day).replace(".", ""),
      blocked: isBlockedDay(day, availability),
    }));
}

function firstFreeDay(availability: RoomAvailability) {
  const windowEnd = parseIsoDate(availability.windowEnd);
  for (let day = parseIsoDate(availability.today); day <= windowEnd; day = addDays(day, 1)) {
    if (!isBlockedDay(day, availability)) return day;
  }
  return undefined;
}

function TodayStatus({ availability }: { availability: RoomAvailability }) {
  const freeDay = firstFreeDay(availability);
  const freeToday = freeDay?.getTime() === parseIsoDate(availability.today).getTime();
  const Icon = freeToday ? LuCalendarCheck : LuCalendarX;
  const label = freeToday ? "Disponível hoje" : freeDay ? `Livre a partir de ${dayMonthFormatter.format(freeDay)}` : "Sem datas livres";

  return (
    <p
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold whitespace-nowrap tabular-nums ${
        freeToday ? "border-(--success)/38 bg-(--success-soft) text-(--success)" : "border-(--error)/38 bg-(--error-soft) text-(--error)"
      }`}
    >
      <Icon aria-hidden="true" size={16} className="shrink-0" />
      {label}
    </p>
  );
}

function RoomPanel({ icon: Icon, title, aside, className = "", children }: { icon: IconType; title: string; aside?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section className={`rounded-2xl border border-(--border-accent) bg-(--surface) p-4 md:p-5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="flex items-center gap-2 text-base font-bold text-(--text-primary) md:text-lg">
          <Icon aria-hidden="true" className="size-5 shrink-0 text-(--primary-text) md:size-6" />
          {title}
        </h2>
        {aside}
      </div>
      <div className="mt-3 text-sm leading-relaxed text-(--text-secondary)">{children}</div>
    </section>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-(--text-primary)">
          <LuCheck aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-(--primary-text)" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export async function generateMetadata({ params }: PageProps<"/imoveis/[propertyId]/quartos/[roomId]">): Promise<Metadata> {
  const { propertyId, roomId } = await params;
  const result = await getApiData(`/properties/${propertyId}`, publicPropertyDetailSchema);
  if (result.status !== "ok") return { title: "Quarto não encontrado | DOMUS X" };
  const room = result.data.rooms.find((item) => item.id === roomId);
  if (!room) return { title: "Quarto não encontrado | DOMUS X" };
  const place = [result.data.city, result.data.state].filter(Boolean).join(" · ");
  return { title: `${room.title}${place ? ` · ${place}` : ""} | DOMUS X` };
}

export default async function PublicRoomPage({ params, searchParams }: PageProps<"/imoveis/[propertyId]/quartos/[roomId]">) {
  const [{ propertyId, roomId }, { previa }] = await Promise.all([params, searchParams]);
  const preview = previa === "1";
  const [{ user }, result, availabilityResult] = await Promise.all([
    getCurrentUser(),
    getApiData(`/properties/${propertyId}`, publicPropertyDetailSchema),
    getApiData(`/rooms/${roomId}/availability`, roomAvailabilitySchema),
  ]);

  if (result.status !== "ok") {
    return (
      <>
        <SiteHeader user={user} />
        <PublicPropertyLoadNotice notFound={result.status === "not-found"} retryHref={`/imoveis/${propertyId}/quartos/${roomId}`} />
      </>
    );
  }

  const property = result.data;
  const room = property.rooms.find((item) => item.id === roomId);

  if (!room) {
    return (
      <>
        <SiteHeader user={user} />
        <PageNotice
          title="Quarto não encontrado"
          description="Este quarto não existe ou não está disponível no momento."
          actionLabel="Ver imóvel"
          actionHref={`/imoveis/${property.id}`}
        />
      </>
    );
  }

  const availability = availabilityResult.status === "ok" ? availabilityResult.data : undefined;
  const favoriteRoomIds = new Set(await getFavoriteRoomIds(Boolean(user)));
  const roomPhotos = room.media.map((item, index) => ({
    id: item.id,
    url: item.url,
    type: item.type,
    alt: `${item.type === "VIDEO" ? "Vídeo" : "Foto"} ${index === 0 ? "principal" : index + 1} de ${room.title}`,
  }));
  const propertyHref = `/imoveis/${property.id}${preview ? "?previa=1" : ""}`;
  const cleaning = cleaningSummary(room.hasCleaner, room.cleaningFrequency);
  const highlights = [
    { icon: LuUsers, label: room.capacity === 1 ? "1 hóspede" : `Até ${room.capacity} hóspedes` },
    { icon: LuBath, label: `Banheiro ${bathroomTypeLabels[room.bathroomType].toLowerCase()}` },
    ...(room.beds.length > 0 ? [{ icon: LuBedDouble, label: bedsSummary(room.beds) }] : []),
    ...room.amenities.slice(0, 4).map((amenity) => ({ icon: iconOf(roomAmenityIcons, amenity), label: labelOf(roomAmenityLabels, amenity) })),
  ];
  const details = [
    { icon: LuTag, label: "Público", value: room.acceptedAudiences.map((audience) => genderIdentityLabels[audience]).join(", ") },
    ...(cleaning ? [{ icon: LuSparkles, label: "Faxina", value: cleaning }] : []),
    ...(room.smokingPolicy ? [{ icon: LuCigarette, label: "Fumantes", value: smokingPolicyLabels[room.smokingPolicy] }] : []),
  ];
  const whatsappHref = `https://wa.me/${WHATSAPP_PLACEHOLDER_NUMBER}?text=${encodeURIComponent(`Olá! Tenho interesse no ${room.title}, em ${formatLocation(property)}.`)}`;
  const reportMailHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Anúncio inativo: ${room.title}`)}&body=${encodeURIComponent(`Quarto: ${room.title}\nImóvel: ${property.title}\nLink: /imoveis/${property.id}/quartos/${room.id}`)}`;

  return (
    <>
      <SiteHeader user={user} />
      {preview ? <OwnerPreviewBanner propertyId={property.id} /> : null}
      <main className="px-4 pt-4 pb-28 sm:px-6 md:pt-6 md:pb-16">
        <div className="mx-auto max-w-6xl">
          <Link href={propertyHref} className="inline-flex items-center gap-2 text-sm font-semibold text-(--text-secondary) transition-colors hover:text-(--text-primary)">
            <LuArrowLeft aria-hidden="true" size={16} /> Voltar ao imóvel
          </Link>

          <header className="mt-3">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <h1 className="flex min-w-0 items-center gap-2.5 text-xl font-extrabold tracking-tight text-(--text-primary) md:text-2xl">
                <LuBedDouble aria-hidden="true" className="size-6 shrink-0 text-(--gold) md:size-7" />
                <span className="wrap-break-word">{room.title}</span>
                {room.verified ? (
                  <span title="Quarto verificado" className="shrink-0 text-(--success)">
                    <LuBadgeCheck aria-hidden="true" size={20} />
                    <span className="sr-only">Quarto verificado</span>
                  </span>
                ) : null}
              </h1>
              {availability ? <TodayStatus availability={availability} /> : null}
            </div>
          </header>

          <PropertyPhotoGrid title={room.title} photos={roomPhotos} />

          <div className="mt-3 flex items-center rounded-2xl border border-(--border-accent) bg-(--surface) py-3 pl-4 md:py-4 md:pl-5">
            <p className="shrink-0 border-r border-(--border) pr-4 text-sm whitespace-nowrap text-(--text-secondary) md:pr-6">
              <strong className="text-2xl font-extrabold text-(--text-primary) tabular-nums md:text-3xl">{formatCents(room.priceCents)}</strong> / diária
            </p>
            <ScrollRow className="min-w-0 flex-1 py-1 pr-4">
              {highlights.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex shrink-0 items-center gap-2 px-4 text-sm font-semibold whitespace-nowrap text-(--text-primary) md:flex-1 md:flex-col md:justify-center md:gap-1.5 md:px-3 md:text-center md:text-xs"
                >
                  <Icon aria-hidden="true" className="size-5 shrink-0 text-(--primary-text) md:size-6" />
                  {label}
                </li>
              ))}
            </ScrollRow>
          </div>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
            <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 md:items-start">
              {availability ? (
                <RoomPanel
                  icon={LuCalendarDays}
                  title="Disponibilidade deste quarto"
                  className="md:col-span-2"
                  aside={
                    <a
                      href="#reservar"
                      className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-(--border) px-3 text-sm font-semibold text-(--primary-text) transition-colors hover:border-(--primary)/40 hover:bg-(--primary-soft) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                    >
                      Ver calendário <LuChevronRight aria-hidden="true" size={14} />
                    </a>
                  }
                >
                  <ScrollRow className="gap-2">
                    {upcomingDays(availability).map(({ day, label, blocked }) => (
                      <li
                        key={day.getTime()}
                        className={`flex min-w-28 shrink-0 flex-1 items-start gap-2 rounded-xl border px-3 py-2.5 ${
                          blocked ? "border-(--error)/38 bg-(--error-soft) text-(--error)" : "border-(--success)/38 bg-(--success-soft) text-(--success)"
                        }`}
                      >
                        {blocked ? <LuCalendarX aria-hidden="true" size={16} className="mt-0.5 shrink-0" /> : <LuCalendarCheck aria-hidden="true" size={16} className="mt-0.5 shrink-0" />}
                        <span className="leading-tight">
                          <span className="block text-xs font-bold first-letter:uppercase">{label}</span>
                          <span className="block text-sm font-extrabold text-(--text-primary) tabular-nums">{dayMonthFormatter.format(day)}</span>
                          <span className="block text-xs font-semibold">{blocked ? "Indisponível" : "Disponível"}</span>
                        </span>
                      </li>
                    ))}
                  </ScrollRow>
                </RoomPanel>
              ) : null}

              {room.description || room.additionalInfo ? (
                <RoomPanel icon={LuFileText} title="Descrição do quarto" className="md:col-span-2">
                  {room.description ? <p className="max-w-prose whitespace-pre-line text-(--text-primary)">{room.description}</p> : null}
                  {room.additionalInfo ? <p className="mt-2 max-w-prose whitespace-pre-line">{room.additionalInfo}</p> : null}
                </RoomPanel>
              ) : null}

              {room.amenities.length > 0 ? (
                <RoomPanel icon={LuBedDouble} title="Itens do quarto">
                  <CheckList items={room.amenities.map((amenity) => labelOf(roomAmenityLabels, amenity))} />
                </RoomPanel>
              ) : null}

              {property.sharedAreas.length > 0 ? (
                <RoomPanel icon={LuSofa} title="Áreas compartilhadas">
                  <ul className="grid grid-cols-2 gap-2">
                    {property.sharedAreas.map((area, index) => {
                      const Icon = sharedAreaTypeIcons[area.type];
                      return (
                        <li key={`${area.type}-${index}`} title={area.description ?? undefined} className="flex items-center gap-2 rounded-xl bg-(--surface-raised) px-3 py-2.5 font-semibold text-(--text-primary)">
                          <Icon aria-hidden="true" size={18} className="shrink-0 text-(--primary-text)" />
                          <span className="min-w-0 truncate">{area.label ?? sharedAreaTypeLabels[area.type]}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <Link
                    href={propertyHref}
                    className="mt-3 flex min-h-10 items-center justify-center gap-1 rounded-xl border border-(--border) px-3 text-sm font-semibold text-(--primary-text) transition-colors hover:border-(--primary)/40 hover:bg-(--primary-soft) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                  >
                    Ver o imóvel completo <LuChevronRight aria-hidden="true" size={14} />
                  </Link>
                </RoomPanel>
              ) : null}

              {property.houseRules ? (
                <RoomPanel icon={LuClipboardList} title="Regras da casa">
                  <p className="whitespace-pre-line text-(--text-primary)">{property.houseRules}</p>
                </RoomPanel>
              ) : null}

              <RoomPanel icon={LuUsers} title="Para quem é">
                <dl className="grid gap-3">
                  {details.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-(--primary-text)" />
                      <div>
                        <dt className="text-xs">{label}</dt>
                        <dd className="font-semibold text-(--text-primary)">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </RoomPanel>

              <section aria-label="Anfitrião" className="flex items-center gap-3.5 border-y border-(--border) py-4 md:col-span-2">
                <span className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--primary) text-sm font-bold text-(--on-primary)">
                  {property.host.avatarUrl ? (
                    <Image src={property.host.avatarUrl} alt="" fill sizes="48px" className="object-cover" />
                  ) : (
                    <span aria-hidden="true">{initialsOf(property.host.name)}</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-(--text-secondary)">Anfitrião</p>
                  <p className="truncate text-base font-bold text-(--text-primary)">{property.host.name}</p>
                </div>
                <Link
                  href={`/anfitriao/${property.host.id}`}
                  className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-xl border border-(--border) px-3 text-sm font-semibold text-(--primary-text) transition-colors hover:border-(--primary)/40 hover:bg-(--primary-soft) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                >
                  Ver perfil <LuChevronRight aria-hidden="true" size={14} />
                </Link>
              </section>

              <section aria-labelledby="location-title" className="md:col-span-2">
                <h2 id="location-title" className="mb-3 text-base font-bold text-(--text-primary) md:text-lg">
                  Localização aproximada
                </h2>
                <PublicLocation property={property} />
              </section>
            </div>

            <PublicListingAside preview={preview} flush>
              <div id="reservar" className="scroll-mt-28 rounded-2xl border border-(--border) bg-(--surface) p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-(--text-secondary)">
                    <strong className="text-2xl font-extrabold text-(--text-primary) tabular-nums">{formatCents(room.priceCents)}</strong> / diária
                  </p>
                  <FavoriteButton
                    roomId={room.id}
                    roomTitle={room.title}
                    initialFavorited={favoriteRoomIds.has(room.id)}
                    signedIn={Boolean(user)}
                    loginReturnPath={`/imoveis/${property.id}/quartos/${room.id}`}
                    variant="icon"
                  />
                </div>

                <div className="mt-4">
                  <StayPicker disabled={preview} capacity={room.capacity} availability={availability} />
                </div>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-(--success)/35 bg-(--success-soft) px-4 text-sm font-bold text-(--success) transition-colors hover:border-(--success)/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                >
                  <FaWhatsapp aria-hidden="true" size={18} /> Mensagem ao anfitrião
                  <span className="sr-only">(abre em nova aba)</span>
                </a>
              </div>

              <a
                href={reportMailHref}
                className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-(--error)/35 bg-(--error-soft) px-4 text-sm font-semibold text-(--error) transition-colors hover:border-(--error)/60"
              >
                <LuFlag aria-hidden="true" size={14} /> Reportar anúncio inativo
              </a>
            </PublicListingAside>
          </div>
        </div>
      </main>
    </>
  );
}
