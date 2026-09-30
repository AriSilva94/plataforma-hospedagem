import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { LuArrowLeft, LuBath, LuEyeOff, LuImage, LuMapPin, LuUsers } from "react-icons/lu";
import { Chips } from "@/components/chips";
import { PageNotice } from "@/components/page-notice";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/current-user";
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
  type Media,
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

function Photo({ media, alt, sizes, className, eager }: { media?: Media; alt: string; sizes: string; className: string; eager?: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-(--surface-raised) ${className}`}>
      {media ? (
        <Image src={media.url} alt={alt} fill unoptimized loading={eager ? "eager" : undefined} sizes={sizes} className="object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center text-(--gray)">
          <LuImage aria-hidden="true" size={28} />
        </div>
      )}
    </div>
  );
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
  const images = property.media.filter((item) => item.type === "IMAGE");
  const videos = property.media.filter((item) => item.type === "VIDEO");
  const [cover, ...otherImages] = images;

  return (
    <>
      <SiteHeader user={user} />
      {previa === "1" ? (
        <div className="border-b border-(--line-strong) bg-(--surface-raised) px-4 py-3 sm:px-6">
          <p className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-sm text-(--gray)">
            <span>Prévia: é assim que os hóspedes veem este anúncio.</span>
            <Link href={`/meus-imoveis/${property.id}`} className="font-semibold text-(--blue-light) underline-offset-4 hover:underline">
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

          <div className={`mt-4 grid gap-2 overflow-hidden rounded-2xl ${otherImages.length > 0 ? "md:grid-cols-4 md:grid-rows-2" : ""}`}>
            <Photo
              media={cover}
              eager
              alt={`Foto principal de ${property.title}`}
              sizes={otherImages.length > 0 ? "(min-width: 768px) 50vw, 100vw" : "100vw"}
              className={otherImages.length > 0 ? "aspect-4/3 md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-96" : "aspect-4/3 md:aspect-21/9"}
            />
            {otherImages.slice(0, 4).map((image, index) => (
              <Photo key={image.id} media={image} alt={`Foto ${index + 2} de ${property.title}`} sizes="25vw" className="hidden aspect-4/3 md:block" />
            ))}
          </div>
          {otherImages.length > 0 ? (
            <ul className="mt-2 flex gap-2 overflow-x-auto md:hidden">
              {otherImages.map((image, index) => (
                <li key={image.id} className="w-32 shrink-0">
                  <Photo media={image} alt={`Foto ${index + 2} de ${property.title}`} sizes="128px" className="aspect-4/3 rounded-xl" />
                </li>
              ))}
            </ul>
          ) : null}

          <header className="py-8">
            <p className="text-sm font-semibold text-(--blue-light)">{propertyTypeLabels[property.type]}</p>
            <h1 className="mt-1 wrap-break-word text-3xl font-extrabold tracking-tight text-white">{property.title}</h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-(--gray)">
              <LuMapPin aria-hidden="true" size={16} className="shrink-0" /> {formatLocation(property)}
            </p>
          </header>

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

          <section aria-labelledby="rooms-title" className="border-t border-(--line) py-8">
            <h2 id="rooms-title" className="text-lg font-bold text-white">Quartos disponíveis</h2>
            <ul className="mt-5 flex flex-col gap-5">
              {property.rooms.map((room) => {
                const roomImages = room.media.filter((item) => item.type === "IMAGE");
                return (
                  <li key={room.id} className="grid overflow-hidden rounded-2xl border border-(--line-strong) bg-(--surface) md:grid-cols-[18rem_minmax(0,1fr)]">
                    <Photo media={roomImages[0]} alt={`Foto de ${room.title}`} sizes="(min-width: 768px) 288px, 100vw" className="aspect-4/3 md:aspect-auto md:min-h-56" />
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
                      {roomImages.length > 1 ? (
                        <ul className="flex gap-2 overflow-x-auto pt-1">
                          {roomImages.slice(1).map((image, index) => (
                            <li key={image.id} className="w-24 shrink-0">
                              <Photo media={image} alt={`Foto ${index + 2} de ${room.title}`} sizes="96px" className="aspect-4/3 rounded-lg" />
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {videos.length > 0 ? (
            <Section title="Vídeos">
              <div className="grid gap-4 md:grid-cols-2">
                {videos.map((video, index) => (
                  <video key={video.id} src={video.url} controls preload="metadata" aria-label={`Vídeo ${index + 1} de ${property.title}`} className="aspect-video w-full rounded-xl bg-(--surface-raised)" />
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
