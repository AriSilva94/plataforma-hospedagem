"use client";

import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { LuImagePlus, LuPlus, LuTrash2 } from "react-icons/lu";
import { Combobox } from "@/components/combobox";
import { optionsFrom } from "@/components/owner/choice-group";
import { FieldError } from "@/components/field-error";
import { MediaGallery } from "@/components/owner/media-gallery";
import { fieldClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { sharedAreaTypeIcons } from "@/lib/amenity-icons";
import type { SharedAreasValues } from "@/lib/owner-forms";
import { sharedAreaTypeLabels, type PropertyDetail } from "@/lib/properties";

const sharedAreaTypeOptions = optionsFrom(sharedAreaTypeLabels);

export function sharedAreasDefaults(property?: PropertyDetail): SharedAreasValues["areas"] {
  return (property?.sharedAreas ?? []).map((area) => ({
    id: area.id,
    type: area.type,
    label: area.label ?? "",
    description: area.description ?? "",
  }));
}

export function SharedAreasFields({ property }: { property: PropertyDetail }) {
  const { register, control, formState } = useFormContext<SharedAreasValues>();
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({ control, name: "areas" });
  const areas = useWatch({ control, name: "areas" });

  return (
    <>
      {fields.length === 0 ? (
        <p className="text-sm text-(--text-secondary)">Nenhuma área cadastrada.</p>
      ) : (
        <ul className="flex flex-col">
          {fields.map((field, index) => {
            const areaErrors = errors.areas?.[index];
            const area = areas[index];
            const AreaIcon = sharedAreaTypeIcons[area?.type ?? "OTHER"];
            const saved = area?.id ? property.sharedAreas.find((candidate) => candidate.id === area.id) : undefined;
            const name = area?.type === "OTHER" ? area.label || sharedAreaTypeLabels.OTHER : sharedAreaTypeLabels[area?.type ?? "OTHER"];
            return (
              <li key={field.id} className="flex flex-col gap-3 border-t border-(--border) py-5 first:border-t-0 first:pt-0">
                <div className="flex items-start gap-3">
                  <span aria-hidden="true" className="mt-0.75 flex size-9 shrink-0 items-center justify-center rounded-lg bg-(--champagne-soft) text-(--champagne)">
                    <AreaIcon size={18} />
                  </span>
                  <div className="grid min-w-0 flex-1 gap-2.5 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
                    <div className="flex flex-col gap-2.5">
                      <span id={`area-${index}-type-label`} className="sr-only">Área</span>
                      <Controller
                        control={control}
                        name={`areas.${index}.type`}
                        render={({ field: typeField }) => (
                          <Combobox
                            ref={typeField.ref}
                            id={`area-${index}-type`}
                            labelId={`area-${index}-type-label`}
                            value={typeField.value}
                            options={sharedAreaTypeOptions}
                            onChange={typeField.onChange}
                            onBlur={typeField.onBlur}
                            placeholder="Selecione"
                            searchLabel="Buscar área"
                            emptyMessage="Nenhuma área encontrada."
                            clearable={false}
                            size="compact"
                          />
                        )}
                      />
                      {area?.type === "OTHER" ? (
                        <div>
                          <label htmlFor={`area-${index}-label`} className="sr-only">Nome da área</label>
                          <input
                            id={`area-${index}-label`}
                            {...register(`areas.${index}.label`)}
                            placeholder="Nome da área, ex.: Terraço"
                            aria-invalid={areaErrors?.label ? "true" : undefined}
                            aria-describedby={areaErrors?.label ? `area-${index}-label-error` : undefined}
                            className={`${fieldClassName} mt-0!`}
                          />
                          <FieldError id={`area-${index}-label-error`} message={areaErrors?.label?.message} />
                        </div>
                      ) : null}
                    </div>
                    <div>
                      <label htmlFor={`area-${index}-description`} className="sr-only">Detalhes da área (opcional)</label>
                      <input
                        id={`area-${index}-description`}
                        {...register(`areas.${index}.description`)}
                        placeholder="Detalhes (opcional)"
                        aria-invalid={areaErrors?.description ? "true" : undefined}
                        aria-describedby={areaErrors?.description ? `area-${index}-description-error` : undefined}
                        className={`${fieldClassName} mt-0!`}
                      />
                      <FieldError id={`area-${index}-description-error`} message={areaErrors?.description?.message} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label={`Remover ${name}`}
                    className="flex size-10.5 shrink-0 items-center justify-center rounded-xl text-(--text-secondary) transition-colors hover:bg-(--error-soft) hover:text-(--error) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                  >
                    <LuTrash2 aria-hidden="true" size={17} />
                  </button>
                </div>
                <div className="pl-12">
                  {saved ? (
                    <MediaGallery
                      compact
                      label={`Fotos da área ${name}`}
                      basePath={`/owner/properties/${property.id}/shared-areas/${saved.id}`}
                      initialMedia={saved.media}
                      allowVideo={false}
                      maxImages={1}
                    />
                  ) : (
                    <p className="flex items-center gap-2 text-[13px] text-(--text-secondary)">
                      <LuImagePlus aria-hidden="true" size={15} className="shrink-0 text-(--champagne)" />
                      Salve as áreas para adicionar a foto desta área.
                    </p>
                  )}
                </div>
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
    </>
  );
}
