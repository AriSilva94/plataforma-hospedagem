import type { UseFormRegisterReturn } from "react-hook-form";
import type { IconType } from "react-icons";
import { FieldError } from "@/components/field-error";
import { choiceClassName } from "@/components/owner/styles";

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
  options: { value: string; label: string; detail?: string; icon?: IconType }[];
  registration: UseFormRegisterReturn;
  error?: string;
  disabled?: boolean;
}) {
  const errorId = `${id}-error`;

  return (
    <fieldset id={id} aria-describedby={error ? errorId : undefined} disabled={disabled}>
      <legend className="text-sm font-semibold text-(--text-primary)">{legend}</legend>
      {description ? <p className="mt-0.5 text-[13px] leading-relaxed text-(--text-secondary)">{description}</p> : null}
      <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
        {options.map(({ icon: Icon, ...option }) => (
          <label key={option.value} className={`group/choice ${choiceClassName}`}>
            <input type={type} value={option.value} className="sr-only" {...registration} />
            {Icon ? <Icon aria-hidden="true" size={15} className="shrink-0 text-(--text-secondary) group-has-checked/choice:text-(--primary-text)" /> : null}
            {option.label}
            {option.detail ? (
              <span className="font-medium text-(--text-secondary) tabular-nums">
                <span className="sr-only">: </span>
                {option.detail}
              </span>
            ) : null}
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
