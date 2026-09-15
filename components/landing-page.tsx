"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { IconType } from "react-icons";
import { LuCalendarDays, LuChevronDown, LuClock3, LuHeadphones, LuHeart, LuHistory, LuLockKeyhole, LuMapPin, LuSearch, LuShieldCheck, LuStar, LuUserRound } from "react-icons/lu";

type IconName = "calendar" | "chevronDown" | "clock" | "headset" | "heart" | "history" | "lock" | "pin" | "search" | "shield" | "star" | "starFill" | "user";

const icons: Record<IconName, IconType> = { calendar: LuCalendarDays, chevronDown: LuChevronDown, clock: LuClock3, headset: LuHeadphones, heart: LuHeart, history: LuHistory, lock: LuLockKeyhole, pin: LuMapPin, search: LuSearch, shield: LuShieldCheck, star: LuStar, starFill: LuStar, user: LuUserRound };

const featuredSpaces = [
  { title: "Suíte Premium Asa Norte", region: "Asa Norte · DF", price: "R$ 150", rating: "4.9", image: "/rooms/room1.png" },
  { title: "Loft Moderno Sudoeste", region: "Sudoeste · DF", price: "R$ 140", rating: "4.8", image: "/rooms/room2.png" },
  { title: "Suíte Luxo Lago Sul", region: "Lago Sul · DF", price: "R$ 160", rating: "4.9", image: "/rooms/room3.png" },
  { title: "Suíte Exclusiva Águas Claras", region: "Águas Claras · DF", price: "R$ 130", rating: "4.7", image: "/rooms/room4.png" },
];

const searchFields = [
  { label: "Cidade", placeholder: "Selecione a cidade", options: ["Brasília, DF", "Goiânia, GO", "Todas as regiões"] },
  { label: "Data", placeholder: "Selecione a data", options: ["Hoje", "Amanhã", "Escolher outra data"] },
  { label: "Horário", placeholder: "Qual horário?", options: ["A partir das 14h", "A partir das 18h", "A partir das 20h"] },
  { label: "Duração", placeholder: "Por período", options: ["1 diária", "2 diárias", "Por período"] },
];

export function LandingPage({ user }: { user?: { name: string } }) {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [openField, setOpenField] = useState<string>();
  const [searchValues, setSearchValues] = useState<Record<string, string>>({});
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const router = useRouter();

  async function logout() {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/auth/logout`, { method: "POST", credentials: "include" });
    setProfileMenuOpen(false);
    router.refresh();
  }

  if (!ageConfirmed) {
    return <AgeGate onConfirm={() => setAgeConfirmed(true)} />;
  }

  return (
    <main>
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgba(3,17,40,.85)] backdrop-blur">
        <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center gap-[22px] px-6 md:px-10 lg:px-12">
          <Link href="/" className="inline-flex items-center gap-2 text-base font-extrabold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--blue)] text-sm">D</span>
            DOMUS X
          </Link>
          <div className="flex-1" />
          <nav aria-label="Navegação principal" className="hidden items-center gap-[22px] text-sm font-semibold text-[var(--gray)] md:flex">
            <a href="#inicio" className="text-white">Início</a>
            <span>Favoritos</span>
            <span>Reservas</span>
            <span>Mensagens</span>
          </nav>
          <div className="flex items-center gap-3"><span className="hidden rounded-xl border border-[rgba(11,99,227,.4)] bg-[rgba(11,99,227,.14)] px-[18px] py-2.5 text-[13px] font-semibold text-[var(--blue-light)] lg:block">Anunciar espaço</span>{user ? <div className="relative"><button type="button" aria-label="Abrir menu do perfil" onClick={() => setProfileMenuOpen((open) => !open)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line-strong)] bg-[var(--surface-raised)] text-white"><span className="text-sm font-bold">{user.name.slice(0, 1).toUpperCase()}</span></button>{profileMenuOpen ? <div role="menu" className="absolute right-0 top-12 w-40 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,.35)]"><Link role="menuitem" href="/perfil" className="block rounded-lg px-3 py-2 text-sm font-semibold text-white hover:bg-white/5">Perfil</Link><button role="menuitem" type="button" onClick={() => void logout()} className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[var(--danger)] hover:bg-white/5">Sair</button></div> : null}</div> : <Link href="/login" className="hidden rounded-xl border border-[var(--line-strong)] px-[18px] py-2.5 text-[13px] font-semibold text-white lg:block">Entrar</Link>}</div>
        </div>
      </header>

      <section id="inicio" className="relative overflow-hidden">
        <Image src="/rooms/room1.png" alt="Suíte decorada" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,17,40,.35),rgba(3,17,40,.82)_78%)]" />
        <div className="relative mx-auto flex min-h-[360px] w-full max-w-[1440px] items-center px-6 py-[66px] md:min-h-[420px] md:px-10 md:py-24 lg:px-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-[1.12] text-white sm:text-5xl">Encontre o local ideal de forma <span className="text-[var(--blue-light)]">rápida, segura e discreta.</span></h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--gray)]">Os melhores locais por período, com total privacidade e praticidade para você.</p>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-[52px] w-full max-w-[1440px] px-6 md:px-10 lg:px-12">
        <div className="rounded-2xl bg-white p-2 shadow-[0_24px_60px_rgba(0,0,0,.45)]">
          {searchFields.map((field) => <SearchField key={field.label} {...field} value={searchValues[field.label]} open={openField === field.label} onToggle={() => setOpenField(openField === field.label ? undefined : field.label)} onPick={(value) => { setSearchValues({ ...searchValues, [field.label]: value }); setOpenField(undefined); }} />)}
          <button type="button" className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-[13px] bg-[var(--blue)] px-6 py-[15px] text-sm font-bold text-white transition hover:bg-[var(--blue-light)]"><Icon name="search" size={18} /> Buscar locais</button>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1440px] grid-cols-2 gap-2.5 px-6 pt-[22px] md:grid-cols-4 md:px-10 lg:px-12">
        {[['shield', 'Privacidade total'], ['lock', 'Reservas seguras'], ['star', 'Avaliações reais'], ['headset', 'Suporte dedicado']].map(([icon, label]) => <div key={label} className="rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-3.5 text-center text-[11.5px] font-semibold leading-tight text-white"><div className="mb-2 flex justify-center text-[var(--blue-light)]"><Icon name={icon as IconName} size={22} /></div>{label}</div>)}
      </section>

      <section id="destaques" className="mx-auto w-full max-w-[1440px] px-6 pb-0 pt-7 md:px-10 lg:px-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Locais em destaque</h2>
          </div>
          <span className="text-sm font-semibold text-[var(--blue-light)]">Ver todos</span>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredSpaces.map((space) => <SpaceCard key={space.title} {...space} />)}
        </div>
      </section>

      <section id="como-funciona" className="mx-auto mt-[30px] w-full max-w-[1440px] px-6 py-0 md:px-10 lg:px-12">
        <h2 className="text-[18px] font-bold text-white">Como funciona</h2>
        <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-3.5">
          {[
            ["1", "Busque", "Local, data, horário e duração."], ["2", "Escolha", "Compare fotos, preço e avaliações."], ["3", "Reserve", "Envie sua solicitação com segurança."], ["4", "Acesse", "Tenha uma experiência tranquila."],
          ].map(([number, title, text]) => (
            <div key={number} className="rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-4">
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[rgba(11,99,227,.16)] text-sm font-extrabold text-[var(--blue-light)]">{number}</span>
              <h3 className="mt-2.5 text-sm font-bold text-white">{title}</h3>
              <p className="mt-1 text-[12.5px] leading-snug text-[var(--gray)]">{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto mb-5 mt-[30px] w-full max-w-[1440px] px-6 md:px-10 lg:px-12"><div className="relative overflow-hidden rounded-[18px] bg-[linear-gradient(120deg,#0b3a8f,#0B63E3)] p-6"><div className="absolute -bottom-10 -right-7 h-[180px] w-[180px] rounded-full bg-white/[.08]" /><div className="relative max-w-[440px]"><p className="text-xs font-bold uppercase tracking-[.1em] text-white/70">Para proprietários</p><h2 className="mt-2 text-[22px] font-extrabold leading-tight text-white">Rentabilize seu espaço com segurança</h2><p className="mt-2 text-[13.5px] leading-relaxed text-white/85">Anuncie quartos e suítes. Você controla agenda, preços e privacidade.</p><span className="mt-4 inline-flex rounded-xl bg-white px-[22px] py-[13px] text-sm font-bold text-[var(--blue)]">Anunciar meu espaço</span></div></div></section>
    </main>
  );
}

function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(120%_90%_at_70%_10%,#0b2a5e,#020814_60%)] px-6 text-center">
      <section className="max-w-md">
        <div className="inline-flex items-center gap-2 text-xl font-extrabold text-white"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--blue)] text-sm">D</span>DOMUS X</div>
        <div className="mx-auto my-5 h-1 w-12 rounded-full bg-[var(--blue)]" />
        <h1 className="text-3xl font-extrabold text-white">Você tem 18 anos ou mais?</h1>
        <p className="mt-4 leading-relaxed text-[var(--gray)]">Este ambiente é exclusivo para maiores de idade. Ao continuar, você confirma ter ao menos 18 anos e concorda com nossos termos de privacidade.</p>
        <button type="button" onClick={onConfirm} className="mt-7 w-full rounded-xl bg-[var(--blue)] px-5 py-4 text-sm font-bold text-white transition hover:bg-[var(--blue-light)]">Confirmo — tenho 18 anos ou mais</button>
      </section>
    </main>
  );
}

function SearchField({ label, placeholder, options, value, open, onToggle, onPick }: { label: string; placeholder: string; options: string[]; value?: string; open: boolean; onToggle: () => void; onPick: (value: string) => void }) {
  const icon: Record<string, IconName> = { Cidade: 'pin', Data: 'calendar', Horário: 'clock', Duração: 'history' };
  return <div className="border-b border-[rgba(3,17,40,.08)] last:border-b-0"><button type="button" onClick={onToggle} className="flex w-full items-center gap-3 px-3.5 py-[15px] text-left"><span className="text-[var(--blue)]"><Icon name={icon[label]} size={18} /></span><span className="w-[74px] text-[13px] font-semibold text-[#3a4a63]">{label}</span><span className={value ? 'flex-1 text-sm font-semibold text-[#0f1f39]' : 'flex-1 text-sm font-semibold text-[#8695ab]'}>{value ?? placeholder}</span><span className={open ? 'rotate-180 text-[#8695ab] transition-transform' : 'text-[#8695ab] transition-transform'}><Icon name="chevronDown" size={18} /></span></button>{open ? <div className="flex flex-col gap-1 px-2.5 pb-3">{options.map((option) => <button key={option} type="button" onClick={() => onPick(option)} className="rounded-lg px-3 py-[11px] text-left text-[13.5px] font-semibold text-[#0f1f39] hover:bg-[rgba(11,99,227,.1)]">{option}</button>)}</div> : null}</div>;
}

function SpaceCard({ title, region, price, rating, image }: { title: string; region: string; price: string; rating: string; image: string }) {
  return <article className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
    <div className="relative h-[130px]"><Image src={image} alt="" fill className="object-cover" sizes="(max-width: 640px) 50vw, 25vw" /><span className="absolute left-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(3,17,40,.6)] text-white"><Icon name="heart" size={18} /></span><span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-[rgba(3,17,40,.7)] px-2.5 py-1 text-[11px] font-bold text-white"><Icon name="starFill" size={12} className="text-[var(--warning)]" /> {rating}</span></div>
    <div className="p-4"><h3 className="text-sm font-bold text-white">{title}</h3><p className="mt-1 text-xs text-[var(--gray)]">{region}</p><p className="mt-3 text-xs text-[var(--gray)]">A partir de <strong className="text-sm text-[var(--blue-light)]">{price}</strong> / 2h</p></div>
  </article>;
}

function Icon({ name, size, className }: { name: IconName; size: number; className?: string }) {
  const Component = icons[name];
  return <Component aria-hidden="true" className={className} size={size} fill={name === "starFill" ? "currentColor" : "none"} />;
}
