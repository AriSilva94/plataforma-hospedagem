"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { LuBath, LuImagePlus, LuPlus, LuShowerHead, LuSofa, LuTrash2 } from "react-icons/lu";
import { FormActions, FormStatus } from "@/components/owner/form-actions";
import { FormSection } from "@/components/owner/form-section";
import { MediaGallery } from "@/components/owner/media-gallery";
import { UnsavedChangesGuard } from "@/components/owner/unsaved-changes-guard";
import { SharedAreasFields, sharedAreasDefaults } from "@/components/owner/shared-areas-fields";
import { primaryButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { sharedAreasSchema, type SharedAreasValues } from "@/lib/owner-forms";
import { propertyDetailSchema, type Media, type PropertyDetail } from "@/lib/properties";

const MAX_SHARED_BATHROOMS = 20;

type BathroomDraft = { key: string; id?: string; media: Media[] };

function bathroomsFrom(property: PropertyDetail): BathroomDraft[] {
  return property.sharedBathrooms.map((bathroom) => ({ key: bathroom.id, id: bathroom.id, media: bathroom.media }));
}

function bathroomIds(bathrooms: BathroomDraft[]): string {
  return bathrooms.map((bathroom) => bathroom.id ?? "new").join(",");
}

export function SharedAreasForm({ property }: { property: PropertyDetail }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [savedBathrooms, setSavedBathrooms] = useState(() => bathroomsFrom(property));
  const [bathrooms, setBathrooms] = useState(savedBathrooms);
  const nextKey = useRef(0);
  const form = useForm<SharedAreasValues>({
    resolver: zodResolver(sharedAreasSchema),
    defaultValues: { areas: sharedAreasDefaults(property) },
  });
  const { handleSubmit, reset, formState } = form;
  const { isSubmitting, isDirty: areasDirty } = formState;
  const bathroomsDirty = bathroomIds(bathrooms) !== bathroomIds(savedBathrooms);
  const isDirty = areasDirty || bathroomsDirty;

  async function save(values: SharedAreasValues) {
    setError(undefined);
    setMessage(undefined);
    try {
      let updated = property;
      if (areasDirty) {
        updated = propertyDetailSchema.parse(
          await sendApiRequest(`/owner/properties/${property.id}/shared-areas`, { method: "PUT", body: JSON.stringify(values) }),
        );
      }
      if (bathroomsDirty) {
        updated = propertyDetailSchema.parse(
          await sendApiRequest(`/owner/properties/${property.id}/shared-bathrooms`, {
            method: "PUT",
            body: JSON.stringify({ bathrooms: bathrooms.map((bathroom) => (bathroom.id ? { id: bathroom.id } : {})) }),
          }),
        );
        const saved = bathroomsFrom(updated);
        setSavedBathrooms(saved);
        setBathrooms(saved);
      }
      setMessage("Áreas compartilhadas salvas.");
      reset({ areas: sharedAreasDefaults(updated) });
      router.refresh();
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    }
  }

  function addBathroom() {
    nextKey.current += 1;
    setBathrooms((current) => [...current, { key: `new-${nextKey.current}`, media: [] }]);
  }

  return (
    <div className="flex flex-col pt-6">
      <FormProvider {...form}>
        <form id="shared-areas-form" noValidate onSubmit={handleSubmit(save)} className="flex flex-col">
          <FormSection
            id="shared-areas-heading"
            icon={LuSofa}
            tone="champagne"
            title="Áreas compartilhadas"
            description="Opcional. Espaços usados por todos os quartos, com uma foto de cada um."
          >
            <SharedAreasFields property={property} />
          </FormSection>

          <FormSection
            id="shared-bathrooms-heading"
            icon={LuBath}
            tone="champagne"
            title="Banheiros nas áreas comuns"
            description="Não conte os banheiros que ficam dentro dos quartos. Adicione uma foto de cada um."
          >
            {bathrooms.length === 0 ? (
              <p className="text-sm text-(--text-secondary)">Nenhum banheiro nas áreas comuns.</p>
            ) : (
              <ul className="flex flex-col">
                {bathrooms.map((bathroom, index) => {
                  const name = `Banheiro ${index + 1}`;
                  return (
                    <li key={bathroom.key} className="flex flex-col gap-3 border-t border-(--border) py-5 first:border-t-0 first:pt-0">
                      <div className="flex items-center gap-3">
                        <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-(--champagne-soft) text-(--champagne)">
                          <LuShowerHead size={18} />
                        </span>
                        <h3 className="flex flex-1 items-baseline gap-2 text-sm font-semibold text-(--text-primary)">
                          {name}
                          {bathroom.id ? null : <span className="text-xs font-normal text-(--text-secondary)">não salvo</span>}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setBathrooms((current) => current.filter((item) => item.key !== bathroom.key))}
                          aria-label={`Remover ${name}`}
                          className="flex size-10.5 shrink-0 items-center justify-center rounded-xl text-(--text-secondary) transition-colors hover:bg-(--error-soft) hover:text-(--error) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                        >
                          <LuTrash2 aria-hidden="true" size={17} />
                        </button>
                      </div>
                      <div className="pl-12">
                        {bathroom.id ? (
                          <MediaGallery
                            compact
                            key={bathroom.id}
                            label={`Foto do ${name.toLowerCase()}`}
                            basePath={`/owner/properties/${property.id}/shared-bathrooms/${bathroom.id}`}
                            initialMedia={bathroom.media}
                            allowVideo={false}
                            maxImages={1}
                          />
                        ) : (
                          <p className="flex items-center gap-2 text-[13px] text-(--text-secondary)">
                            <LuImagePlus aria-hidden="true" size={15} className="shrink-0 text-(--champagne)" />
                            Salve para adicionar a foto deste banheiro.
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <div>
              <button type="button" onClick={addBathroom} disabled={bathrooms.length >= MAX_SHARED_BATHROOMS} className={secondaryButtonClassName}>
                <LuPlus aria-hidden="true" size={16} />
                Adicionar banheiro
              </button>
            </div>
          </FormSection>

          <UnsavedChangesGuard dirty={isDirty && !isSubmitting} />
        </form>
      </FormProvider>

      <FormActions>
        <button type="submit" form="shared-areas-form" disabled={isSubmitting || !isDirty} className={primaryButtonClassName}>
          {isSubmitting ? "Salvando..." : "Salvar áreas"}
        </button>
        {isDirty ? (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              reset();
              setBathrooms(savedBathrooms);
            }}
            className={secondaryButtonClassName}
          >
            Descartar
          </button>
        ) : null}
        <FormStatus error={error} saved={message} dirty={isDirty} />
      </FormActions>
    </div>
  );
}
