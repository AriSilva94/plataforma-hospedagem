export const fieldClassName =
  "mt-1.5 w-full rounded-xl border border-(--line-strong) bg-(--navy) px-3.5 py-2.5 text-base text-(--white) outline-hidden sm:text-sm transition-colors focus:border-(--blue-light) focus-visible:ring-2 focus-visible:ring-(--blue-light) disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-(--danger) aria-invalid:focus-visible:ring-(--danger)";

export const labelClassName = "block text-sm font-semibold text-(--gray)";

export const primaryButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-(--blue) px-5 py-3 text-sm font-bold text-(--white) transition-colors hover:bg-(--blue-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light) disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-(--line-strong) px-4 py-3 text-sm font-semibold text-(--white) transition-colors hover:bg-(--white)/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light) disabled:cursor-not-allowed disabled:opacity-60";

export const dangerButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-2xl border border-(--danger)/40 px-4 py-3 text-sm font-semibold text-(--danger) transition-colors hover:bg-(--danger)/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--danger) disabled:cursor-not-allowed disabled:opacity-60";

export const choiceClassName =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-(--line-strong) bg-(--navy) px-3.5 text-sm font-semibold text-(--white) transition-colors sm:min-h-9 hover:border-(--blue-light) has-checked:border-(--blue-light) has-checked:bg-(--blue)/14 has-focus-visible:ring-2 has-focus-visible:ring-(--blue-light)";

const choiceControlClassName =
  "size-4 shrink-0 appearance-none border border-(--line-strong) bg-(--surface) bg-center bg-no-repeat transition-colors checked:border-(--blue) checked:bg-(--blue)";

export const checkboxClassName = `${choiceControlClassName} peer rounded-md`;

export const radioClassName = `${choiceControlClassName} rounded-full checked:bg-[radial-gradient(circle,var(--white)_0_32%,transparent_36%)]`;

export const cardClassName = "rounded-2xl border border-(--line-strong) bg-(--surface) p-5 sm:p-6";
