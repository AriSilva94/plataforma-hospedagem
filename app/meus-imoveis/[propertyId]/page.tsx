import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { LuArrowRight, LuBath, LuCircleCheck, LuEye, LuExternalLink, LuPencil, LuPlus, LuUsers } from "react-icons/lu";
import { Chips } from "@/components/chips";
import { CoverImage } from "@/components/owner/cover-image";
import { FeaturedToggle } from "@/components/owner/featured-toggle";
import { OwnerDataNotice } from "@/components/owner/owner-notice";
import { OwnerPage } from "@/components/owner/owner-page";
import { PropertyStatusBadge, RoomStatusBadge } from "@/components/owner/property-status-badge";
import { PropertyStatusActions } from "@/components/owner/property-status-actions";
import { PublishChecklist } from "@/components/owner/publish-checklist";
import { RoomAvailabilityToggle } from "@/components/owner/room-availability-toggle";
import { RoomPriceEditor } from "@/components/owner/room-price-editor";
import { cardClassName, primaryButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { getApiData } from "@/lib/server-api";
import { firstPendingStep, setupStepHref } from "@/lib/setup-steps";
import {
  bathroomTypeLabels,
  formatLocation,
  genderIdentityLabels,
  labelOf,
  propertyDetailSchema,
  propertyFeatureLabels,
  propertyTypeLabels,
  sharedAreaTypeLabels,
  type PropertyDetail,
} from "@/lib/properties";

const DESCRIPTION_PREVIEW_LENGTH = 240;

function InfoCard({ title, editHref, children }: { title: string; editHref: string; children: ReactNode }) {
  return (
    <section className={cardClassName}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-white">{title}</h2>
        <Link
          href={editHref}
          aria-label={`Editar ${title}`}
          className="-mr-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-(--blue-light) transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-(--blue-light)"
        >
          <LuPencil aria-hidden="true" size={14} />
          Editar
        </Link>
      </div>
      <div className="mt-2 text-sm leading-relaxed text-(--gray)">{children}</div>
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

function visibilityNote(property: PropertyDetail, availableCount: number): string | undefined {
  if (property.status === "UNAVAILABLE") return "Imóvel pausado: não aparece na busca até você reativá-lo.";
  if (property.status !== "ACTIVE") return undefined;
  if (availableCount === 0) return "Publicado, mas fora da busca: nenhum quarto está reservável no momento.";
  return `Aparece na busca com ${availableCount} de ${property.rooms.length} ${property.rooms.length === 1 ? "quarto reservável" : "quartos reserváveis"}.`;
}

export default async function PropertyDetailsPage({ params, searchParams }: PageProps<"/meus-imoveis/[propertyId]">) {
  const [{ propertyId }, { publicado }] = await Promise.all([params, searchParams]);
  const result = await getApiData(`/owner/properties/${propertyId}`, propertyDetailSchema);

  if (result.status !== "ok") {
    return <OwnerDataNotice status={result.status} retryHref={`/meus-imoveis/${propertyId}`} />;
  }

  const property = result.data;
  const editHref = (section: string) => `/meus-imoveis/${property.id}/editar?secao=${section}`;
  const images = property.media.filter((item) => item.type === "IMAGE");
  const videoCount = property.media.length - images.length;
  const address = privateAddress(property);
  const availableCount = property.rooms.filter((room) => room.status === "AVAILABLE").length;
  const visible = property.status === "ACTIVE" && availableCount > 0;
  const note = visibilityNote(property, availableCount);
  const description = property.description ?? "";
  const descriptionIsLong = description.length > DESCRIPTION_PREVIEW_LENGTH;

  return (
    <OwnerPage
      title={property.title}
      eyebrow={<PropertyStatusBadge status={property.status} />}
      description={propertyTypeLabels[property.type]}
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
            <PropertyStatusActions propertyId={property.id} status={property.status} canPublish={property.missingRequirements.length === 0} />
          </div>
        </div>
      }
    >
      {note ? (
        <p className="mt-6 flex items-start gap-3 rounded-2xl border border-(--line-strong) bg-(--surface-raised) p-4 text-sm leading-relaxed text-(--gray)">
          <LuEye aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-(--blue-light)" />
          {note}
        </p>
      ) : null}

      {property.status === "ACTIVE" && publicado === "1" ? (
        <section
          aria-labelledby="published-heading"
          className="mt-6 flex flex-col gap-4 rounded-2xl border border-[rgba(47,191,135,.38)] bg-[rgba(47,191,135,.1)] p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <LuCircleCheck aria-hidden="true" size={24} className="mt-0.5 shrink-0 text-(--success)" />
            <div>
              <h2 id="published-heading" className="text-lg font-bold text-white">Imóvel publicado</h2>
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
        <div className="mt-6 flex flex-col gap-4">
          <PublishChecklist propertyId={property.id} missing={property.missingRequirements} />
          <div>
            <Link href={setupStepHref(property.id, firstPendingStep(property.missingRequirements))} className={primaryButtonClassName}>
              Continuar cadastro
              <LuArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <FeaturedToggle propertyId={property.id} featured={property.featured} visible={visible} />
        </div>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <InfoCard title="Sobre o imóvel" editHref={editHref("geral")}>
          <p className="line-clamp-4 whitespace-pre-line">{description || "Sem descrição."}</p>
          {descriptionIsLong ? (
            <Link href={editHref("geral")} className="mt-1 inline-block font-semibold text-(--blue-light) underline-offset-4 hover:underline">
              Ver tudo
            </Link>
          ) : null}
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
            <span className="font-semibold text-white">Só você vê: </span>
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
            <p>Nenhuma área cadastrada. Opcional.</p>
          )}
        </InfoCard>

        <InfoCard title="Fotos e vídeos" editHref={editHref("midia")}>
          <p>
            {images.length === 1 ? "1 foto" : `${images.length} fotos`} · {videoCount === 1 ? "1 vídeo" : `${videoCount} vídeos`}
          </p>
          {images.length > 0 ? (
            <ul className="mt-3 flex gap-2">
              {images.slice(0, 4).map((image, index) => (
                <li key={image.id} className="relative size-16 overflow-hidden rounded-lg bg-(--surface-raised)">
                  <Image src={image.url} alt={index === 0 ? "Foto de capa" : `Foto ${index + 1}`} fill unoptimized sizes="64px" className="object-cover" />
                  {index === 0 ? (
                    <span className="absolute inset-x-0 bottom-0 bg-(--blue)/90 py-0.5 text-center text-[11px] font-bold text-white">Capa</span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </InfoCard>
      </div>

      <section aria-labelledby="rooms-heading" className="mt-10">
        <div className="flex flex-col gap-3 border-b border-(--line) pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="rooms-heading" className="text-xl font-bold text-white">Quartos</h2>
            <p className="mt-1 text-sm text-(--gray)">Pause, ajuste o valor ou abra o quarto para editar os detalhes e as fotos.</p>
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
              <li key={room.id} className="flex flex-col overflow-hidden rounded-2xl border border-(--line-strong) bg-(--surface)">
                <Link
                  href={`/meus-imoveis/${property.id}/quartos/${room.id}`}
                  className="group flex flex-1 flex-col transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--blue-light)"
                >
                  <CoverImage url={room.coverUrl} alt="" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                  <div className="flex flex-1 flex-col gap-3 p-5 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 wrap-break-word font-bold text-white group-hover:text-(--blue-light)">{room.title}</h3>
                      <RoomStatusBadge status={room.status} />
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-(--gray)">
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
                <div className="flex flex-col gap-3 border-t border-(--line) px-5 py-3">
                  <RoomPriceEditor roomId={room.id} roomTitle={room.title} priceCents={room.priceCents} />
                  {room.status === "INACTIVE" ? (
                    <p className="text-xs text-(--gray)">Arquivado. Abra o quarto para reativá-lo.</p>
                  ) : (
                    <RoomAvailabilityToggle
                      key={room.status}
                      roomId={room.id}
                      roomTitle={room.title}
                      status={room.status}
                      warnBeforePause={property.status === "ACTIVE" && room.status === "AVAILABLE" && availableCount === 1}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </OwnerPage>
  );
}
