import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { LuArrowDown, LuArrowLeft, LuMapPin } from "react-icons/lu";
import { Chips } from "@/components/chips";
import { FavoriteButton } from "@/components/favorite-button";
import { PropertyTypeTag } from "@/components/property-type-tag";
import { PropertyPhotoGrid } from "@/components/property-gallery";
import { PublicLocation, PublicPropertyLoadNotice } from "@/components/public-property-parts";
import { RoomCard } from "@/components/room-card";
import { SiteHeader } from "@/components/site-header";
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

  return (
    <>
      <SiteHeader user={user} />
      {previa === "1" ? (
        <div className="sticky top-16 z-10 border-b border-(--border) bg-(--surface-raised) px-4 py-3 sm:px-6 md:top-18">
          <p className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-sm text-(--text-secondary)">
            <span>Prévia: é assim que os hóspedes veem este anúncio.</span>
            <Link href={`/meus-imoveis/${property.id}`} className="font-semibold text-(--text-primary) underline underline-offset-4 hover:text-(--primary-text)">
              Voltar ao gerenciamento
            </Link>
          </p>
        </div>
      ) : null}
      <main className="px-4 pt-6 pb-28 sm:px-6 md:pt-10 md:pb-16">
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-(--text-secondary) transition-colors hover:text-(--text-primary)">
            <LuArrowLeft aria-hidden="true" size={16} /> Início
          </Link>

          <PropertyPhotoGrid title={property.title} photos={photos} />

          <header className="py-8">
            <PropertyTypeTag type={property.type} />
            <h1 className="mt-2 wrap-break-word text-3xl font-extrabold tracking-tight text-(--text-primary)">{property.title}</h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-(--text-secondary)">
              <LuMapPin aria-hidden="true" size={16} className="shrink-0" /> {formatLocation(property)}
            </p>
            {lowestPrice !== undefined ? (
              <a
                href="#quartos"
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-2xl border border-(--border-strong) bg-(--surface) px-4 text-sm text-(--text-primary) transition-colors hover:border-(--primary-border) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
              >
                <span className="font-semibold">{roomCount}</span>
                <span className="text-(--text-secondary)">· a partir de</span>
                <span className="font-bold">{formatCents(lowestPrice)}</span>
                <span className="text-(--text-secondary)">/ diária</span>
                <LuArrowDown aria-hidden="true" size={16} className="text-(--primary-text)" />
              </a>
            ) : null}
          </header>

          <section id="quartos" aria-labelledby="rooms-title" className="scroll-mt-24 border-t border-(--border) py-8">
            <h2 id="rooms-title" className="text-2xl font-extrabold tracking-tight text-(--text-primary)">Quartos disponíveis</h2>
            <p className="mt-1 text-sm text-(--text-secondary)">Cada quarto tem preço e disponibilidade próprios.</p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {property.rooms.map((room) => (
                <li key={room.id}>
                  <RoomCard
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
                  <li key={`${area.type}-${index}`} className="rounded-xl border border-(--border) bg-(--surface) p-4">
                    <p className="font-semibold text-(--text-primary)">{area.label ?? sharedAreaTypeLabels[area.type]}</p>
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
            <PublicLocation property={property} />
          </Section>
        </div>
      </main>
    </>
  );
}
