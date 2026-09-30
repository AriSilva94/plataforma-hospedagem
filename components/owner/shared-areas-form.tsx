"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { FormFeedback } from "@/components/form-feedback";
import { optionsFrom } from "@/components/owner/choice-group";
import { FieldError } from "@/components/owner/field-error";
import {
  cardClassName,
  fieldClassName,
  labelClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/owner/styles";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { sharedAreasSchema, type SharedAreasValues } from "@/lib/owner-forms";
import { sharedAreaTypeLabels, type PropertyDetail } from "@/lib/properties";

export function SharedAreasForm({ property }: { property: PropertyDetail }) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const { register, control, handleSubmit, formState } = useForm<SharedAreasValues>({
    resolver: zodResolver(sharedAreasSchema),
    defaultValues: {
      areas: property.sharedAreas.map((area) => ({
        type: area.type,
        label: area.label ?? "",
        description: area.description ?? "",
      })),
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "areas" });
  const { errors, isSubmitting } = formState;
  const areas = useWatch({ control, name: "areas" });

  async function save(values: SharedAreasValues) {
    setError(undefined);
    setMessage(undefined);
    try {
      await sendApiRequest(`/owner/properties/${property.id}/shared-areas`, {
        method: "PUT",
        body: JSON.stringify(values),
      });
      setMessage("Áreas compartilhadas salvas.");
      router.refresh();
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(save)} className="flex flex-col gap-6 py-8">
      <p className="max-w-prose text-sm leading-relaxed text-(--gray)">
        Áreas que pertencem à casa como um todo e são compartilhadas entre os quartos. Não é necessário repeti-las em cada quarto.
      </p>

      {fields.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-(--line-strong) p-6 text-sm text-(--gray)">
          Nenhuma área cadastrada.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {fields.map((field, index) => {
            const areaErrors = errors.areas?.[index];
            return (
              <li key={field.id} className={`${cardClassName} grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-start`}>
                <div>
                  <label htmlFor={`area-${index}-type`} className={labelClassName}>Área</label>
                  <select id={`area-${index}-type`} {...register(`areas.${index}.type`)} className={fieldClassName}>
                    {optionsFrom(sharedAreaTypeLabels).map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {areas[index]?.type === "OTHER" ? (
                    <>
                      <label htmlFor={`area-${index}-label`} className={`${labelClassName} mt-4`}>Nome da área</label>
                      <input
                        id={`area-${index}-label`}
                        {...register(`areas.${index}.label`)}
                        placeholder="Ex.: Terraço"
                        aria-invalid={areaErrors?.label ? "true" : undefined}
                        aria-describedby={areaErrors?.label ? `area-${index}-label-error` : undefined}
                        className={fieldClassName}
                      />
                      <FieldError id={`area-${index}-label-error`} message={areaErrors?.label?.message} />
                    </>
                  ) : null}
                </div>
                <div>
                  <label htmlFor={`area-${index}-description`} className={labelClassName}>Detalhes (opcional)</label>
                  <textarea
                    id={`area-${index}-description`}
                    rows={2}
                    {...register(`areas.${index}.description`)}
                    placeholder="Ex.: cozinha equipada com geladeira e fogão"
                    aria-invalid={areaErrors?.description ? "true" : undefined}
                    className={fieldClassName}
                  />
                  <FieldError id={`area-${index}-description-error`} message={areaErrors?.description?.message} />
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Remover área ${index + 1}`}
                  className={`${secondaryButtonClassName} md:mt-7`}
                >
                  <LuTrash2 aria-hidden="true" size={16} />
                  <span className="md:hidden">Remover</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <FieldError id="areas-error" message={errors.areas?.message} />

      <div>
        <button
          type="button"
          onClick={() => append({ type: "LIVING_ROOM", label: "", description: "" })}
          disabled={fields.length >= 30}
          className={secondaryButtonClassName}
        >
          <LuPlus aria-hidden="true" size={16} />
          Adicionar área
        </button>
      </div>

      {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
      {message ? <FormFeedback tone="success">{message}</FormFeedback> : null}

      <div className="border-t border-(--line) pt-6">
        <button type="submit" disabled={isSubmitting} className={primaryButtonClassName}>
          {isSubmitting ? "Salvando..." : "Salvar áreas"}
        </button>
      </div>
    </form>
  );
}
