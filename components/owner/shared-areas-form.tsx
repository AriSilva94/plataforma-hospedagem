"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { FormActions, FormStatus } from "@/components/owner/form-actions";
import { UnsavedChangesGuard } from "@/components/owner/unsaved-changes-guard";
import { SharedAreasFields, sharedAreasDefaults } from "@/components/owner/shared-areas-fields";
import { primaryButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { sharedAreasSchema, type SharedAreasValues } from "@/lib/owner-forms";
import type { PropertyDetail } from "@/lib/properties";

export function SharedAreasForm({ property }: { property: PropertyDetail }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const form = useForm<SharedAreasValues>({
    resolver: zodResolver(sharedAreasSchema),
    defaultValues: { areas: sharedAreasDefaults(property) },
  });
  const { handleSubmit, getValues, reset, formState } = form;
  const { isSubmitting, isDirty } = formState;

  async function save(values: SharedAreasValues) {
    setError(undefined);
    setMessage(undefined);
    try {
      await sendApiRequest(`/owner/properties/${property.id}/shared-areas`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      setMessage("Áreas compartilhadas salvas.");
      reset(getValues());
      router.refresh();
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    }
  }

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={handleSubmit(save)} className="flex flex-col gap-5 py-6">
        <p className="max-w-prose text-sm leading-relaxed text-(--text-secondary)">
          Opcional. Áreas que pertencem à casa como um todo e são compartilhadas entre os quartos. Não é necessário repeti-las em cada quarto.
        </p>

        <SharedAreasFields />

        <FormActions>
          <button type="submit" disabled={isSubmitting || !isDirty} className={primaryButtonClassName}>
            {isSubmitting ? "Salvando..." : "Salvar áreas"}
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
