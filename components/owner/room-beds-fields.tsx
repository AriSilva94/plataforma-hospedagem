"use client";

import { Controller, useFieldArray, useWatch, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { Combobox } from "@/components/combobox";
import { FieldError } from "@/components/field-error";
import { fieldClassName, secondaryButtonClassName } from "@/components/owner/styles";
import type { RoomInput, RoomValues } from "@/lib/owner-forms";
import { bedTypeLabels, bedTypes } from "@/lib/properties";

const MAX_BEDS = 6;

export function RoomBedsFields({
  id,
  control,
  register,
  errors,
}: {
  id: string;
  control: Control<RoomInput, unknown, RoomValues>;
  register: UseFormRegister<RoomInput>;
  errors: FieldErrors<RoomInput>;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "beds" });
  const beds = useWatch({ control, name: "beds" });
  const chosen = new Set((beds ?? []).map((bed) => bed?.type));
  const nextType = bedTypes.find((type) => !chosen.has(type));
  const arrayError = errors.beds?.root?.message ?? errors.beds?.message;

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => {
        const rowId = `${id}-${field.id}`;
        const rowErrors = errors.beds?.[index];
        const options = bedTypes
          .filter((type) => type === beds?.[index]?.type || !chosen.has(type))
          .map((type) => ({ value: type, label: bedTypeLabels[type] }));
        return (
          <div key={field.id}>
            <div className="grid grid-cols-[minmax(0,1fr)_6rem_auto] items-end gap-3">
              <div>
                <span id={`${rowId}-type-label`} className="sr-only">{`Tipo da cama ${index + 1}`}</span>
                <Controller
                  control={control}
                  name={`beds.${index}.type`}
                  render={({ field: typeField }) => (
                    <Combobox
                      ref={typeField.ref}
                      id={`${rowId}-type`}
                      labelId={`${rowId}-type-label`}
                      value={typeField.value ?? ""}
                      options={options}
                      onChange={typeField.onChange}
                      onBlur={typeField.onBlur}
                      placeholder="Selecione"
                      searchLabel="Buscar tipo de cama"
                      emptyMessage="Nenhum tipo encontrado."
                      clearable={false}
                      size="compact"
                      invalid={Boolean(rowErrors?.type)}
                      describedBy={rowErrors?.type ? `${rowId}-type-error` : undefined}
                    />
                  )}
                />
              </div>
              <div>
                <label htmlFor={`${rowId}-quantity`} className="sr-only">{`Quantidade da cama ${index + 1}`}</label>
                <input
                  id={`${rowId}-quantity`}
                  type="number"
                  min={1}
                  max={10}
                  inputMode="numeric"
                  {...register(`beds.${index}.quantity`)}
                  aria-invalid={rowErrors?.quantity ? "true" : undefined}
                  aria-describedby={rowErrors?.quantity ? `${rowId}-quantity-error` : undefined}
                  className={fieldClassName}
                />
              </div>
              <button type="button" onClick={() => remove(index)} aria-label={`Remover cama ${index + 1}`} className={secondaryButtonClassName}>
                <LuTrash2 aria-hidden="true" size={16} />
              </button>
            </div>
            <FieldError id={`${rowId}-type-error`} message={rowErrors?.type?.message} />
            <FieldError id={`${rowId}-quantity-error`} message={rowErrors?.quantity?.message} />
          </div>
        );
      })}
      <FieldError id={`${id}-error`} message={arrayError} />
      <div>
        <button
          type="button"
          disabled={fields.length >= MAX_BEDS || !nextType}
          onClick={() => nextType && append({ type: nextType, quantity: 1 })}
          className={secondaryButtonClassName}
        >
          <LuPlus aria-hidden="true" size={16} />
          Adicionar cama
        </button>
      </div>
    </div>
  );
}
