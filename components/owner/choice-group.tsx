import type { UseFormRegisterReturn } from "react-hook-form";
import { FieldError } from "@/components/owner/field-error";
import { checkboxClassName, choiceClassName } from "@/components/owner/styles";

export function ChoiceGroup({
  id,
  legend,
  description,
  type,
  options,
  registration,
  error,
  disabled,
}: {
  id: string;
  legend: string;
  description?: string;
  type: "checkbox" | "radio";
  options: { value: string; label: string }[];
  registration: UseFormRegisterReturn;
  error?: string;
  disabled?: boolean;
}) {
  const errorId = `${id}-error`;

  return (
    <fieldset aria-describedby={error ? errorId : undefined} disabled={disabled}>
      <legend className="text-sm font-semibold text-(--gray)">{legend}</legend>
      {description ? <p className="mt-1 text-xs leading-relaxed text-(--gray)">{description}</p> : null}
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <label key={option.value} className={choiceClassName}>
            <input type={type} value={option.value} className={checkboxClassName} {...registration} />
            {option.label}
          </label>
        ))}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}

export function optionsFrom<T extends string>(labels: Record<T, string>) {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));
}
