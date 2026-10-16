import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { LuBell, LuCalendarCheck, LuCircleCheck, LuHistory, LuMapPin, LuStar } from "react-icons/lu";
import { BrandMark } from "@/components/brand-mark";
import { FeaturedRooms } from "@/components/featured-rooms";
import { RoomListing } from "@/components/room-listing";
import { SiteHeader } from "@/components/site-header";
import type { PublicRoomPage } from "@/lib/properties";

const assurances: { icon: IconType; label: string }[] = [
  { icon: LuMapPin, label: "Localização aproximada" },
  { icon: LuCalendarCheck, label: "Disponibilidade por quarto" },
  { icon: LuCircleCheck, label: "Pagamento confirmado pela plataforma" },
  { icon: LuHistory, label: "Renovação com prioridade" },
  { icon: LuStar, label: "Avaliação dos dois lados" },
  { icon: LuBell, label: "Avise-me quando liberar" },
];

const journey: { title: string; text: string; demo: ReactNode }[] = [
  {
    title: "Compare quarto a quarto",
    text: "Cada quarto tem preço, características e calendário próprios. Você vê o que está livre sem perguntar “ainda tem vaga?”.",
    demo: <CalendarDemo />,
  },
  {
    title: "Reserve e pague sem comprovante",
    text: "O anfitrião aceita ou recusa a solicitação. O pagamento é confirmado pela plataforma e a reserva é atualizada automaticamente.",
    demo: <ReservationDemo />,
  },
  {
    title: "Renove a diária com prioridade",
    text: "Durante a estadia, quem está no quarto tem prioridade para confirmar a próxima diária até o horário-limite. Sem renovação, o quarto é liberado.",
    demo: <RenewalDemo />,
  },
];

const ownerBenefits = [
  "Cadastre o imóvel com fotos, vídeo, áreas comuns e regras.",
  "Defina preço, características e agenda para cada quarto.",
  "Aceite ou recuse solicitações de reserva.",
  "Receba os pagamentos e acompanhe cada cobrança.",
];

const sectionShell = "mx-auto w-full max-w-360 px-6 md:px-10 lg:px-12";
const primaryAction = "inline-flex min-h-12 items-center justify-center rounded-2xl bg-(--primary) px-6 text-sm font-bold text-(--on-primary) transition-colors hover:bg-(--primary-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)";
const secondaryAction = "inline-flex min-h-12 items-center justify-center rounded-2xl border border-(--border-strong) px-6 text-sm font-semibold text-(--text-primary) transition-colors hover:bg-(--primary-soft) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)";

export function PublicHome({
  user,
  listing,
  featuredListing,
  favoriteRoomIds,
}: {
  user?: { name: string; roles: string[] };
  listing: PublicRoomPage | null;
  featuredListing: PublicRoomPage | null;
  favoriteRoomIds: string[];
}) {
  const total = (listing?.total ?? 0) + (featuredListing?.total ?? 0);
  const featuredRooms = featuredListing?.items ?? [];
  const announceHref = user ? "/meus-imoveis" : "/cadastro";

  return (
    <>
      <SiteHeader user={user} />

      <main>
        <section id="inicio" className="relative isolate overflow-hidden">
          <Image src="/rooms/room1.png" alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-20 mix-blend-luminosity" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-b from-transparent from-45% to-(--background)/70" />

          <div className={`${sectionShell} flex flex-col items-center pb-32 pt-16 text-center md:pb-44 md:pt-24`}>
            <p className="rounded-full bg-(--primary-soft) px-4 py-1.5 text-sm font-bold text-(--primary-text)">
              {total > 1 ? `${total} quartos disponíveis agora` : "Reserva independente por quarto"}
            </p>
            <h1 className="mt-6 max-w-4xl text-balance text-[2.5rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-(--text-primary) sm:text-6xl lg:text-7xl">
              Encontre o quarto livre sem precisar perguntar.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-(--text-secondary)">
              A DOMUS X reúne imóveis com quartos e suítes reserváveis de forma independente. Veja o que está disponível, reserve, pague e renove a diária em um só lugar.
            </p>
            <div className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
              <a href="#todos" className="inline-flex min-h-13 items-center justify-center rounded-2xl bg-(--primary) px-7 text-base font-bold text-(--on-primary) transition-colors hover:bg-(--primary-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)">
                Ver quartos disponíveis
              </a>
              <a href="#proprietarios" className="inline-flex min-h-13 items-center justify-center rounded-2xl border border-(--border-strong) px-7 text-base font-semibold text-(--text-primary) transition-colors hover:bg-(--primary-soft) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)">
                Quero anunciar meu espaço
              </a>
            </div>
          </div>

          <div aria-hidden="true" className="absolute -bottom-px left-1/2 h-14 w-[140%] -translate-x-1/2 translate-y-1/2 rounded-[50%] bg-(--background) md:h-28" />
        </section>

        <section aria-labelledby="seguranca-titulo" className="pb-16 pt-6 md:pb-20 md:pt-4">
          <div className={sectionShell}>
            <SectionHeading id="seguranca-titulo" title="Discrição e segurança fazem parte do fluxo" text="As páginas públicas mostram só a região do imóvel. O endereço exato não é exposto." />
          </div>
          <div className="marquee mt-10">
            <div className="marquee-track">
              <AssuranceList />
              <AssuranceList duplicate />
            </div>
          </div>
        </section>

        <section id="proprietarios" aria-labelledby="proprietarios-titulo" className={`${sectionShell} scroll-mt-24`}>
          <div className="grid overflow-hidden rounded-[1.75rem] border border-(--primary-border) bg-(--primary-soft) lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
            <div className="px-6 py-10 md:px-10 lg:px-14 lg:py-16">
              <h2 id="proprietarios-titulo" className="max-w-xl text-balance text-3xl font-extrabold leading-[1.1] tracking-[-0.02em] text-(--text-primary) md:text-5xl">Anuncie o imóvel. Alugue cada quarto do seu jeito.</h2>
              <p className="mt-5 max-w-120 text-lg leading-relaxed text-(--text-secondary)">Um único anúncio para o imóvel, com quartos e suítes que você gerencia de forma independente.</p>
              <ul className="mt-8 grid gap-3.5 sm:grid-cols-2 sm:gap-x-8">
                {ownerBenefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3 text-(--text-primary)">
                    <LuCircleCheck aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-(--primary-text)" />
                    <span className="leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link href={announceHref} className="mt-10 inline-flex min-h-12 items-center justify-center rounded-2xl bg-(--primary) px-6 text-sm font-bold text-(--on-primary) transition-colors hover:bg-(--primary-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)">Anunciar meu espaço</Link>
            </div>
            <div className="relative min-h-64 lg:min-h-full">
              <Image src="/rooms/room2.png" alt="Quarto preparado para hóspedes" fill sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" />
            </div>
          </div>
        </section>

        <section id="como-funciona" aria-labelledby="jornada-titulo" className={`${sectionShell} scroll-mt-24 pt-20 md:pt-28`}>
          <SectionHeading id="jornada-titulo" title="Da busca à próxima diária" text="Cada etapa da estadia acontece dentro da plataforma, com o estado da reserva sempre visível." />
          <ol className="mt-10 grid gap-4 md:mt-12 lg:grid-cols-3">
            {journey.map((step, index) => (
              <li key={step.title} className="flex flex-col rounded-2xl bg-(--surface) p-6 md:p-7">
                <div className="flex items-center gap-3.5">
                  <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-(--primary) text-base font-extrabold text-(--on-primary)">{index + 1}</span>
                  <h3 className="text-lg font-bold leading-snug text-(--text-primary)">{step.title}</h3>
                </div>
                <p className="mt-4 leading-relaxed text-(--text-secondary)">{step.text}</p>
                <div aria-hidden="true" className="mt-auto pt-6">
                  <div className="border-t border-(--border) pt-5">{step.demo}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {featuredRooms.length > 0 ? (
          <section aria-labelledby="destaques-titulo" className={`${sectionShell} pt-20 md:pt-28`}>
            <SectionHeading id="destaques-titulo" title="Quartos em destaque" text="Anúncios em evidência na DOMUS X." />
            <FeaturedRooms rooms={featuredRooms} favoriteRoomIds={favoriteRoomIds} signedIn={Boolean(user)} />
          </section>
        ) : null}

        <section id="todos" aria-labelledby="todos-titulo" className={`${sectionShell} scroll-mt-24 pb-20 pt-20 md:pb-28 md:pt-28`}>
          <SectionHeading id="todos-titulo" title="Quartos disponíveis" text={total > 0 ? (total === 1 ? "1 quarto pronto para reserva." : `${total} quartos prontos para reserva.`) : undefined} />
          <RoomListing initial={listing} favoriteRoomIds={favoriteRoomIds} signedIn={Boolean(user)} />
        </section>

        {user ? null : (
          <section aria-labelledby="cta-titulo" className="border-t border-(--border) bg-(--surface)">
            <div className={`${sectionShell} py-16 text-center md:py-20`}>
              <h2 id="cta-titulo" className="mx-auto max-w-xl text-balance text-3xl font-extrabold leading-tight tracking-[-0.02em] text-(--text-primary) md:text-4xl">Sua próxima estadia começa com uma conta.</h2>
              <p className="mx-auto mt-4 max-w-120 leading-relaxed text-(--text-secondary)">Cadastre-se com e-mail ou com sua conta Google.</p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/cadastro" className={primaryAction}>Criar conta</Link>
                <Link href="/login" className={secondaryAction}>Entrar</Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="mb-18 border-t border-(--border) md:mb-0">
        <div className={`${sectionShell} flex flex-col gap-3 py-8 text-sm text-(--text-secondary) sm:flex-row sm:items-center sm:justify-between`}>
          <BrandMark size="sm" />
          <p>© 2026 DOMUS X. Todos os direitos reservados.</p>
        </div>
      </footer>
    </>
  );
}

function SectionHeading({ id, title, text }: { id: string; title: string; text?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 id={id} className="text-balance text-3xl font-extrabold leading-tight tracking-[-0.02em] text-(--text-primary) md:text-[2.75rem]">{title}</h2>
      {text ? <p className="mt-3 text-pretty text-lg leading-relaxed text-(--text-secondary)">{text}</p> : null}
    </div>
  );
}

function AssuranceList({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul aria-hidden={duplicate || undefined} className="marquee-group">
      {assurances.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-3 whitespace-nowrap text-xl font-extrabold tracking-[-0.01em] text-(--text-secondary) md:text-2xl">
          <Icon aria-hidden="true" size={24} className="shrink-0 text-(--primary-text)" />
          {label}
        </li>
      ))}
    </ul>
  );
}

const calendarRows: { room: string; days: boolean[] }[] = [
  { room: "Suíte 1", days: [true, true, false, false, true, true, true] },
  { room: "Suíte 2", days: [false, false, false, true, true, false, true] },
  { room: "Quarto 3", days: [true, false, true, true, true, true, false] },
];

function CalendarDemo() {
  return (
    <div className="flex flex-col gap-2.5">
      {calendarRows.map(({ room, days }) => (
        <div key={room} className="flex items-center gap-3">
          <span className="w-16 shrink-0 text-xs font-semibold text-(--text-secondary)">{room}</span>
          <div className="grid flex-1 grid-cols-7 gap-1">
            {days.map((free, day) => (
              <span key={day} className={`h-6 rounded-md ${free ? "bg-(--success)/35" : "bg-(--text-primary)/6"}`} />
            ))}
          </div>
        </div>
      ))}
      <div className="mt-1 flex gap-4 text-xs text-(--text-secondary)">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-(--success)/35" />Livre</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-(--text-primary)/6" />Ocupado</span>
      </div>
    </div>
  );
}

function ReservationDemo() {
  const stages = [
    { label: "Solicitada", done: true },
    { label: "Aceita pelo anfitrião", done: true },
    { label: "Pagamento confirmado", done: true },
  ];

  return (
    <ul className="flex flex-col gap-3">
      {stages.map(({ label }) => (
        <li key={label} className="flex items-center gap-3 text-sm font-semibold text-(--text-primary)">
          <span className="flex size-6 items-center justify-center rounded-full bg-(--primary) text-(--on-primary)">
            <LuCircleCheck size={14} />
          </span>
          {label}
        </li>
      ))}
    </ul>
  );
}

function RenewalDemo() {
  return (
    <div>
      <p className="text-sm text-(--text-secondary)">Próxima diária da Suíte 1</p>
      <p className="mt-1 text-lg font-bold text-(--text-primary)">Confirme até <span className="tabular-nums">12:00</span></p>
      <span className="mt-4 flex items-center justify-center rounded-2xl bg-(--primary) px-4 py-3 text-sm font-bold text-(--on-primary)">Renovar diária</span>
    </div>
  );
}
