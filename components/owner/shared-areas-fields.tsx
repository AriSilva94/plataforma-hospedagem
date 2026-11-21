"use client";

import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { Combobox } from "@/components/combobox";
import { optionsFrom } from "@/components/owner/choice-group";
import { FieldError } from "@/components/field-error";
import { cardClassName, fieldClassName, labelClassName, secondaryButtonClassName } from "@/components/owner/styles";
import type { SharedAreasValues } from "@/lib/owner-forms";
import { sharedAreaTypeLabels, type PropertyDetail } from "@/lib/properties";

const sharedAreaTypeOptions = optionsFrom(sharedAreaTypeLabels);

export function sharedAreasDefaults(property?: PropertyDetail): SharedAreasValues["areas"] {
  return (property?.sharedAreas ?? []).map((area) => ({
    type: area.type,
    label: area.label ?? "",
    description: area.description ?? "",
  }));
}

export function SharedAreasFields() {
  const { register, control, formState } = useFormContext<SharedAreasValues>();
  const { errors } = formState;
  const { fields, append, remove } = useFieldArray({ control, name: "areas" });
  const areas = useWatch({ control, name: "areas" });

  return (
    <>
      {fields.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-(--border) p-6 text-sm text-(--text-secondary)">
          Nenhuma área cadastrada.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {fields.map((field, index) => {
            const areaErrors = errors.areas?.[index];
            return (
              <li key={field.id} className={`${cardClassName} grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-start`}>
                <div>
                  <label id={`area-${index}-type-label`} htmlFor={`area-${index}-type`} className={labelClassName}>Área</label>
                  <div className="mt-1.5">
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
                  </div>
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
    </>
  );
}
