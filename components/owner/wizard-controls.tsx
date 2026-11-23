import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { LuCheck, LuMinus, LuPlus } from "react-icons/lu";

export const shortcutKeys = "ABCDEFGHIJKLMNOP";

export function StepHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      <h1 tabIndex={-1} data-step-heading className="text-[1.75rem] leading-[1.1] font-extrabold tracking-tight text-balance text-(--text-primary) outline-none sm:text-4xl">
        {title}
      </h1>
      {description ? <p className="max-w-prose text-sm leading-relaxed text-pretty text-(--text-secondary) sm:text-base">{description}</p> : null}
    </div>
  );
}

export function PhotoProgress({ done, total, noun }: { done: number; total: number; noun: string }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-(--text-secondary)">
      {total <= 12 ? (
        <span aria-hidden="true" className="flex gap-1">
          {Array.from({ length: total }, (_, index) => (
            <span key={index} className={`h-1.5 w-5 rounded-full transition-colors ${index < done ? "bg-(--champagne)" : "bg-(--border-strong)"}`} />
          ))}
        </span>
      ) : null}
      <span>
        <strong className="font-bold text-(--text-primary) tabular-nums">{done}</strong> de {total} {noun} com foto
      </span>
    </p>
  );
}

export function PhotoRow({ icon: Icon, name, children }: { icon: IconType; name: string; children: ReactNode }) {
  return (
    <li className="flex flex-col gap-3 border-t border-(--border) py-5 first:border-t-0 first:pt-0">
      <h2 className="flex items-center gap-3 font-bold text-(--text-primary)">
        <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-(--champagne-soft) text-(--champagne)">
          <Icon size={18} />
        </span>
        {name}
      </h2>
      <div className="pl-12">{children}</div>
    </li>
  );
}

export function ChoiceOption({
  shortcut,
  selected,
  multiple = false,
  chip = false,
  icon: Icon,
  onSelect,
  children,
  hint,
}: {
  shortcut?: string;
  selected: boolean;
  multiple?: boolean;
  chip?: boolean;
  icon?: IconType;
  onSelect: () => void;
  children: ReactNode;
  hint?: string;
}) {
  const shape = chip ? "min-h-11 w-auto gap-2 rounded-full px-3.5 py-2 lg:min-h-12 lg:w-full lg:gap-3 lg:rounded-2xl lg:px-3.5" : "min-h-13 w-full gap-3 rounded-2xl px-3.5 py-2.5 sm:min-h-14 sm:px-4";

  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onSelect}
      className={`flex items-center text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) ${shape} border ${
        selected ? "border-(--primary) bg-(--primary-soft)" : "border-(--border-strong) bg-(--surface) hover:border-(--primary-border)"
      }`}
    >
      {Icon ? <Icon aria-hidden="true" size={chip ? 17 : 20} className={`shrink-0 ${selected ? "text-(--primary-text)" : "text-(--text-secondary)"}`} /> : null}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={`font-semibold text-(--text-primary) ${chip ? "text-sm leading-snug" : "text-base"}`}>{children}</span>
        {hint ? <span className="text-sm text-(--text-secondary)">{hint}</span> : null}
      </span>
      {multiple && selected ? <LuCheck aria-hidden="true" size={chip ? 15 : 18} className="shrink-0 text-(--primary-text)" /> : null}
      {shortcut ? (
        <kbd
          aria-hidden="true"
          className={`hidden size-6 shrink-0 items-center justify-center rounded-md border font-sans text-[0.6875rem] font-bold lg:flex ${
            selected ? "border-(--primary) bg-(--primary) text-(--on-primary)" : "border-(--border) bg-(--background) text-(--text-secondary)"
          }`}
        >
          {shortcut}
        </kbd>
      ) : null}
    </button>
  );
}

export function Counter({
  label,
  value,
  min,
  max,
  onChange,
  size = "large",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  size?: "large" | "compact";
}) {
  const large = size === "large";
  const buttonClassName = `flex shrink-0 items-center justify-center rounded-full border border-(--border-strong) bg-(--surface) text-(--text-primary) transition-colors hover:border-(--primary-border) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-40 ${
    large ? "size-14" : "size-11"
  }`;

  return (
    <div role="group" aria-label={label} className={`flex items-center ${large ? "gap-6" : "gap-2.5"}`}>
      <button type="button" aria-label={`Diminuir ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)} className={buttonClassName}>
        <LuMinus aria-hidden="true" size={large ? 22 : 18} />
      </button>
      <output aria-live="polite" className={`text-center font-extrabold tracking-tight text-(--text-primary) tabular-nums ${large ? "min-w-20 text-6xl leading-[1.15]" : "min-w-7 text-xl"}`}>
        {value}
      </output>
      <button type="button" aria-label={`Aumentar ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)} className={buttonClassName}>
        <LuPlus aria-hidden="true" size={large ? 22 : 18} />
      </button>
    </div>
  );
}
