import Image from "next/image";
import Link from "next/link";
import type { IconType } from "react-icons";
import { LuBedDouble, LuBell, LuCalendarCheck, LuCircleCheck, LuHistory, LuHouse, LuListChecks, LuMapPin, LuStar } from "react-icons/lu";
import { FeaturedRooms } from "@/components/featured-rooms";
import { HomeTabs, type HomeTab } from "@/components/home-tabs";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { PublicRoomCard, PublicRoomPage } from "@/lib/properties";

const assurances: { icon: IconType; label: string }[] = [
  { icon: LuMapPin, label: "Localização aproximada" },
  { icon: LuCalendarCheck, label: "Disponibilidade por quarto" },
  { icon: LuCircleCheck, label: "Pagamento confirmado pela plataforma" },
  { icon: LuHistory, label: "Renovação com prioridade" },
  { icon: LuStar, label: "Avaliação dos dois lados" },
  { icon: LuBell, label: "Avise-me quando liberar" },
];

const journey = [
  { title: "Compare quarto a quarto", text: "Cada quarto tem preço, características e calendário próprios.", demo: <CalendarDemo /> },
  { title: "Reserve e pague sem comprovante", text: "O anfitrião aceita ou recusa. O pagamento é confirmado pela plataforma.", demo: <ReservationDemo /> },
  { title: "Renove a diária com prioridade", text: "Quem está no quarto confirma a próxima diária até o horário-limite.", demo: <RenewalDemo /> },
];

const ownerBenefits = [
  "Cadastre o imóvel com fotos, vídeo, áreas comuns e regras.",
  "Defina preço, características e agenda para cada quarto.",
  "Aceite ou recuse solicitações de reserva.",
  "Receba os pagamentos e acompanhe cada cobrança.",
];

const actionFocus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)";

export function PublicHome({
  user,
  listing,
  featuredListing,
  favoriteRoomIds,
}: {
  user: { name: string; roles: string[] };
  listing: PublicRoomPage | null;
  featuredListing: PublicRoomPage | null;
  favoriteRoomIds: string[];
}) {
  const total = (listing?.total ?? 0) + (featuredListing?.total ?? 0);
  const featuredRooms = featuredListing?.items ?? [];

  const tabs: HomeTab[] = [
    ...(featuredRooms.length > 0
      ? [
          {
            id: "destaques",
            label: "Em destaque",
            icon: <LuStar aria-hidden="true" size={16} />,
            panel: <RoomsPanel summary="Anúncios em evidência na DOMUS X." rooms={featuredRooms} favoriteRoomIds={favoriteRoomIds} />,
          },
        ]
      : []),
    {
      id: "disponiveis",
      label: "Disponíveis",
      icon: <LuBedDouble aria-hidden="true" size={16} />,
      panel: (
        <RoomsPanel
          summary={
            !listing
              ? "Não foi possível carregar os quartos agora. Tente novamente em alguns instantes."
              : listing.items.length === 0
                ? "Nenhum quarto disponível no momento."
                : "Quartos prontos para reserva."
          }
          rooms={listing?.items ?? []}
          favoriteRoomIds={favoriteRoomIds}
        />
      ),
    },
    { id: "como-funciona", label: "Como funciona", icon: <LuListChecks aria-hidden="true" size={16} />, panel: <JourneyPanel /> },
    { id: "anunciar", label: "Anunciar", icon: <LuHouse aria-hidden="true" size={16} />, panel: <OwnerPanel /> },
  ];

  return (
    <div className="flex flex-1 flex-col screenfit:h-dvh screenfit:flex-none">
      <SiteHeader user={user} />

      <main className="mx-auto flex min-h-0 w-full max-w-360 flex-1 flex-col gap-3 px-6 py-3 short:max-sm:gap-2 short:max-sm:py-2 md:gap-6 md:px-10 md:py-6 short:md:gap-4 short:md:py-4 lg:px-12">
        <HomeTabs tabs={tabs}>
          <div>
            <h1 className="text-balance text-[1.375rem] short:max-sm:text-xl font-extrabold leading-tight tracking-[-0.02em] text-(--text-primary) sm:text-2xl md:text-3xl">
              Encontre o quarto livre sem precisar perguntar.
            </h1>
            <p className="mt-1 text-sm text-(--text-secondary) short:max-sm:hidden">
              {total > 1 ? `${total} quartos disponíveis agora.` : "Reserva independente por quarto."}
            </p>
          </div>
        </HomeTabs>
      </main>

      <SiteFooter />
    </div>
  );
}

function RoomsPanel({ summary, rooms, favoriteRoomIds }: { summary: string; rooms: PublicRoomCard[]; favoriteRoomIds: string[] }) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm text-(--text-secondary)">{summary}</p>
        <Link href="/anuncios" className={`shrink-0 text-sm font-bold text-(--primary-text) underline underline-offset-2 ${actionFocus}`}>
          Ver todos os anúncios
        </Link>
      </div>
      {rooms.length > 0 ? <FeaturedRooms rooms={rooms} favoriteRoomIds={favoriteRoomIds} signedIn fill className="mt-3 md:mt-4" /> : null}
    </>
  );
}

function JourneyPanel() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 short:max-sm:gap-2 md:gap-6 short:md:gap-4">
      <ol className="grid min-h-0 flex-1 divide-y divide-(--border) rounded-2xl border border-(--border-accent) bg-(--surface) [scrollbar-width:none] rail:snap-x rail:snap-mandatory rail:auto-cols-[84%] rail:grid-flow-col rail:grid-rows-[auto_1fr] rail:divide-x rail:divide-y-0 rail:overflow-x-auto md:grid-cols-3 md:grid-rows-[auto_1fr] md:divide-x md:divide-y-0 rows:grid-cols-1! rows:grid-rows-none! rows:divide-x-0! rows:divide-y! [&::-webkit-scrollbar]:hidden">
        {journey.map((step, index) => (
          <li
            key={step.title}
            className="flex min-h-0 flex-col justify-center px-4 py-2 short:max-sm:py-1 rail:row-span-2 rail:grid rail:snap-start rail:grid-rows-subgrid rail:p-4 short:rail:p-3.5 md:row-span-2 md:grid md:grid-rows-subgrid md:p-4 lg:p-5 short:lg:p-3.5 rows:row-span-1! rows:flex! rows:flex-row! rows:items-stretch rows:justify-center! rows:gap-6 rows:py-3!"
          >
            <div className="flex items-center gap-3 rail:items-start md:max-lg:flex-col md:max-lg:items-start md:max-lg:gap-2 lg:items-start lg:gap-3.5 rows:flex-1 rows:flex-row! rows:self-center rows:gap-3.5!">
              <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-(--primary) text-sm font-extrabold text-(--on-primary) sm:size-8">
                {index + 1}
              </span>
              <div>
                <h2 className="text-[15px] font-bold leading-snug text-(--text-primary) sm:text-base">{step.title}</h2>
                <p className="mt-1 text-[13px] leading-relaxed text-(--text-secondary) sm:text-sm [@media(max-height:39.99rem)]:max-md:hidden">{step.text}</p>
              </div>
            </div>
            <div aria-hidden="true" className="mt-3 short:rail:mt-2 hidden min-h-29 short:rail:min-h-27 flex-1 items-center justify-center overflow-hidden rounded-xl bg-(--surface-accent) px-4 py-2.5 short:py-1.5 demo:flex screenfit:min-h-0 md:max-lg:mt-2 md:max-lg:py-1.5 lg:mt-4 short:lg:mt-2 xl:tall:py-4 rows:mt-0!">
              <div className="w-full max-w-64 rail:sm:tall:scale-125 short:lg:scale-90 2xl:tall:scale-125 2xl:[@media(min-height:60rem)]:scale-[1.45]">{step.demo}</div>
            </div>
          </li>
        ))}
      </ol>

      <section aria-label="Garantias da plataforma" className="marquee">
        <div className="marquee-track">
          <AssuranceList />
          <AssuranceList duplicate />
        </div>
      </section>
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
    <div className="flex flex-col gap-2">
      {calendarRows.map(({ room, days }) => (
        <div key={room} className="flex items-center gap-3">
          <span className="w-16 shrink-0 text-xs font-semibold text-(--text-secondary) md:max-lg:w-13">{room}</span>
          <div className="grid flex-1 grid-cols-7 gap-1">
            {days.map((free, day) => (
              <span key={day} className={`h-5 rounded-md ${free ? "bg-(--success)/35" : "bg-(--text-primary)/8"}`} />
            ))}
          </div>
        </div>
      ))}
      <div className="mt-1 flex gap-4 text-xs text-(--text-secondary) short:max-md:hidden">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-(--success)/35" />Livre</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-(--text-primary)/8" />Ocupado</span>
      </div>
    </div>
  );
}

function ReservationDemo() {
  return (
    <ul className="flex flex-col gap-2.5">
      {["Solicitada", "Aceita pelo anfitrião", "Pagamento confirmado"].map((label) => (
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
      <p className="mt-0.5 text-base font-bold text-(--text-primary)">Confirme até <span className="tabular-nums">12:00</span></p>
      <span className="mt-3 flex items-center justify-center rounded-xl bg-(--primary) px-4 py-2.5 text-sm font-bold text-(--on-primary)">Renovar diária</span>
    </div>
  );
}

function OwnerPanel() {
  return (
    <div className="grid flex-1 overflow-hidden rounded-[1.75rem] border border-(--primary-border) bg-(--primary-soft) lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
      <div className="flex flex-col justify-center px-5 py-5 md:px-10 lg:px-12 xl:px-14">
        <div className="@container">
          <h2 className="text-[clamp(0.8125rem,6.2cqi,3rem)] font-extrabold leading-[1.1] tracking-[-0.02em] text-(--text-primary)">
            <span className="block">Anuncie o imóvel.</span>
            <span className="block">Alugue cada quarto do seu jeito.</span>
          </h2>
        </div>
        <p className="mt-3 hidden max-w-140 leading-relaxed text-(--text-secondary) sm:tall:block 2xl:text-lg">
          Um único anúncio para o imóvel, com quartos e suítes que você gerencia de forma independente.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 sm:gap-x-8 2xl:mt-6 2xl:gap-y-3">
          {ownerBenefits.map((benefit) => (
            <li key={benefit} className="flex gap-2.5 text-sm text-(--text-primary) 2xl:text-base">
              <LuCircleCheck aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-(--primary-text)" />
              <span className="leading-relaxed">{benefit}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/meus-imoveis"
          className={`mt-5 inline-flex min-h-12 items-center justify-center self-start rounded-2xl bg-(--primary) px-6 text-sm font-bold text-(--on-primary) transition-colors hover:bg-(--primary-hover) 2xl:mt-8 ${actionFocus}`}
        >
          Anunciar meu espaço
        </Link>
      </div>
      <div className="relative hidden lg:block">
        <Image src="/rooms/room2.png" alt="Quarto preparado para hóspedes" fill sizes="42vw" className="object-cover" />
      </div>
    </div>
  );
}
