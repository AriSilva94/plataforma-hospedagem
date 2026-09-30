import Link from "next/link";
import type { ReactNode } from "react";
import { LuBath, LuPencil, LuPlus, LuUsers } from "react-icons/lu";
import { Chips } from "@/components/chips";
import { CoverImage } from "@/components/owner/cover-image";
import { OwnerDataNotice } from "@/components/owner/owner-notice";
import { OwnerPage } from "@/components/owner/owner-page";
import { PropertyStatusBadge, RoomStatusBadge } from "@/components/owner/property-status-badge";
import { PropertyStatusActions } from "@/components/owner/property-status-actions";
import { cardClassName, primaryButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { getApiData } from "@/lib/server-api";
import {
  bathroomTypeLabels,
  formatCents,
  formatLocation,
  genderIdentityLabels,
  labelOf,
  propertyDetailSchema,
  propertyFeatureLabels,
  propertyTypeLabels,
  sharedAreaTypeLabels,
  type PropertyDetail,
} from "@/lib/properties";

function InfoCard({ title, editHref, children }: { title: string; editHref: string; children: ReactNode }) {
  return (
    <section className={cardClassName}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-white">{title}</h2>
        <Link
          href={editHref}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-(--blue-light) transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-(--blue-light)"
        >
          <LuPencil aria-hidden="true" size={14} />
          Editar
        </Link>
      </div>
      <div className="mt-4 text-sm leading-relaxed text-(--gray)">{children}</div>
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

export default async function PropertyDetailsPage({ params }: PageProps<"/meus-imoveis/[propertyId]">) {
  const { propertyId } = await params;
  const result = await getApiData(`/owner/properties/${propertyId}`, propertyDetailSchema);

  if (result.status !== "ok") {
    return <OwnerDataNotice status={result.status} retryHref={`/meus-imoveis/${propertyId}`} />;
  }

  const property = result.data;
  const editHref = (section: string) => `/meus-imoveis/${property.id}/editar?secao=${section}`;
  const imageCount = property.media.filter((item) => item.type === "IMAGE").length;
  const videoCount = property.media.length - imageCount;
  const address = privateAddress(property);

  return (
    <OwnerPage
      title={property.title}
      eyebrow={<PropertyStatusBadge status={property.status} />}
      description={propertyTypeLabels[property.type]}
      back={{ href: "/meus-imoveis", label: "Meus imóveis" }}
      actions={<PropertyStatusActions propertyId={property.id} status={property.status} />}
    >
      {property.status === "DRAFT" ? (
        <p className="mt-6 rounded-2xl border border-(--line-strong) bg-(--surface-raised) p-4 text-sm leading-relaxed text-(--gray)">
          Para publicar, o imóvel precisa de descrição, endereço completo, ao menos uma foto e ao menos um quarto que não esteja inativo.
        </p>
      ) : null}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <InfoCard title="Informações gerais" editHref={editHref("geral")}>
          <p className="line-clamp-4 whitespace-pre-line">{property.description ?? "Sem descrição."}</p>
          {property.features.length > 0 ? (
            <div className="mt-4">
              <Chips items={property.features.map((feature) => labelOf(propertyFeatureLabels, feature))} />
            </div>
          ) : null}
        </InfoCard>

        <InfoCard title="Localização" editHref={editHref("localizacao")}>
          <p>
            <span className="font-semibold text-white">Pública: </span>
            {formatLocation(property)}
          </p>
          <p className="mt-2">
            <span className="font-semibold text-white">Privada: </span>
            {address ?? "Endereço não informado."}
          </p>
          {property.referencePoints.length > 0 ? (
            <div className="mt-4">
              <Chips items={property.referencePoints} />
            </div>
          ) : null}
        </InfoCard>

        <InfoCard title="Áreas compartilhadas" editHref={editHref("areas")}>
          {property.sharedAreas.length > 0 ? (
            <Chips items={property.sharedAreas.map((area) => area.label ?? sharedAreaTypeLabels[area.type])} />
          ) : (
            <p>Nenhuma área cadastrada.</p>
          )}
        </InfoCard>

        <InfoCard title="Fotos e vídeos" editHref={editHref("midia")}>
          <p>
            {imageCount === 1 ? "1 foto" : `${imageCount} fotos`} · {videoCount === 1 ? "1 vídeo" : `${videoCount} vídeos`}
          </p>
        </InfoCard>
      </div>

      <section aria-labelledby="rooms-heading" className="mt-10">
        <div className="flex flex-col gap-3 border-b border-(--line) pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="rooms-heading" className="text-xl font-bold text-white">Quartos</h2>
            <p className="mt-1 text-sm text-(--gray)">Cada quarto tem preço, características, fotos e status próprios.</p>
          </div>
          <Link href={`/meus-imoveis/${property.id}/quartos/novo`} className={property.rooms.length > 0 ? secondaryButtonClassName : primaryButtonClassName}>
            <LuPlus aria-hidden="true" size={17} />
            Adicionar quarto
          </Link>
        </div>

        {property.rooms.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-(--line-strong) p-6 text-sm text-(--gray)">
            Nenhum quarto cadastrado. Adicione os quartos e suítes que poderão ser reservados.
          </p>
        ) : (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {property.rooms.map((room) => (
              <li key={room.id}>
                <Link
                  href={`/meus-imoveis/${property.id}/quartos/${room.id}`}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-(--line-strong) bg-(--surface) transition-colors hover:border-(--blue-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light)"
                >
                  <CoverImage url={room.coverUrl} alt="" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 wrap-break-word font-bold text-white">{room.title}</h3>
                      <RoomStatusBadge status={room.status} />
                    </div>
                    <p className="text-lg font-extrabold text-white">
                      {formatCents(room.priceCents)} <span className="text-sm font-semibold text-(--gray)">/ diária</span>
                    </p>
                    <div className="mt-auto flex flex-col gap-2 border-t border-(--line) pt-3 text-sm text-(--gray)">
                      <span className="flex items-center gap-2">
                        <LuUsers aria-hidden="true" size={15} className="shrink-0" />
                        {room.capacity === 1 ? "1 pessoa" : `${room.capacity} pessoas`} · {room.acceptedAudiences.map((audience) => genderIdentityLabels[audience]).join(", ")}
                      </span>
                      <span className="flex items-center gap-2">
                        <LuBath aria-hidden="true" size={15} className="shrink-0" />
                        Banheiro {bathroomTypeLabels[room.bathroomType].toLowerCase()}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </OwnerPage>
  );
}
