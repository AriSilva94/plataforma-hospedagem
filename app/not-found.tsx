import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = {
  title: "Página não encontrada | DOMUS X",
};

const ctaBase =
  "inline-flex rounded-2xl px-6 py-3.5 text-[15px] transition-colors focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-(--focus-ring)";
const doorPanel =
  "absolute rounded-xs bg-[#26282C] shadow-[inset_0_0_0_1px_#1A1B1E,inset_2px_2px_0_#35383D,inset_-2px_-2px_0_#1C1D20,0_0_0_4px_#2A2C30,0_0_0_5px_#1C1D20]";
const doorHinge = "absolute -left-1.75 h-8.5 w-1.25 rounded-xs bg-[linear-gradient(90deg,#8A6E4B,#D4B68A)]";

export default async function NotFound() {
  const { user } = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user} />
      <main className="grid min-h-[calc(100svh-65px)] pb-18 md:min-h-[calc(100svh-73px)] md:grid-cols-[460px_minmax(0,1fr)] md:pb-0">
        <ClosedDoorScene />
        <div className="flex flex-col justify-center gap-6 px-6 py-10 md:px-14 md:py-16 lg:pr-18">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-(--primary-text)">
            Erro 404 · Página não encontrada
          </p>
          <h1 className="max-w-xl text-[clamp(2.25rem,5vw,3.625rem)] font-extrabold leading-[1.04] tracking-tight text-balance">
            Esta porta não abre para lugar nenhum.
          </h1>
          <p className="max-w-105 text-[17px] leading-relaxed text-pretty text-(--text-secondary)">
            O endereço que você procurou foi removido, mudou de lugar ou nunca existiu. Os outros quartos continuam
            disponíveis.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              href="/anuncios"
              className={`${ctaBase} bg-(--primary) font-bold text-(--on-primary) hover:bg-(--primary-hover)`}
            >
              Ver quartos disponíveis
            </Link>
            <Link
              href="/"
              className={`${ctaBase} border border-(--border-strong) font-semibold text-(--text-primary) hover:bg-(--primary-soft)`}
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function ClosedDoorScene() {
  return (
    <div
      aria-hidden="true"
      className="relative h-82.5 overflow-hidden border-(--border) bg-[radial-gradient(ellipse_60%_45%_at_50%_30%,#1E1F22_0%,#141416_70%)] max-md:border-b md:h-auto md:min-h-150 md:border-r"
    >
      <div className="absolute inset-x-0 bottom-0 h-10 bg-[linear-gradient(180deg,#0B0B0C,#111113)] md:h-18" />
      <div className="absolute inset-x-0 bottom-10 h-2 border-t border-[#2A2C30] bg-[#1A1B1E] md:bottom-18 md:h-3.5" />
      <div className="absolute bottom-0 left-1/2 h-10 w-30 -translate-x-1/2 bg-[linear-gradient(180deg,rgba(212,182,138,.18),rgba(212,182,138,0))] [clip-path:polygon(18%_0,82%_0,100%_100%,0_100%)] md:h-18 md:w-50" />

      <div className="absolute bottom-11.75 left-1/2 h-117 w-72 origin-bottom -translate-x-1/2 scale-55 rounded-t-xs bg-[#0E0E10] shadow-[0_0_0_12px_#1F2023,0_0_0_13px_#34373C,0_0_0_18px_#18191B,0_30px_60px_rgba(0,0,0,.6)] md:bottom-21.5 md:scale-100">
        <div className="absolute inset-x-1.5 top-1.5 bottom-1 rounded-[1px] bg-[linear-gradient(90deg,#24262A_0%,#2B2D31_55%,#26282C_100%)] shadow-[inset_0_0_0_1px_#3A3D42,inset_0_-40px_60px_rgba(0,0,0,.25)]">
          <div className={`${doorPanel} inset-x-5.5 top-5.5 h-24`} />
          <div className={`${doorPanel} top-35 left-5.5 h-37.5 w-26`} />
          <div className={`${doorPanel} top-35 right-5.5 h-37.5 w-26`} />
          <div className={`${doorPanel} top-78 left-5.5 h-31 w-26`} />
          <div className={`${doorPanel} top-78 right-5.5 h-31 w-26`} />

          <div className="absolute top-10 left-1/2 flex h-15 w-24 -translate-x-1/2 flex-col items-center justify-center gap-0.5 rounded-[3px] bg-[linear-gradient(160deg,#E6CDA6,#B8956A_55%,#D4B68A)] shadow-[0_2px_4px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,.4)]">
            <span className="text-[28px] leading-none font-extrabold tracking-[.04em] text-[#2A2118]">404</span>
            <span className="text-[7px] font-semibold tracking-[.32em] text-[#4A3B2A]">SUÍTE</span>
          </div>
          <div className="absolute top-29.5 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_40%_35%,#5A6169,#0B0B0C_70%)] shadow-[0_0_0_2px_#B8956A,0_1px_2px_rgba(0,0,0,.6)]" />

          <div className={`${doorHinge} top-5`} />
          <div className={`${doorHinge} bottom-10`} />

          <div className="absolute top-58 right-4 h-17 w-4 rounded-lg bg-[linear-gradient(90deg,#B8956A,#E6CDA6_45%,#9C7A52)] shadow-[0_3px_6px_rgba(0,0,0,.5)]">
            <div className="absolute top-11 left-1/2 h-2.5 w-1 -translate-x-1/2 rounded-xs bg-[#2A2118]" />
          </div>
          <div className="absolute top-62 right-5.5 h-2.5 w-14.5 rounded-[5px_2px_2px_5px] bg-[linear-gradient(180deg,#EBD5B2,#B8956A_60%,#8A6E4B)] shadow-[0_4px_6px_rgba(0,0,0,.5)]" />

          <div className="group absolute top-63.5 right-16.5 z-2 w-30 cursor-grab">
            <div className="pointer-events-none origin-top rotate-5 transition-[rotate] duration-[1.1s] ease-[cubic-bezier(.25,1.7,.45,1)] group-hover:-rotate-12 motion-reduce:transition-none">
              <div className="mx-auto h-6.5 w-px bg-[#B0B4BA]" />
              <div className="mx-auto flex h-44.5 w-26 flex-col items-center rounded-md bg-[linear-gradient(180deg,#F4F4F6,#E2E3E7)] pt-3 text-[#1C2024] shadow-[0_22px_30px_rgba(0,0,0,.55),inset_0_0_0_1px_rgba(0,0,0,.06)]">
                <div className="size-3.5 rounded-full bg-[#1C1D20] shadow-[inset_0_2px_3px_rgba(0,0,0,.6)]" />
                <span className="mt-5 text-[8px] font-semibold tracking-[.32em] text-[#60646C]">FAVOR</span>
                <span className="mt-1.5 text-center text-[19px] leading-[1.05] font-bold italic">
                  Não
                  <br />
                  perturbe
                </span>
                <span className="mt-3.5 mb-3 h-px w-6.5 bg-(--primary)" />
                <span className="text-center text-[8px] leading-[1.7] font-medium tracking-[.2em] text-[#60646C]">
                  ESTE QUARTO
                  <br />
                  NÃO EXISTE
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-2 -bottom-0.5 h-0.75 rounded-xs bg-[#E6CDA6] shadow-[0_0_14px_4px_rgba(212,182,138,.45)]" />
      </div>
    </div>
  );
}
