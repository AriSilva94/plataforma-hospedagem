import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { LuArrowDown, LuArrowLeft, LuBedDouble } from "react-icons/lu";
import { FavoriteButton } from "@/components/favorite-button";
import { HostCard } from "@/components/host-card";
import { IconList } from "@/components/icon-list";
import { PropertyPhotoGrid } from "@/components/property-gallery";
import { OwnerPreviewBanner, PublicListingAside, PublicLocation, PublicPropertyLoadNotice } from "@/components/public-property-parts";
import { RoomCard } from "@/components/room-card";
import { SiteHeader } from "@/components/site-header";
import { iconOf, propertyFeatureIcons, sharedAreaTypeIcons } from "@/lib/amenity-icons";
import { getCurrentUser } from "@/lib/current-user";
import { formatCents, formatLocation, labelOf, propertyFeatureLabels, publicPropertyDetailSchema, sharedAreaTypeLabels } from "@/lib/properties";
import { getFavoriteRoomIds } from "@/lib/room-listings";
import { getApiData } from "@/lib/server-api";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-(--border) py-8">
      <h2 className="text-lg font-bold text-(--text-primary)">{title}</h2>
      <div className="mt-4 text-sm leading-relaxed text-(--text-secondary)">{children}</div>
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
  const preview = previa === "1";
  const [{ user }, result] = await Promise.all([
    getCurrentUser(),
    getApiData(`/properties/${propertyId}`, publicPropertyDetailSchema),
  ]);

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
  const photos = property.media
    .filter((item) => item.type === "IMAGE")
    .map((item, index) => ({ id: item.id, url: item.url, alt: index === 0 ? `Foto principal de ${property.title}` : `Foto ${index + 1} de ${property.title}` }));
  const videos = property.media.filter((item) => item.type === "VIDEO");
  const lowestPrice = property.rooms.length > 0 ? Math.min(...property.rooms.map((room) => room.priceCents)) : undefined;
  const roomCount = property.rooms.length === 1 ? "1 quarto disponível" : `${property.rooms.length} quartos disponíveis`;
  const highlights = property.features.slice(0, 2).map((feature) => ({
    icon: iconOf(propertyFeatureIcons, feature),
    label: labelOf(propertyFeatureLabels, feature),
  }));

  return (
    <>
      <SiteHeader user={user} />
      {preview ? <OwnerPreviewBanner propertyId={property.id} /> : null}
      <main className="px-4 pt-6 pb-28 sm:px-6 md:pt-10 md:pb-16">
        <div className="mx-auto max-w-6xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-(--text-secondary) transition-colors hover:text-(--text-primary)">
            <LuArrowLeft aria-hidden="true" size={16} /> Início
          </Link>

          <PropertyPhotoGrid title={property.title} photos={photos} />

          <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
            <div className="min-w-0">
              <HostCard
                hostId={property.host.id}
                hostName={property.host.name}
                verified={false}
                propertyType={property.type}
                roomTitle={property.title}
                location={formatLocation(property)}
                highlights={highlights}
              />

              <section id="quartos" aria-labelledby="rooms-title" className="scroll-mt-28 border-t border-(--border) py-8">
                <h2 id="rooms-title" className="text-lg font-bold text-(--text-primary)">
                  Quartos disponíveis
                </h2>
                <p className="mt-1 text-sm text-(--text-secondary)">Cada quarto tem preço e disponibilidade próprios.</p>
                {property.rooms.length > 0 ? (
                  <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                    {property.rooms.map((room) => (
                      <li key={room.id}>
                        <RoomCard
                          href={`/imoveis/${property.id}/quartos/${room.id}${preview ? "?previa=1" : ""}`}
                          room={{
                            id: room.id,
                            title: room.title,
                            priceCents: room.priceCents,
                            featured: false,
                            verified: room.verified,
                            coverUrl: room.media.find((item) => item.type === "IMAGE")?.url ?? null,
                            property: { id: property.id, title: property.title, type: property.type, neighborhood: property.neighborhood, city: property.city, state: property.state },
                          }}
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
                  <p className="mt-4 rounded-2xl border border-dashed border-(--border) p-6 text-sm text-(--text-secondary)">
                    Nenhum quarto disponível no momento.
                  </p>
                )}
              </section>

              {property.description || property.features.length > 0 ? (
                <Section title="Sobre o local">
                  {property.description ? <p className="whitespace-pre-line">{property.description}</p> : null}
                  {property.features.length > 0 ? (
                    <div className={property.description ? "mt-6" : undefined}>
                      <p className="mb-3 text-sm font-semibold text-(--text-primary)">O que o local oferece</p>
                      <IconList
                        items={property.features.map((feature) => ({
                          icon: iconOf(propertyFeatureIcons, feature),
                          label: labelOf(propertyFeatureLabels, feature),
                        }))}
                      />
                    </div>
                  ) : null}
                </Section>
              ) : null}

              {property.sharedAreas.length > 0 ? (
                <Section title="Áreas compartilhadas">
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {property.sharedAreas.map((area, index) => {
                      const Icon = sharedAreaTypeIcons[area.type];
                      return (
                        <li key={`${area.type}-${index}`} className="flex items-start gap-3 rounded-xl border border-(--border) bg-(--surface) p-4">
                          <Icon aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-(--primary-text)" />
                          <div>
                            <p className="font-semibold text-(--text-primary)">{area.label ?? sharedAreaTypeLabels[area.type]}</p>
                            {area.description ? <p className="mt-1">{area.description}</p> : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </Section>
              ) : null}

              {videos.length > 0 ? (
                <Section title="Vídeos">
                  <div className="grid gap-4 md:grid-cols-2">
                    {videos.map((video, index) => (
                      <video
                        key={video.id}
                        src={`${video.url}#t=0.1`}
                        controls
                        preload="metadata"
                        aria-label={`Vídeo ${index + 1} de ${property.title}`}
                        className="aspect-video w-full rounded-xl bg-(--surface-raised)"
                      />
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
                <PublicLocation property={property} />
              </Section>
            </div>

            <PublicListingAside preview={preview}>
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
