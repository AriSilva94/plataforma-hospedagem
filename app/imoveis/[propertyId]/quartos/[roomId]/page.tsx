import type { Metadata } from "next";
import Link from "next/link";
import type { IconType } from "react-icons";
import { FaWhatsapp } from "react-icons/fa6";
import { LuArrowLeft, LuBath, LuCalendarDays, LuFlag, LuMegaphone, LuTag, LuTriangleAlert, LuUsers } from "react-icons/lu";
import { FavoriteButton } from "@/components/favorite-button";
import { HostCard } from "@/components/host-card";
import { IconList } from "@/components/icon-list";
import { PageNotice } from "@/components/page-notice";
import { PropertyPhotoGrid } from "@/components/property-gallery";
import { PublicLocation, PublicPropertyLoadNotice } from "@/components/public-property-parts";
import { SiteHeader } from "@/components/site-header";
import { iconOf, propertyFeatureIcons, roomAmenityIcons, sharedAreaTypeIcons } from "@/lib/amenity-icons";
import { getCurrentUser } from "@/lib/current-user";
import {
  bathroomTypeLabels,
  formatCents,
  formatLocation,
  genderIdentityLabels,
  isMotel,
  labelOf,
  propertyFeatureLabels,
  publicPropertyDetailSchema,
  roomAmenityLabels,
  sharedAreaTypeLabels,
} from "@/lib/properties";
import { getFavoriteRoomIds } from "@/lib/room-listings";
import { getApiData } from "@/lib/server-api";

const SUPPORT_EMAIL = "contato@domusx.com.br";
const WHATSAPP_PLACEHOLDER_NUMBER = "5500000000000";

function StatBox({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-(--border) bg-(--surface) p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-(--primary-soft) text-(--primary-text)">
        <Icon aria-hidden="true" size={18} />
      </span>
      <div>
        <p className="text-xs font-semibold tracking-wide text-(--text-secondary) uppercase">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-(--text-primary)">{value}</p>
      </div>
    </div>
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

export default async function PublicRoomPage({ params }: PageProps<"/imoveis/[propertyId]/quartos/[roomId]">) {
  const { propertyId, roomId } = await params;
  const [{ user }, result] = await Promise.all([getCurrentUser(), getApiData(`/properties/${propertyId}`, publicPropertyDetailSchema)]);

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
        <PageNotice title="Quarto não encontrado" description="Este quarto não existe ou não está disponível no momento." actionLabel="Ver imóvel" actionHref={`/imoveis/${property.id}`} />
      </>
    );
  }

  const favoriteRoomIds = new Set(await getFavoriteRoomIds(Boolean(user)));
  const roomPhotos = room.media
    .filter((item) => item.type === "IMAGE")
    .map((item, index) => ({ id: item.id, url: item.url, alt: index === 0 ? `Foto principal de ${room.title}` : `Foto ${index + 1} de ${room.title}` }));
  const hasPropertyContext = Boolean(property.description) || property.features.length > 0 || property.sharedAreas.length > 0;
  const highlights = room.amenities.slice(0, 2).map((amenity) => ({ icon: iconOf(roomAmenityIcons, amenity), label: labelOf(roomAmenityLabels, amenity) }));
  const whatsappHref = `https://wa.me/${WHATSAPP_PLACEHOLDER_NUMBER}?text=${encodeURIComponent(`Olá! Tenho interesse no ${room.title}, em ${formatLocation(property)}.`)}`;
  const reportMailHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Anúncio inativo: ${room.title}`)}&body=${encodeURIComponent(`Quarto: ${room.title}\nImóvel: ${property.title}\nLink: /imoveis/${property.id}/quartos/${room.id}`)}`;

  return (
    <>
      <SiteHeader user={user} />
      <main className="px-4 pt-6 pb-28 sm:px-6 md:pt-10 md:pb-16">
        <div className="mx-auto max-w-6xl">
          <Link href={`/imoveis/${property.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-(--text-secondary) transition-colors hover:text-(--text-primary)">
            <LuArrowLeft aria-hidden="true" size={16} /> {property.title}
          </Link>

          <PropertyPhotoGrid title={room.title} photos={roomPhotos} />

          <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
            <div>
              <HostCard
                hostId={property.host.id}
                hostName={property.host.name}
                verified={room.verified}
                motel={isMotel(property.type)}
                roomTitle={room.title}
                location={formatLocation(property)}
                highlights={highlights}
              />

              <section className="border-t border-(--border) py-8">
                <h2 className="text-lg font-bold text-(--text-primary)">Detalhes da acomodação</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <StatBox icon={LuUsers} label="Capacidade" value={room.capacity === 1 ? "1 pessoa" : `Até ${room.capacity} pessoas`} />
                  <StatBox icon={LuTag} label="Público" value={room.acceptedAudiences.map((audience) => genderIdentityLabels[audience]).join(", ")} />
                  <StatBox icon={LuBath} label="Banheiro" value={bathroomTypeLabels[room.bathroomType]} />
                </div>

                {room.description ? (
                  <div className="mt-6">
                    <p className="mb-2 text-sm font-semibold text-(--text-primary)">Sobre este quarto</p>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-(--text-secondary)">{room.description}</p>
                  </div>
                ) : null}
                {room.additionalInfo ? <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-(--text-secondary)">{room.additionalInfo}</p> : null}

                {room.amenities.length > 0 ? (
                  <div className="mt-6">
                    <p className="mb-3 text-sm font-semibold text-(--text-primary)">O que o quarto oferece</p>
                    <IconList items={room.amenities.map((amenity) => ({ icon: iconOf(roomAmenityIcons, amenity), label: labelOf(roomAmenityLabels, amenity) }))} />
                  </div>
                ) : null}

                {hasPropertyContext ? (
                  <details className="mt-6 rounded-2xl border border-(--border) bg-(--surface) p-4 text-sm text-(--text-secondary)">
                    <summary className="cursor-pointer font-semibold text-(--text-primary)">Sobre o imóvel e áreas compartilhadas</summary>
                    <div className="mt-4 flex flex-col gap-4">
                      {property.description ? <p className="whitespace-pre-line leading-relaxed">{property.description}</p> : null}
                      {property.features.length > 0 ? (
                        <IconList items={property.features.map((feature) => ({ icon: iconOf(propertyFeatureIcons, feature), label: labelOf(propertyFeatureLabels, feature) }))} />
                      ) : null}
                      {property.sharedAreas.length > 0 ? (
                        <ul className="grid gap-3 sm:grid-cols-2">
                          {property.sharedAreas.map((area, index) => {
                            const Icon = sharedAreaTypeIcons[area.type];
                            return (
                              <li key={`${area.type}-${index}`} className="flex items-start gap-3 rounded-xl border border-(--border) bg-(--surface-raised) p-4">
                                <Icon aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-(--primary-text)" />
                                <div>
                                  <p className="font-semibold text-(--text-primary)">{area.label ?? sharedAreaTypeLabels[area.type]}</p>
                                  {area.description ? <p className="mt-1">{area.description}</p> : null}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </div>
                  </details>
                ) : null}
              </section>

              <section className="border-t border-(--border) py-8">
                <h2 className="text-lg font-bold text-(--text-primary)">Localização</h2>
                <div className="mt-4">
                  <PublicLocation property={property} />
                </div>
              </section>
            </div>

            <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
              <Link
                href="/meus-imoveis/novo"
                className="flex items-center gap-2 rounded-2xl border border-(--success)/35 bg-(--success-soft) px-4 py-3 text-sm font-semibold text-(--success) transition-colors hover:border-(--success)/60"
              >
                <LuMegaphone aria-hidden="true" size={16} className="shrink-0" /> 100% Gratuito — Anuncie seu espaço
              </Link>

              <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
                <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-(--text-secondary) uppercase">
                  <LuCalendarDays aria-hidden="true" size={14} /> Diária
                </p>
                <p className="mt-1 text-2xl font-extrabold text-(--text-primary)">{formatCents(room.priceCents)}</p>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-(--success)/35 bg-(--success-soft) px-4 text-sm font-bold text-(--success) transition-colors hover:border-(--success)/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                >
                  <FaWhatsapp aria-hidden="true" size={18} /> Falar com anfitrião
                </a>

                <div className="mt-3">
                  <FavoriteButton
                    roomId={room.id}
                    roomTitle={room.title}
                    initialFavorited={favoriteRoomIds.has(room.id)}
                    signedIn={Boolean(user)}
                    loginReturnPath={`/imoveis/${property.id}/quartos/${room.id}`}
                    variant="inline"
                  />
                </div>

                <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-(--text-secondary)">
                  <LuTriangleAlert aria-hidden="true" size={14} className="mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-(--text-primary)">Aviso importante:</strong> a DOMUS X não interfere em negociações, valores ou regras entre você e o anfitrião. A responsabilidade por
                    informações e condutas é exclusiva das partes envolvidas.
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
                <p className="flex items-start gap-2 text-sm text-(--text-secondary)">
                  <LuFlag aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-(--text-primary)">Não obteve resposta?</strong> Notifique-nos. Seu relato é fundamental para identificarmos e removermos anúncios inativos da plataforma.
                  </span>
                </p>
                <a
                  href={reportMailHref}
                  className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-2xl border border-(--error)/35 bg-(--error-soft) px-4 text-sm font-semibold text-(--error) transition-colors hover:border-(--error)/60"
                >
                  <LuFlag aria-hidden="true" size={14} /> Reportar anúncio inativo
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
