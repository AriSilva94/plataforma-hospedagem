import type { ReactNode } from "react";
import type { IconType } from "react-icons";

const tones = {
  primary: "bg-(--primary-soft) text-(--primary-text)",
  lavender: "bg-(--lavender-soft) text-(--lavender)",
  champagne: "bg-(--champagne-soft) text-(--champagne)",};

export function FormSection({
  id,
  icon: Icon,
  tone = "primary",
  title,
  description,
  children,
}: {
  id: string;
  icon: IconType;
  tone?: keyof typeof tones;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="grid gap-4 border-t border-(--border) py-6 first:border-t-0 first:pt-1 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-x-12"
    >
      <div className="flex items-start gap-3 lg:flex-col lg:gap-2.5">
        <span aria-hidden="true" className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <h2 id={id} className="text-base leading-snug font-bold tracking-tight text-balance text-(--text-primary) sm:text-lg">
            {title}
          </h2>
          {description ? <p className="mt-0.5 text-[13px] leading-relaxed text-pretty text-(--text-secondary) sm:text-sm">{description}</p> : null}
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-5">{children}</div>
    </section>
  );
}
