import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { LuBell, LuCalendarCheck, LuCircleCheck, LuMapPin, LuMessageSquareOff, LuSearch, LuStar } from "react-icons/lu";
import { BrandMark } from "@/components/brand-mark";

type RoomStatus = "free" | "renewing" | "soon";

const sampleRooms: { name: string; details: string; price: string; status: RoomStatus; statusLabel: string }[] = [
  { name: "Suíte 1", details: "Cama queen · banheiro privativo", price: "R$ 150", status: "free", statusLabel: "Livre hoje" },
  { name: "Suíte 2", details: "Varanda · ar-condicionado", price: "R$ 170", status: "renewing", statusLabel: "Renovação até 12h" },
  { name: "Quarto 3", details: "Cama de solteiro · escrivaninha", price: "R$ 110", status: "soon", statusLabel: "Livre amanhã" },
];

const statusStyles: Record<RoomStatus, string> = {
  free: "bg-[rgba(47,191,135,.14)] text-(--success)",
  renewing: "bg-[rgba(232,177,58,.14)] text-(--warning)",
  soon: "bg-[rgba(58,131,240,.16)] text-(--blue-light)",
};

const journey: { title: string; text: string; demo: ReactNode }[] = [
  {
    title: "Busque do seu jeito",
    text: "Filtre por cidade, datas, tipo de acomodação, preço e características.",
    demo: <SearchDemo />,
  },
  {
    title: "Compare quarto a quarto",
    text: "Cada quarto tem preço, características e calendário próprios. Você vê o que está livre sem perguntar “ainda tem vaga?”.",
    demo: <CalendarDemo />,
  },
  {
    title: "Solicite a reserva",
    text: "A disponibilidade é conferida na hora e o anfitrião aceita ou recusa. Você acompanha cada etapa pela plataforma.",
    demo: <ReservationDemo />,
  },
  {
    title: "Pague sem enviar comprovante",
    text: "O pagamento é confirmado pela plataforma de pagamentos e a reserva é atualizada automaticamente.",
    demo: <PaymentDemo />,
  },
  {
    title: "Renove a diária com prioridade",
    text: "Durante a estadia, quem está no quarto tem prioridade para confirmar a próxima diária até o horário-limite. Sem renovação, o quarto é liberado.",
    demo: <RenewalDemo />,
  },
];

const assurances: { icon: IconType; title: string; text: string }[] = [
  { icon: LuMapPin, title: "Localização aproximada", text: "As páginas públicas mostram só a região do imóvel. O endereço exato não é exposto." },
  { icon: LuStar, title: "Avaliação dos dois lados", text: "Hóspedes e anfitriões se avaliam, e a reputação fica visível para todos." },
  { icon: LuBell, title: "Avise-me quando liberar", text: "Quarto ocupado? Peça um alerta e saiba quando ele ficar disponível." },
];

const ownerBenefits = [
  "Cadastre o imóvel com fotos, vídeo, áreas comuns e regras.",
  "Defina preço, características e agenda para cada quarto.",
  "Aceite ou recuse solicitações de reserva.",
  "Receba os pagamentos e acompanhe cada cobrança.",
];

const primaryAction = "inline-flex items-center justify-center rounded-xl bg-(--blue) px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-(--blue-light)";
const secondaryAction = "inline-flex items-center justify-center rounded-xl border border-(--line-strong) px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/5";

export function PublicHome() {
  return (
    <>
      <PublicHeader />

      <main>
        <section className="relative isolate overflow-hidden">
          <Image src="/rooms/room1.png" alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,17,40,.96)_0%,rgba(3,17,40,.86)_45%,rgba(3,17,40,.55)_100%),linear-gradient(0deg,var(--navy),transparent_40%)]" />

          <div className="mx-auto grid w-full max-w-360 items-center gap-12 px-6 pb-16 pt-12 md:px-10 md:pt-16 lg:min-h-[calc(100svh-72px)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:gap-16 lg:px-12 lg:py-20">
            <div className="max-w-160">
              <h1 className="text-balance text-[2.5rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl">
                Encontre o quarto livre <span className="text-(--blue-light)">sem precisar perguntar.</span>
              </h1>
              <p className="mt-6 max-w-136 text-pretty text-lg leading-relaxed text-(--gray)">
                A DOMUS X reúne imóveis com quartos e suítes reserváveis de forma independente. Veja o que está disponível, reserve, pague e renove a diária em um só lugar.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/cadastro" className={primaryAction}>Criar conta</Link>
                <a href="#proprietarios" className={secondaryAction}>Quero anunciar meu espaço</a>
              </div>
              <p className="mt-5 text-sm text-(--gray)">
                Já tem conta? <Link href="/login" className="font-semibold text-white underline decoration-(--blue-light) underline-offset-4">Entrar</Link>
              </p>
            </div>

            <PropertyPreview />
          </div>
        </section>

        <section aria-labelledby="problema-titulo" className="border-y border-(--line) bg-(--surface)">
          <div className="mx-auto grid w-full max-w-360 gap-8 px-6 py-14 md:grid-cols-2 md:gap-16 md:px-10 lg:px-12 lg:py-20">
            <div className="flex gap-4">
              <LuMessageSquareOff aria-hidden="true" size={28} className="mt-1 shrink-0 text-(--gray)" />
              <div>
                <h2 id="problema-titulo" className="text-xl font-bold text-white">Chega de caçar vaga em mensagens</h2>
                <p className="mt-2 max-w-lg leading-relaxed text-(--gray)">Hoje, descobrir se um quarto está livre depende de WhatsApp, Stories e conversas privadas, sem histórico e sem garantia.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <LuCalendarCheck aria-hidden="true" size={28} className="mt-1 shrink-0 text-(--blue-light)" />
              <div>
                <h2 className="text-xl font-bold text-white">Tudo rastreável em um só lugar</h2>
                <p className="mt-2 max-w-lg leading-relaxed text-(--gray)">Descoberta, disponibilidade, reserva, pagamento, renovação e alertas ficam registrados na plataforma, para hóspede e anfitrião.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" aria-labelledby="jornada-titulo" className="mx-auto w-full max-w-360 scroll-mt-20 px-6 py-20 md:px-10 lg:px-12 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 id="jornada-titulo" className="text-balance text-3xl font-extrabold leading-tight tracking-[-0.02em] text-white md:text-4xl">Da busca à próxima diária</h2>
              <p className="mt-4 leading-relaxed text-(--gray)">Cada etapa da estadia acontece dentro da plataforma, com o estado da reserva sempre visível.</p>
              <Link href="/cadastro" className={`${primaryAction} mt-8 hidden lg:inline-flex`}>Começar agora</Link>
            </div>

            <ol className="relative flex flex-col gap-14 before:absolute before:bottom-4 before:left-4.75 before:top-4 before:w-px before:bg-(--line-strong) md:gap-16">
              {journey.map((step, index) => (
                <li key={step.title} className="relative grid gap-5 pl-16 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:gap-10">
                  <span aria-hidden="true" className="absolute left-0 top-0 flex size-10 items-center justify-center rounded-full border border-(--line-strong) bg-(--navy) text-sm font-extrabold text-(--blue-light)">{index + 1}</span>
                  <div className="pt-1.5">
                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                    <p className="mt-2 max-w-120 leading-relaxed text-(--gray)">{step.text}</p>
                  </div>
                  <div aria-hidden="true" className="rounded-2xl border border-(--line) bg-(--surface) p-4">{step.demo}</div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="seguranca-titulo" className="bg-(--surface)">
          <div className="mx-auto w-full max-w-360 px-6 py-20 md:px-10 lg:px-12">
            <h2 id="seguranca-titulo" className="max-w-xl text-balance text-3xl font-extrabold leading-tight tracking-[-0.02em] text-white">Discrição e segurança fazem parte do fluxo</h2>
            <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {assurances.map(({ icon: Icon, title, text }) => (
                <li key={title} className="border-t border-(--line-strong) pt-6">
                  <Icon aria-hidden="true" size={24} className="text-(--blue-light)" />
                  <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2 leading-relaxed text-(--gray)">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="proprietarios" aria-labelledby="proprietarios-titulo" className="mx-auto w-full max-w-360 scroll-mt-20 px-6 py-20 md:px-10 lg:px-12 lg:py-28">
          <div className="grid items-center gap-12 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(120deg,#0b3a8f,var(--blue))] lg:grid-cols-2 lg:gap-0">
            <div className="relative min-h-64 lg:order-2 lg:h-full lg:min-h-128">
              <Image src="/rooms/room2.png" alt="Quarto preparado para hóspedes" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="px-6 pb-10 md:px-10 lg:px-14 lg:py-16">
              <h2 id="proprietarios-titulo" className="text-balance text-3xl font-extrabold leading-tight tracking-[-0.02em] text-white md:text-4xl">Anuncie o imóvel. Alugue cada quarto do seu jeito.</h2>
              <p className="mt-4 max-w-120 leading-relaxed text-white/85">Um único anúncio para o imóvel, com quartos e suítes que você gerencia de forma independente.</p>
              <ul className="mt-8 flex flex-col gap-3.5">
                {ownerBenefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3 text-white">
                    <LuCircleCheck aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-white/80" />
                    <span className="leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" className="mt-10 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-(--blue) transition-colors hover:bg-(--white)">Anunciar meu espaço</Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="cta-titulo" className="mx-auto w-full max-w-360 px-6 pb-24 text-center md:px-10 lg:px-12">
          <h2 id="cta-titulo" className="mx-auto max-w-xl text-balance text-3xl font-extrabold leading-tight tracking-[-0.02em] text-white md:text-4xl">Sua próxima estadia começa com uma conta.</h2>
          <p className="mx-auto mt-4 max-w-120 leading-relaxed text-(--gray)">Cadastre-se com e-mail ou com sua conta Google.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/cadastro" className={primaryAction}>Criar conta</Link>
            <Link href="/login" className={secondaryAction}>Entrar</Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-(--line)">
        <div className="mx-auto flex w-full max-w-360 flex-col gap-3 px-6 py-8 text-sm text-(--gray) sm:flex-row sm:items-center sm:justify-between md:px-10 lg:px-12">
          <BrandMark size="sm" />
          <p>© 2026 DOMUS X. Todos os direitos reservados.</p>
        </div>
      </footer>
    </>
  );
}

function PublicHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-(--line) bg-[rgba(3,17,40,.85)] backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-360 items-center gap-6 px-6 md:h-18 md:px-10 lg:px-12">
        <BrandMark size="md" href="/" />
        <nav aria-label="Navegação principal" className="ml-auto hidden items-center gap-7 text-sm font-semibold text-(--gray) md:flex">
          <a href="#como-funciona" className="transition-colors hover:text-white">Como funciona</a>
          <a href="#proprietarios" className="transition-colors hover:text-white">Para proprietários</a>
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link href="/login" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/5">Entrar</Link>
          <Link href="/cadastro" className="hidden rounded-xl bg-(--blue) px-4.5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-(--blue-light) sm:inline-flex">Criar conta</Link>
        </div>
      </div>
    </header>
  );
}

function PropertyPreview() {
  return (
    <figure className="w-full max-w-120 justify-self-center overflow-hidden rounded-3xl border border-(--line-strong) bg-[rgba(15,31,57,.92)] shadow-[0_32px_80px_rgba(0,0,0,.45)] backdrop-blur lg:justify-self-end">
      <div className="relative h-40">
        <Image src="/rooms/room3.png" alt="Suíte de um imóvel de exemplo" fill sizes="(min-width: 1024px) 30rem, 100vw" className="object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-[rgba(3,17,40,.75)] px-3 py-1 text-xs font-semibold text-white">Exemplo ilustrativo</span>
      </div>
      <div className="p-5">
        <p className="text-lg font-bold text-white">Casa Jardim · 3 quartos</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-(--gray)"><LuMapPin aria-hidden="true" size={14} />Asa Sul, Brasília · região aproximada</p>
        <ul className="mt-5 flex flex-col divide-y divide-(--line)">
          {sampleRooms.map((room, index) => (
            <li key={room.name} className={`public-home-room flex items-center gap-3 py-3.5 public-home-room-${index + 1}`}>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{room.name}</p>
                <p className="truncate text-sm text-(--gray)">{room.details}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[room.status]}`}>{room.statusLabel}</span>
                <span className="text-sm text-(--gray)"><strong className="font-bold text-white tabular-nums">{room.price}</strong> / diária</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="border-t border-(--line) px-5 py-3.5 text-sm text-(--gray)">Um imóvel, vários quartos: cada um com preço e agenda próprios.</figcaption>
    </figure>
  );
}

function SearchDemo() {
  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-3 text-sm font-semibold text-[#3a4a63]">
        <LuSearch size={16} className="text-(--blue)" />Brasília, DF
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {["12–14 out", "Suíte", "Até R$ 200", "Banheiro privativo"].map((filter) => (
          <span key={filter} className="rounded-full border border-(--line-strong) px-3 py-1.5 text-xs font-semibold text-white">{filter}</span>
        ))}
      </div>
    </div>
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
          <span className="w-16 shrink-0 text-xs font-semibold text-(--gray)">{room}</span>
          <div className="grid flex-1 grid-cols-7 gap-1">
            {days.map((free, day) => (
              <span key={day} className={`h-6 rounded-md ${free ? "bg-[rgba(47,191,135,.35)]" : "bg-white/6"}`} />
            ))}
          </div>
        </div>
      ))}
      <div className="mt-1 flex gap-4 text-xs text-(--gray)">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-[rgba(47,191,135,.35)]" />Livre</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-white/6" />Ocupado</span>
      </div>
    </div>
  );
}

function ReservationDemo() {
  const stages = [
    { label: "Solicitada", done: true },
    { label: "Aceita pelo anfitrião", done: true },
    { label: "Aguardando pagamento", done: false },
  ];

  return (
    <ul className="flex flex-col gap-3">
      {stages.map(({ label, done }) => (
        <li key={label} className="flex items-center gap-3 text-sm font-semibold">
          <span className={`flex size-6 items-center justify-center rounded-full ${done ? "bg-(--blue) text-white" : "border border-dashed border-(--line-strong)"}`}>
            {done ? <LuCircleCheck size={14} /> : null}
          </span>
          <span className={done ? "text-white" : "text-(--gray)"}>{label}</span>
        </li>
      ))}
    </ul>
  );
}

function PaymentDemo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-white/4 px-3.5 py-3 text-sm">
        <span className="text-(--gray)">Suíte 1 · 2 diárias</span>
        <strong className="font-bold text-white tabular-nums">R$ 300</strong>
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold text-(--success)">
        <LuCircleCheck size={18} />Pagamento confirmado · reserva confirmada
      </div>
    </div>
  );
}

function RenewalDemo() {
  return (
    <div>
      <p className="text-sm text-(--gray)">Próxima diária da Suíte 1</p>
      <p className="mt-1 text-lg font-bold text-white">Confirme até <span className="tabular-nums">12:00</span></p>
      <span className="mt-4 flex items-center justify-center rounded-xl bg-(--blue) px-4 py-3 text-sm font-bold text-white">Renovar diária</span>
    </div>
  );
}
