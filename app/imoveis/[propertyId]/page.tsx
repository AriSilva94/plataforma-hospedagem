import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { LuArrowDown, LuArrowLeft, LuBath, LuEyeOff, LuMapPin, LuUsers } from "react-icons/lu";
import { Chips } from "@/components/chips";
import { FavoriteButton } from "@/components/favorite-button";
import { PageNotice } from "@/components/page-notice";
import { PropertyPhotoGrid, RoomCover } from "@/components/property-gallery";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/current-user";
import { favoriteRoomIdsSchema } from "@/lib/favorites";
import {
  bathroomTypeLabels,
  formatCents,
  formatLocation,
  genderIdentityLabels,
  labelOf,
  propertyFeatureLabels,
  propertyTypeLabels,
  publicPropertyDetailSchema,
  roomAmenityLabels,
  sharedAreaTypeLabels,
} from "@/lib/properties";
import { getApiData } from "@/lib/server-api";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-(--line) py-8">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <div className="mt-4 text-sm leading-relaxed text-(--gray)">{children}</div>
    </section>
  );
}

export async function generateMetadata({ params }: PageProps<"/imoveis/[propertyId]">): Promise<Metadata> {
  const { propertyId } = await params;
  const result = await getApiData(`/properties/${propertyId}`, publicPropertyDetailSchema);
  if (result.status !== "ok") return { title: "Local não encontrado | DOMUS X" };
  const place = [result.data.city, result.data.state].filter(Boolean).join(" · ");
  return { title: `${result.data.title}${place ? ` · ${place}` : ""} | DOMUS X` };
}

export default async function PublicPropertyPage({ params, searchParams }: PageProps<"/imoveis/[propertyId]">) {
  const [{ propertyId }, { previa }] = await Promise.all([params, searchParams]);
  const [{ user }, result] = await Promise.all([
    getCurrentUser(),
    getApiData(`/properties/${propertyId}`, publicPropertyDetailSchema),
  ]);

  if (result.status !== "ok") {
    return (
      <>
        <SiteHeader user={user} />
        {result.status === "not-found" ? (
          <PageNotice title="Local não encontrado" description="Este anúncio não existe ou não está disponível no momento." actionLabel="Voltar para o início" actionHref="/" />
        ) : (
          <PageNotice title="Não foi possível carregar" description="Tente novamente em alguns instantes." actionLabel="Tentar novamente" actionHref={`/imoveis/${propertyId}`} />
        )}
      </>
    );
  }

  const property = result.data;
  const favorites = user ? await getApiData("/favorites/room-ids", favoriteRoomIdsSchema) : undefined;
  const favoriteRoomIds = new Set(favorites?.status === "ok" ? favorites.data.roomIds : []);
  const photos = property.media
    .filter((item) => item.type === "IMAGE")
    .map((item, index) => ({ id: item.id, url: item.url, alt: index === 0 ? `Foto principal de ${property.title}` : `Foto ${index + 1} de ${property.title}` }));
  const videos = property.media.filter((item) => item.type === "VIDEO");
  const lowestPrice = property.rooms.length > 0 ? Math.min(...property.rooms.map((room) => room.priceCents)) : undefined;
  const roomCount = property.rooms.length === 1 ? "1 quarto disponível" : `${property.rooms.length} quartos disponíveis`;

  return (
    <>
      <SiteHeader user={user} />
      {previa === "1" ? (
        <div className="sticky top-16 z-10 border-b border-(--line-strong) bg-(--surface-raised) px-4 py-3 sm:px-6 md:top-18">
          <p className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-sm text-(--gray)">
            <span>Prévia: é assim que os hóspedes veem este anúncio.</span>
            <Link href={`/meus-imoveis/${property.id}`} className="font-semibold text-white underline underline-offset-4 hover:text-(--blue-light)">
              Voltar ao gerenciamento
            </Link>
          </p>
        </div>
      ) : null}
      <main className="px-4 pt-6 pb-28 sm:px-6 md:pt-10 md:pb-16">
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-(--gray) transition-colors hover:text-white">
            <LuArrowLeft aria-hidden="true" size={16} /> Início
          </Link>

          <PropertyPhotoGrid title={property.title} photos={photos} />

          <header className="py-8">
            <p className="text-sm font-semibold text-(--blue-light)">{propertyTypeLabels[property.type]}</p>
            <h1 className="mt-1 wrap-break-word text-3xl font-extrabold tracking-tight text-white">{property.title}</h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-(--gray)">
              <LuMapPin aria-hidden="true" size={16} className="shrink-0" /> {formatLocation(property)}
            </p>
            {lowestPrice !== undefined ? (
              <a
                href="#quartos"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-(--line-strong) bg-(--surface) px-4 text-sm text-white transition-colors hover:border-(--blue-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light)"
              >
                <span className="font-semibold">{roomCount}</span>
                <span className="text-(--gray)">· a partir de</span>
                <span className="font-bold">{formatCents(lowestPrice)}</span>
                <span className="text-(--gray)">/ diária</span>
                <LuArrowDown aria-hidden="true" size={16} className="text-(--blue-light)" />
              </a>
            ) : null}
          </header>

          <section id="quartos" aria-labelledby="rooms-title" className="scroll-mt-24 border-t border-(--line) py-8">
            <h2 id="rooms-title" className="text-2xl font-extrabold tracking-tight text-white">Quartos disponíveis</h2>
            <p className="mt-1 text-sm text-(--gray)">Cada quarto tem preço e disponibilidade próprios.</p>
            <ul className="mt-5 flex flex-col gap-5">
              {property.rooms.map((room, roomIndex) => {
                const roomPhotos = room.media
                  .filter((item) => item.type === "IMAGE")
                  .map((item, index) => ({ id: item.id, url: item.url, alt: index === 0 ? `Foto de ${room.title}` : `Foto ${index + 1} de ${room.title}` }));
                return (
                  <li
                    key={room.id}
                    id={`quarto-${room.id}`}
                    className="grid scroll-mt-24 overflow-hidden rounded-2xl border border-(--line-strong) bg-(--surface) target:border-(--blue-light) target:ring-2 target:ring-(--blue-light) md:grid-cols-[18rem_minmax(0,1fr)]"
                  >
                    <RoomCover title={room.title} photos={roomPhotos} eager={roomIndex === 0} className="aspect-4/3 md:aspect-auto md:min-h-56" />
                    <div className="flex flex-col gap-3 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <h3 className="wrap-break-word text-lg font-bold text-white">{room.title}</h3>
                        <p className="text-lg font-extrabold text-white">
                          {formatCents(room.priceCents)} <span className="text-sm font-semibold text-(--gray)">/ diária</span>
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5 text-sm text-(--gray)">
                        <span className="flex items-center gap-2">
                          <LuUsers aria-hidden="true" size={15} className="shrink-0" />
                          {room.capacity === 1 ? "1 pessoa" : `Até ${room.capacity} pessoas`} · Aceita: {room.acceptedAudiences.map((audience) => genderIdentityLabels[audience]).join(", ")}
                        </span>
                        <span className="flex items-center gap-2">
                          <LuBath aria-hidden="true" size={15} className="shrink-0" /> Banheiro {bathroomTypeLabels[room.bathroomType].toLowerCase()}
                        </span>
                      </div>
                      {room.description ? <p className="whitespace-pre-line text-sm leading-relaxed text-(--gray)">{room.description}</p> : null}
                      {room.amenities.length > 0 ? <Chips items={room.amenities.map((amenity) => labelOf(roomAmenityLabels, amenity))} /> : null}
                      <div className="mt-auto pt-2">
                        <FavoriteButton
                          roomId={room.id}
                          roomTitle={room.title}
                          initialFavorited={favoriteRoomIds.has(room.id)}
                          signedIn={Boolean(user)}
                          loginReturnPath={`/imoveis/${property.id}#quarto-${room.id}`}
                          variant="inline"
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {property.description ? (
            <Section title="Sobre o local">
              <p className="whitespace-pre-line">{property.description}</p>
            </Section>
          ) : null}

          {property.features.length > 0 ? (
            <Section title="Características">
              <Chips items={property.features.map((feature) => labelOf(propertyFeatureLabels, feature))} />
            </Section>
          ) : null}

          {property.sharedAreas.length > 0 ? (
            <Section title="Áreas compartilhadas">
              <ul className="grid gap-3 sm:grid-cols-2">
                {property.sharedAreas.map((area, index) => (
                  <li key={`${area.type}-${index}`} className="rounded-xl border border-(--line) bg-(--surface) p-4">
                    <p className="font-semibold text-white">{area.label ?? sharedAreaTypeLabels[area.type]}</p>
                    {area.description ? <p className="mt-1">{area.description}</p> : null}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {videos.length > 0 ? (
            <Section title="Vídeos">
              <div className="grid gap-4 md:grid-cols-2">
                {videos.map((video, index) => (
                  <video key={video.id} src={`${video.url}#t=0.1`} controls preload="metadata" aria-label={`Vídeo ${index + 1} de ${property.title}`} className="aspect-video w-full rounded-xl bg-(--surface-raised)" />
                ))}
              </div>
            </Section>
          ) : null}

          {property.houseRules ? (
            <Section title="Regras da casa">
              <p className="whitespace-pre-line">{property.houseRules}</p>
            </Section>
          ) : null}

          {property.generalInfo ? (
            <Section title="Informações úteis">
              <p className="whitespace-pre-line">{property.generalInfo}</p>
            </Section>
          ) : null}

          <Section title="Localização">
            <p className="flex items-center gap-2 text-white">
              <LuMapPin aria-hidden="true" size={16} className="shrink-0" /> {formatLocation(property)}
            </p>
            {property.referencePoints.length > 0 ? (
              <div className="mt-4">
                <Chips items={property.referencePoints} />
              </div>
            ) : null}
            <p className="mt-4 flex items-center gap-2 text-xs">
              <LuEyeOff aria-hidden="true" size={14} className="shrink-0" /> A localização exata não é exibida publicamente.
            </p>
          </Section>
        </div>
      </main>
    </>
  );
}
