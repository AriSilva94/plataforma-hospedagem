"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { FieldError } from "@/components/field-error";
import { FieldHint } from "@/components/owner/field-hint";
import { FormActions, FormStatus } from "@/components/owner/form-actions";
import { HouseServicesFields } from "@/components/owner/house-services-fields";
import { OptionalDetails } from "@/components/owner/optional-details";
import { PropertyAddressFields, locationDefaults } from "@/components/owner/property-address-fields";
import { PropertyBasicFields, PropertyDetailsFields, detailsSummary, generalDefaults } from "@/components/owner/property-general-form";
import { SharedAreasFields, sharedAreasDefaults } from "@/components/owner/shared-areas-fields";
import { UnsavedChangesGuard } from "@/components/owner/unsaved-changes-guard";
import { fieldClassName, labelClassName, primaryButtonClassName } from "@/components/owner/styles";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import {
  houseServicesError,
  houseServicesPayload,
  propertySetupSchema,
  type PropertySetupInput,
  type PropertySetupValues,
} from "@/lib/owner-forms";
import type { PropertyDetail } from "@/lib/properties";
import { setupStepHref } from "@/lib/setup-steps";

const sectionHeadingClassName = "text-lg font-bold text-(--text-primary)";

export function PropertySetupForm({ property, roomCount }: { property?: PropertyDetail; roomCount?: number }) {
  const router = useRouter();
  const [propertyId, setPropertyId] = useState(property?.id);
  const [error, setError] = useState<string>();
  const form = useForm<PropertySetupInput, unknown, PropertySetupValues>({
    resolver: zodResolver(propertySetupSchema),
    defaultValues: {
      ...generalDefaults(property),
      ...locationDefaults(property),
      areas: sharedAreasDefaults(property),
      roomCount: roomCount ?? Math.max(property?.rooms.length ?? 0, 1),
    },
    mode: "onBlur",
  });
  const { register, control, handleSubmit, formState } = form;
  const { errors, isSubmitting, isDirty } = formState;
  const hasCleaner = useWatch({ control, name: "hasCleaner" });

  async function save({ areas, roomCount: count, ...values }: PropertySetupValues) {
    setError(undefined);
    const servicesError = houseServicesError(values);
    if (servicesError) {
      setError(servicesError);
      return;
    }
    try {
      const body = JSON.stringify({ ...values, ...houseServicesPayload(values) });
      let id = propertyId;
      if (id) {
        await sendApiRequest(`/owner/properties/${id}`, { method: "PATCH", body });
      } else {
        const created = await sendApiRequest("/owner/properties", { method: "POST", body });
        id = typeof created === "object" && created !== null && "id" in created ? String(created.id) : undefined;
        if (!id) {
          router.push("/meus-imoveis");
          return;
        }
        setPropertyId(id);
      }
      if (areas.length > 0 || (property?.sharedAreas.length ?? 0) > 0) {
        await sendApiRequest(`/owner/properties/${id}/shared-areas`, { method: "PUT", body: JSON.stringify({ areas }) });
      }
      router.push(setupStepHref(id, "fotos", count));
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    }
  }

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={handleSubmit(save)} className="flex flex-col gap-6 py-6">
        <section aria-labelledby="setup-basic-heading" className="flex flex-col gap-5">
          <h2 id="setup-basic-heading" className={sectionHeadingClassName}>Informações básicas</h2>
          <PropertyBasicFields published={false} />
        </section>

        <div className="flex flex-col gap-6 border-t border-(--border) pt-6">
          <PropertyAddressFields />
        </div>

        <OptionalDetails
          title="Detalhes da casa"
          tag="recomendado"
          description={detailsSummary(property)}
          forceOpen={Boolean(errors.houseRules || errors.generalInfo)}
        >
          <HouseServicesFields register={register} hasCleaner={hasCleaner} />
          <PropertyDetailsFields />
        </OptionalDetails>

        <OptionalDetails
          title="Áreas compartilhadas"
          description="Áreas da casa compartilhadas entre os quartos, como cozinha e sala."
          forceOpen={Boolean(errors.areas)}
        >
          <SharedAreasFields />
        </OptionalDetails>

        <section aria-labelledby="setup-room-count-heading" className="flex flex-col gap-2">
          <h2 id="setup-room-count-heading" className={sectionHeadingClassName}>Quantos quartos você vai cadastrar agora?</h2>
          <div className="max-w-40">
            <label htmlFor="property-room-count" className={labelClassName}>Quartos</label>
            <input
              id="property-room-count"
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              step={1}
              {...register("roomCount")}
              aria-invalid={errors.roomCount ? "true" : undefined}
              aria-describedby={`property-room-count-hint${errors.roomCount ? " property-room-count-error" : ""}`}
              className={fieldClassName}
            />
          </div>
          <FieldHint id="property-room-count-hint">No passo Quartos você cadastra cada quarto. Dá para adicionar mais depois.</FieldHint>
          <FieldError id="property-room-count-error" message={errors.roomCount?.message} />
        </section>

        <FormActions>
          <button type="submit" disabled={isSubmitting} className={primaryButtonClassName}>
            {isSubmitting ? "Salvando..." : "Salvar e continuar"}
          </button>
          <FormStatus error={error} />
        </FormActions>
        {!property ? <p className="text-[13px] text-(--text-secondary)">Você poderá editar tudo depois. O imóvel só aparece para hóspedes quando for publicado.</p> : null}
        <UnsavedChangesGuard dirty={isDirty && !isSubmitting} />
      </form>
    </FormProvider>
  );
}
