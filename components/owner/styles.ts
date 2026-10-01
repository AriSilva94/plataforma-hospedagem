export const fieldClassName =
  "mt-2 w-full rounded-xl border border-(--line-strong) bg-(--navy) px-4 py-3 text-white outline-hidden transition-colors focus:border-(--blue-light) focus-visible:ring-2 focus-visible:ring-(--blue-light) disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-(--danger) aria-invalid:focus-visible:ring-(--danger)";

export const labelClassName = "block text-sm font-semibold text-(--gray)";

export const primaryButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-(--blue) px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-(--blue-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light) disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-(--line-strong) px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light) disabled:cursor-not-allowed disabled:opacity-60";

export const dangerButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[rgba(229,98,75,.4)] px-4 py-3 text-sm font-semibold text-(--danger) transition-colors hover:bg-[rgba(229,98,75,.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--danger) disabled:cursor-not-allowed disabled:opacity-60";

export const choiceClassName =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-(--line-strong) bg-(--navy) px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-(--blue-light) has-checked:border-(--blue-light) has-checked:bg-[rgba(11,99,227,.14)] has-focus-visible:ring-2 has-focus-visible:ring-(--blue-light)";

const choiceControlClassName =
  "size-5 shrink-0 appearance-none border border-(--line-strong) bg-(--surface) bg-center bg-no-repeat transition-colors checked:border-(--blue) checked:bg-(--blue)";

export const checkboxClassName = `${choiceControlClassName} rounded-md checked:bg-[url("data:image/svg+xml,%3Csvg_xmlns='http://www.w3.org/2000/svg'_viewBox='0_0_16_16'_fill='none'%3E%3Cpath_d='M3.5_8.5l3_3_6-7'_stroke='white'_stroke-width='2'_stroke-linecap='round'_stroke-linejoin='round'/%3E%3C/svg%3E")]`;

export const radioClassName = `${choiceControlClassName} rounded-full checked:bg-[radial-gradient(circle,white_0_32%,transparent_36%)]`;

export const cardClassName = "rounded-2xl border border-(--line-strong) bg-(--surface) p-5 sm:p-6";
