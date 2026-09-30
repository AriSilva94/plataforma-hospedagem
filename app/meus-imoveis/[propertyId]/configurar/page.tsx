import Link from "next/link";
import { redirect } from "next/navigation";
import { LuArrowLeft, LuPlus } from "react-icons/lu";
import { MediaGallery } from "@/components/owner/media-gallery";
import { OwnerDataNotice } from "@/components/owner/owner-notice";
import { OwnerPage } from "@/components/owner/owner-page";
import { PropertyGeneralForm } from "@/components/owner/property-general-form";
import { PropertyLocationForm } from "@/components/owner/property-location-form";
import { PropertyStatusActions } from "@/components/owner/property-status-actions";
import { PublishChecklist } from "@/components/owner/publish-checklist";
import { RoomForm } from "@/components/owner/room-form";
import { SetupSteps } from "@/components/owner/setup-steps";
import { primaryButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { getApiData } from "@/lib/server-api";
import { formatCents, propertyDetailSchema } from "@/lib/properties";
import { firstPendingStep, parseSetupStep, setupStepHref, setupSteps, type SetupStepId } from "@/lib/setup-steps";

const stepCopy: Record<SetupStepId, { title: string; description: string }> = {
  basico: {
    title: "Informações básicas",
    description: "Conte o essencial sobre o imóvel. Os detalhes opcionais podem ficar para depois.",
  },
  endereco: {
    title: "Onde fica o imóvel?",
    description: "O endereço completo é privado. No anúncio público aparecem apenas bairro, cidade e UF.",
  },
  fotos: {
    title: "Fotos e vídeos do imóvel",
    description: "Adicione ao menos uma foto. A primeira foto é a capa do anúncio.",
  },
  quarto: {
    title: "Adicione o primeiro quarto",
    description: "Cada quarto é reservado de forma independente, com preço e público próprios. Você poderá adicionar outros depois.",
  },
  revisao: {
    title: "Revise e publique",
    description: "Confira o que falta. Publicar torna o imóvel visível para hóspedes quando houver um quarto disponível.",
  },
};

export default async function SetupPropertyPage({ params, searchParams }: PageProps<"/meus-imoveis/[propertyId]/configurar">) {
  const [{ propertyId }, { passo }] = await Promise.all([params, searchParams]);
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
  const nextHref = next ? setupStepHref(property.id, next.id) : undefined;
  const { title, description } = stepCopy[step];

  return (
    <OwnerPage
      title={title}
      eyebrow={<span className="text-sm font-semibold text-(--gray)">{property.title}</span>}
      description={description}
      back={{ href: `/meus-imoveis/${property.id}`, label: "Detalhes do imóvel" }}
    >
      <SetupSteps current={step} propertyId={property.id} missing={property.missingRequirements} />

      {step === "basico" && nextHref ? <PropertyGeneralForm key={property.id} property={property} guided={{ nextHref }} /> : null}
      {step === "endereco" && nextHref ? <PropertyLocationForm property={property} guided={{ nextHref }} /> : null}

      {step === "fotos" ? (
        <div className="py-8">
          <MediaGallery basePath={`/owner/properties/${property.id}`} initialMedia={property.media} allowVideo maxImages={30} maxVideos={3} />
        </div>
      ) : null}

      {step === "quarto" ? (
        property.rooms.length === 0 && nextHref ? (
          <RoomForm propertyId={property.id} createdHref={nextHref} />
        ) : (
          <div className="flex flex-col gap-4 py-8">
            <ul className="flex flex-col gap-3">
              {property.rooms.map((room) => (
                <li key={room.id} className="flex items-center justify-between gap-4 rounded-2xl border border-(--line-strong) bg-(--surface) p-4">
                  <Link
                    href={`/meus-imoveis/${property.id}/quartos/${room.id}`}
                    className="min-w-0 wrap-break-word font-bold text-white hover:text-(--blue-light) focus-visible:outline-2 focus-visible:outline-(--blue-light)"
                  >
                    {room.title}
                  </Link>
                  <span className="shrink-0 text-sm font-semibold text-(--gray)">{formatCents(room.priceCents)} / diária</span>
                </li>
              ))}
            </ul>
            <div>
              <Link href={`/meus-imoveis/${property.id}/quartos/novo`} className={secondaryButtonClassName}>
                <LuPlus aria-hidden="true" size={17} />
                Adicionar outro quarto
              </Link>
            </div>
          </div>
        )
      ) : null}

      {step === "revisao" ? (
        <div className="flex flex-col gap-6 py-8">
          <PublishChecklist propertyId={property.id} missing={property.missingRequirements} />
          <p className="text-sm leading-relaxed text-(--gray)">
            Opcional: cadastre as{" "}
            <Link
              href={`/meus-imoveis/${property.id}/editar?secao=areas`}
              className="font-semibold text-(--blue-light) underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-(--blue-light)"
            >
              áreas compartilhadas
            </Link>{" "}
            e as fotos de cada quarto antes de publicar. Você pode publicar agora e editar depois.
          </p>
          <PropertyStatusActions propertyId={property.id} status={property.status} canPublish={property.missingRequirements.length === 0} inline />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-(--line) pt-6 pb-4">
        {previous ? (
          <Link href={setupStepHref(property.id, previous.id)} className={secondaryButtonClassName}>
            <LuArrowLeft aria-hidden="true" size={16} />
            Voltar
          </Link>
        ) : null}
        {(step === "fotos" || (step === "quarto" && property.rooms.length > 0)) && nextHref ? (
          <Link href={nextHref} className={primaryButtonClassName}>
            Continuar
          </Link>
        ) : null}
      </div>
    </OwnerPage>
  );
}
