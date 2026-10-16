export const fieldClassName =
  "mt-1.5 w-full rounded-xl border border-(--border-strong) bg-(--background) px-3.5 py-2.5 text-base text-(--text-primary) outline-hidden sm:text-sm transition-colors focus:border-(--primary) focus-visible:ring-2 focus-visible:ring-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-(--error) aria-invalid:focus-visible:ring-(--error)";

export const labelClassName = "block text-sm font-semibold text-(--text-secondary)";

export const primaryButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-(--primary) px-5 py-3 text-sm font-bold text-(--on-primary) transition-colors hover:bg-(--primary-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-(--border-strong) px-4 py-3 text-sm font-semibold text-(--text-primary) transition-colors hover:bg-(--text-primary)/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60";

export const dangerButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-(--error)/40 px-4 py-3 text-sm font-semibold text-(--error) transition-colors hover:bg-(--error-soft) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--error) disabled:cursor-not-allowed disabled:opacity-60";

export const choiceClassName =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-(--border-strong) bg-(--background) px-3.5 text-sm font-semibold text-(--text-primary) transition-colors sm:min-h-9 hover:border-(--primary-border) has-checked:border-(--primary) has-checked:bg-(--primary-soft) has-focus-visible:ring-2 has-focus-visible:ring-(--focus-ring)";

const choiceControlClassName =
  "size-4 shrink-0 appearance-none border border-(--border-strong) bg-(--surface) bg-center bg-no-repeat transition-colors checked:border-(--primary) checked:bg-(--primary)";

export const checkboxClassName = `${choiceControlClassName} peer rounded-md`;

export const radioClassName = `${choiceControlClassName} rounded-full checked:bg-[radial-gradient(circle,var(--on-primary)_0_32%,transparent_36%)]`;

export const cardClassName = "rounded-2xl border border-(--border) bg-(--surface) p-5 sm:p-6";
