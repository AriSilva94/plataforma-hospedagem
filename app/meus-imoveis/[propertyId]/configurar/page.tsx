import Link from "next/link";
import { redirect } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";
import { MediaGallery } from "@/components/owner/media-gallery";
import { OwnerDataNotice } from "@/components/owner/owner-notice";
import { OwnerPage } from "@/components/owner/owner-page";
import { PropertySetupForm } from "@/components/owner/property-setup-form";
import { PropertyStatusActions } from "@/components/owner/property-status-actions";
import { PublishChecklist } from "@/components/owner/publish-checklist";
import { RoomsSetup } from "@/components/owner/rooms-setup";
import { SetupSteps } from "@/components/owner/setup-steps";
import { primaryButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { getApiData } from "@/lib/server-api";
import { bedsSummary, formatCents, propertyDetailSchema, roomDetailSchema } from "@/lib/properties";
import { firstPendingStep, parseRoomCount, parseSetupStep, setupStepHref, setupSteps, type SetupStepId } from "@/lib/setup-steps";

const stepCopy: Record<SetupStepId, { title: string; description: string }> = {
  imovel: {
    title: "Sobre o imóvel",
    description: "Conte o essencial e informe o endereço. O endereço completo é privado: no anúncio aparecem apenas bairro, cidade e UF.",
  },
  fotos: {
    title: "Fotos e vídeos do imóvel",
    description: "Mostre as áreas da casa. Adicione ao menos uma foto; a primeira é a capa do anúncio.",
  },
  quartos: {
    title: "Cadastre os quartos",
    description: "Cada quarto é reservado de forma independente, com preço, camas e fotos próprios. Salve cada cartão para registrar o quarto.",
  },
  revisao: {
    title: "Revise e publique",
    description: "Confira os quartos e o que ainda falta. Publicar torna o imóvel visível para hóspedes quando houver um quarto disponível.",
  },
};

export default async function SetupPropertyPage({ params, searchParams }: PageProps<"/meus-imoveis/[propertyId]/configurar">) {
  const [{ propertyId }, { passo, quartos }] = await Promise.all([params, searchParams]);
  const result = await getApiData(`/owner/properties/${propertyId}`, propertyDetailSchema);

  if (result.status !== "ok") {
    return <OwnerDataNotice status={result.status} retryHref={`/meus-imoveis/${propertyId}/configurar`} />;
  }

  const property = result.data;
  if (property.status !== "DRAFT") redirect(`/meus-imoveis/${property.id}`);

  const step = parseSetupStep(passo) ?? firstPendingStep(property.missingRequirements);
  const index = setupSteps.findIndex((item) => item.id === step);
  const previous = setupSteps[index - 1];
  const next = setupSteps[index + 1];
  const roomCount = parseRoomCount(quartos);
  const nextHref = next ? setupStepHref(property.id, next.id, roomCount) : undefined;
  const previousHref = previous ? setupStepHref(property.id, previous.id, roomCount) : undefined;
  const { title, description } = stepCopy[step];
  const roomResults =
    step === "quartos" || step === "revisao"
      ? await Promise.all(property.rooms.map((room) => getApiData(`/owner/rooms/${room.id}`, roomDetailSchema)))
      : [];
  const failedRoom = roomResults.find((room) => room.status !== "ok");
  const rooms = roomResults.flatMap((room) => (room.status === "ok" ? [room.data] : []));

  if (failedRoom) {
    return <OwnerDataNotice status={failedRoom.status} retryHref={setupStepHref(property.id, step, roomCount)} />;
  }

  const emptyCount = Math.max((roomCount ?? (rooms.length === 0 ? 1 : 0)) - rooms.length, 0);

  return (
    <OwnerPage
      title={title}
      description={description}
      back={{ href: `/meus-imoveis/${property.id}`, label: property.title }}
    >
      <SetupSteps current={step} propertyId={property.id} missing={property.missingRequirements} roomCount={roomCount} />

      {step === "imovel" ? <PropertySetupForm key={property.id} property={property} roomCount={roomCount} /> : null}

      {step === "fotos" ? (
        <div className="py-8">
          <MediaGallery label="Fotos do imóvel" basePath={`/owner/properties/${property.id}`} initialMedia={property.media} allowVideo maxImages={30} maxVideos={3} />
        </div>
      ) : null}

      {step === "quartos" ? (
        <RoomsSetup
          propertyId={property.id}
          rooms={rooms}
          emptyCount={emptyCount}
          reviewHref={setupStepHref(property.id, "revisao", roomCount)}
        />
      ) : null}

      {step === "revisao" ? (
        <div className="flex flex-col gap-6 py-8">
          <section aria-labelledby="review-rooms-heading" className="flex flex-col gap-3">
            <h2 id="review-rooms-heading" className="text-lg font-bold text-(--text-primary)">
              Quartos
            </h2>
            {rooms.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {rooms.map((room) => (
                  <li key={room.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl border border-(--border) bg-(--surface) p-4">
                    <div className="min-w-0">
                      <p className="wrap-break-word font-bold text-(--text-primary)">{room.title}</p>
                      <p className="text-sm text-(--text-secondary)">
                        {[room.beds.length > 0 ? bedsSummary(room.beds) : null, room.media.length === 1 ? "1 foto" : `${room.media.length} fotos`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-(--text-secondary)">{formatCents(room.priceCents)} / diária</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-(--text-secondary)">Nenhum quarto salvo ainda.</p>
            )}
          </section>
          <PublishChecklist propertyId={property.id} missing={property.missingRequirements} />
          <p className="text-sm leading-relaxed text-(--text-secondary)">
            Opcional: cadastre as{" "}
            <Link
              href={`/meus-imoveis/${property.id}/editar?secao=areas`}
              className="font-semibold text-(--primary-text) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-(--focus-ring)"
            >
              áreas compartilhadas
            </Link>{" "}
            e as fotos de cada quarto antes de publicar. Você pode publicar agora e editar depois.
          </p>
          <PropertyStatusActions propertyId={property.id} status={property.status} canPublish={property.missingRequirements.length === 0} inline />
        </div>
      ) : null}

      {step === "imovel" ? null : (
        <div className="flex flex-wrap items-center gap-3 border-t border-(--border) pt-6 pb-4">
          {previousHref ? (
            <Link href={previousHref} className={secondaryButtonClassName}>
              <LuArrowLeft aria-hidden="true" size={16} />
              Voltar
            </Link>
          ) : null}
          {step === "fotos" && nextHref ? (
            <Link href={nextHref} className={primaryButtonClassName}>
              Continuar
            </Link>
          ) : null}
        </div>
      )}
    </OwnerPage>
  );
}
