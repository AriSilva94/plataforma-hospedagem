"use client";

import { useController, type Control, type FieldErrors } from "react-hook-form";
import { LuUsers } from "react-icons/lu";
import { FieldError } from "@/components/field-error";
import { Counter } from "@/components/owner/wizard-controls";
import { bedTypeIcons } from "@/lib/amenity-icons";
import type { RoomInput, RoomValues } from "@/lib/owner-forms";
import { bedCapacity, bedTypeLabels, bedTypes, type BedType } from "@/lib/properties";

const MAX_PER_TYPE = 10;

export function RoomBedsFields({
  id,
  control,
  errors,
}: {
  id: string;
  control: Control<RoomInput, unknown, RoomValues>;
  errors: FieldErrors<RoomInput>;
}) {
  const { field } = useController({ control, name: "beds" });
  const beds = field.value ?? [];
  const quantityOf = (type: BedType) => Number(beds.find((bed) => bed.type === type)?.quantity ?? 0);
  const sleeps = bedTypes.reduce((total, type) => total + quantityOf(type) * bedCapacity[type], 0);
  const error = errors.beds?.root?.message ?? errors.beds?.message;

  function setQuantity(type: BedType, quantity: number) {
    field.onChange(
      bedTypes.flatMap((candidate) => {
        const next = candidate === type ? quantity : quantityOf(candidate);
        return next > 0 ? [{ type: candidate, quantity: next }] : [];
      }),
    );
  }

  return (
    <div id={id} className="flex flex-col gap-3">
      <ul className="grid border-t border-(--border) sm:grid-cols-2 sm:gap-x-8">
        {bedTypes.map((type) => {
          const Icon = bedTypeIcons[type];
          const quantity = quantityOf(type);
          return (
            <li key={type} className="flex items-center gap-3 border-b border-(--border) py-1.5">
              <span
                aria-hidden="true"
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  quantity > 0 ? "bg-(--lavender-soft) text-(--lavender)" : "bg-(--surface) text-(--text-secondary)"
                }`}
              >
                <Icon size={17} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold text-(--text-primary)">{bedTypeLabels[type]}</span>
                <span className="text-xs text-(--text-secondary)">{bedCapacity[type] > 1 ? `${bedCapacity[type]} pessoas` : "1 pessoa"}</span>
              </div>
              <Counter size="compact" label={`Camas ${bedTypeLabels[type]}`} value={quantity} min={0} max={MAX_PER_TYPE} onChange={(next) => setQuantity(type, next)} />
            </li>
          );
        })}
      </ul>
      <p aria-live="polite" className="flex items-center gap-2 text-sm text-(--text-secondary)">
        <LuUsers aria-hidden="true" size={16} className="shrink-0 text-(--lavender)" />
        {sleeps > 0 ? (
          <span>
            Pelas camas, cabem até <strong className="font-bold text-(--text-primary) tabular-nums">{sleeps}</strong> {sleeps > 1 ? "pessoas" : "pessoa"}.
          </span>
        ) : (
          "Nenhuma cama informada."
        )}
      </p>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
