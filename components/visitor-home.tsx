import { LuCalendarCheck, LuHistory, LuSearch } from "react-icons/lu";
import { HomeSearch } from "@/components/home-search";
import { HomeVideoBanner } from "@/components/home-video-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const steps = [
  { icon: LuSearch, title: "Compare quarto a quarto", text: "Preço e calendário próprios" },
  { icon: LuCalendarCheck, title: "Reserve e pague sem comprovante", text: "Pagamento confirmado pela plataforma" },
  { icon: LuHistory, title: "Renove a diária com prioridade", text: "Até o horário-limite da estadia" },
];

const stepShapes = [
  "max-lg:step-start max-lg:rounded-l-[calc(1rem-1px)] lg:step-segment",
  "step-segment step-overlap",
  "step-end step-overlap rounded-r-[calc(1rem-1px)]",
];

export function VisitorHome() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-360 flex-1 flex-col gap-3 px-4 py-3 sm:px-6 md:gap-5 md:px-10 md:py-6 lg:px-12">
        <HomeVideoBanner />
        <HomeSearch />

        <section id="como-funciona" aria-labelledby="como-funciona-titulo" className="flex flex-col gap-2 lg:step-bar lg:flex-row lg:gap-0">
          <h2
            id="como-funciona-titulo"
            className="text-sm font-extrabold text-(--primary-text) lg:flex lg:shrink-0 lg:items-center lg:bg-(--primary) lg:pr-[calc(var(--arrow)+1.25rem)] lg:pl-5 lg:rounded-l-[calc(1rem-1px)] lg:text-(--on-primary) lg:step-start"
          >
            Como funciona
          </h2>
          <ol className="max-lg:step-bar lg:flex lg:flex-1 lg:step-overlap">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <li
                key={title}
                className={`flex h-[4.5rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 bg-(--surface-accent) text-center lg:flex-row lg:justify-start lg:text-left pr-[calc(var(--arrow)+0.375rem)] pl-[calc(var(--arrow)+0.625rem)] max-lg:first:pl-3.5 lg:h-11 lg:gap-2.5 xl:h-14 ${stepShapes[index]}`}
              >
                <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-(--surface) text-(--primary-text) ring-1 ring-(--primary-border) lg:size-7 xl:size-9">
                  <Icon className="size-3.5 xl:size-4.5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[11px] leading-tight font-bold text-(--text-primary) lg:line-clamp-2 lg:text-[13px] xl:line-clamp-1 xl:text-sm">
                    <span className="hidden tabular-nums text-(--primary-text) lg:inline">{index + 1}. </span>
                    {title}
                  </h3>
                  <p className="mt-0.5 hidden truncate text-xs text-(--text-secondary) xl:block">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
