"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { FormActions, FormStatus } from "@/components/owner/form-actions";
import { UnsavedChangesGuard } from "@/components/owner/unsaved-changes-guard";
import { PropertyAddressFields, locationDefaults } from "@/components/owner/property-address-fields";
import { primaryButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { propertyLocationSchema, type PropertyLocationInput, type PropertyLocationValues } from "@/lib/owner-forms";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import type { PropertyDetail } from "@/lib/properties";

export function PropertyLocationForm({ property }: { property: PropertyDetail }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const form = useForm<PropertyLocationInput, unknown, PropertyLocationValues>({
    resolver: zodResolver(propertyLocationSchema),
    defaultValues: locationDefaults(property),
    mode: "onBlur",
  });
  const { handleSubmit, getValues, reset, formState } = form;
  const { isSubmitting, isDirty } = formState;

  async function save(values: PropertyLocationValues) {
    setError(undefined);
    setMessage(undefined);
    try {
      await sendApiRequest(`/owner/properties/${property.id}`, { method: "PATCH", body: JSON.stringify(values) });
      setMessage("Localização salva.");
      reset(getValues());
      router.refresh();
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    }
  }

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={handleSubmit(save)} className="flex flex-col gap-6 py-6">
        <PropertyAddressFields />
        <FormActions>
          <button type="submit" disabled={isSubmitting || !isDirty} className={primaryButtonClassName}>
            {isSubmitting ? "Salvando..." : "Salvar localização"}
          </button>
          {isDirty ? (
            <button type="button" disabled={isSubmitting} onClick={() => reset()} className={secondaryButtonClassName}>
              Descartar
            </button>
          ) : null}
          <FormStatus error={error} saved={message} dirty={isDirty} />
        </FormActions>
        <UnsavedChangesGuard dirty={isDirty && !isSubmitting} />
      </form>
    </FormProvider>
  );
}
