"use client";

import Image from "next/image";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import type { IconType } from "react-icons";
import { LuCalendarDays, LuChevronDown, LuClock3, LuHeart, LuHistory, LuMapPin, LuSearch, LuStar } from "react-icons/lu";

type IconName = "calendar" | "chevronDown" | "clock" | "heart" | "history" | "pin" | "search" | "starFill";

const icons: Record<IconName, IconType> = { calendar: LuCalendarDays, chevronDown: LuChevronDown, clock: LuClock3, heart: LuHeart, history: LuHistory, pin: LuMapPin, search: LuSearch, starFill: LuStar };

const featuredSpaces = [
  { title: "Suíte Premium Asa Norte", region: "Asa Norte · DF", price: "R$ 150", rating: "4.9", image: "/rooms/room1.png" },
  { title: "Loft Moderno Sudoeste", region: "Sudoeste · DF", price: "R$ 140", rating: "4.8", image: "/rooms/room2.png" },
  { title: "Suíte Luxo Lago Sul", region: "Lago Sul · DF", price: "R$ 160", rating: "4.9", image: "/rooms/room3.png" },
  { title: "Suíte Exclusiva Águas Claras", region: "Águas Claras · DF", price: "R$ 130", rating: "4.7", image: "/rooms/room4.png" },
];

const searchFields: { label: string; placeholder: string; icon: IconName; options: string[] }[] = [
  { label: "Cidade", placeholder: "Selecione a cidade", icon: "pin", options: ["Brasília, DF", "Goiânia, GO", "Todas as regiões"] },
  { label: "Data", placeholder: "Selecione a data", icon: "calendar", options: ["Hoje", "Amanhã", "Escolher outra data"] },
  { label: "Horário", placeholder: "Qual horário?", icon: "clock", options: ["A partir das 14h", "A partir das 18h", "A partir das 20h"] },
  { label: "Duração", placeholder: "Por período", icon: "history", options: ["1 diária", "2 diárias", "Por período"] },
];

const sectionShell = "mx-auto w-full max-w-360 px-6 md:px-10 lg:px-12";

export function UserHome({ user }: { user: { name: string } }) {
  const [openField, setOpenField] = useState<string>();
  const [searchValues, setSearchValues] = useState<Record<string, string>>({});
  const firstName = user.name.trim().split(/\s+/)[0];

  return (
    <>
      <SiteHeader user={user} />

      <main className="pb-18 md:pb-0">
        <section id="inicio" className="relative overflow-hidden">
          <Image src="/rooms/room1.png" alt="" fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,17,40,.45),rgba(3,17,40,.9)_78%)]" />
          <div className={`${sectionShell} relative pb-24 pt-12 md:pb-28 md:pt-20`}>
            <p className="text-base font-semibold text-(--gray)">Olá, {firstName}</p>
            <h1 className="mt-2 max-w-2xl text-balance text-4xl font-extrabold leading-[1.1] tracking-[-0.02em] text-white sm:text-5xl">Onde vai ser a sua próxima estadia?</h1>
          </div>
        </section>

        <section aria-label="Buscar locais" className={`${sectionShell} relative z-10 -mt-14`}>
          <div className="grid rounded-2xl bg-white p-2 shadow-[0_24px_60px_rgba(0,0,0,.45)] md:grid-cols-[repeat(4,minmax(0,1fr))_auto] md:items-center">
            {searchFields.map((field) => (
              <SearchField
                key={field.label}
                {...field}
                value={searchValues[field.label]}
                open={openField === field.label}
                onToggle={() => setOpenField(openField === field.label ? undefined : field.label)}
                onPick={(value) => {
                  setSearchValues({ ...searchValues, [field.label]: value });
                  setOpenField(undefined);
                }}
              />
            ))}
            <button type="button" className="mt-1.5 flex items-center justify-center gap-2 rounded-[13px] bg-(--blue) px-6 py-3.75 text-sm font-bold text-white transition hover:bg-(--blue-light) md:mt-0 md:h-full"><Icon name="search" size={18} /> Buscar locais</button>
          </div>
        </section>

        <section id="destaques" aria-labelledby="destaques-titulo" className={`${sectionShell} pt-14 md:pt-16`}>
          <div className="flex items-end justify-between gap-4">
            <h2 id="destaques-titulo" className="text-2xl font-extrabold text-white">Locais em destaque</h2>
            <span className="text-sm font-semibold text-(--blue-light)">Ver todos</span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredSpaces.map((space) => <SpaceCard key={space.title} {...space} />)}
          </div>
        </section>

        <section aria-labelledby="proprietarios-titulo" className={`${sectionShell} pb-12 pt-14 md:pb-16 md:pt-16`}>
          <div className="relative overflow-hidden rounded-[18px] bg-[linear-gradient(120deg,#0b3a8f,#0B63E3)] p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-8">
            <div className="absolute -bottom-10 -right-7 size-45 rounded-full bg-white/8" />
            <div className="relative max-w-110">
              <h2 id="proprietarios-titulo" className="text-[22px] font-extrabold leading-tight text-white">Rentabilize seu espaço com segurança</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-white/85">Anuncie quartos e suítes. Você controla agenda, preços e privacidade.</p>
            </div>
            <span className="relative mt-5 inline-flex shrink-0 rounded-xl bg-white px-5.5 py-3.25 text-sm font-bold text-(--blue) md:mt-0">Anunciar meu espaço</span>
          </div>
        </section>
      </main>
    </>
  );
}

function SearchField({ label, placeholder, icon, options, value, open, onToggle, onPick }: { label: string; placeholder: string; icon: IconName; options: string[]; value?: string; open: boolean; onToggle: () => void; onPick: (value: string) => void }) {
  return <div className="relative border-b border-[rgba(3,17,40,.08)] md:border-b-0 md:border-r md:last-of-type:border-r-0"><button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 px-3.5 py-3.75 text-left md:flex-wrap md:gap-x-2 md:gap-y-0.5 md:py-3"><span className="text-(--blue)"><Icon name={icon} size={18} /></span><span className="w-18.5 text-[13px] font-semibold text-[#3a4a63] md:w-auto">{label}</span><span className={`flex-1 truncate text-sm font-semibold md:order-last md:basis-full ${value ? "text-[#0f1f39]" : "text-[#8695ab]"}`}>{value ?? placeholder}</span><span className={open ? "rotate-180 text-[#8695ab] transition-transform md:ml-auto" : "text-[#8695ab] transition-transform md:ml-auto"}><Icon name="chevronDown" size={18} /></span></button>{open ? <div className="absolute inset-x-2.5 top-[calc(100%-4px)] z-20 flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-2.5 shadow-[0_16px_32px_rgba(3,17,40,.2)] md:min-w-50">{options.map((option) => <button key={option} type="button" onClick={() => onPick(option)} className="rounded-lg px-3 py-2.75 text-left text-[13.5px] font-semibold text-[#0f1f39] hover:bg-[rgba(11,99,227,.1)]">{option}</button>)}</div> : null}</div>;
}

function SpaceCard({ title, region, price, rating, image }: { title: string; region: string; price: string; rating: string; image: string }) {
  return <article className="overflow-hidden rounded-2xl border border-(--line) bg-(--surface)">
    <div className="relative aspect-4/3"><Image src={image} alt="" fill className="object-cover" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" /><span className="absolute left-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-[rgba(3,17,40,.6)] text-white"><Icon name="heart" size={18} /></span><span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-[rgba(3,17,40,.7)] px-2.5 py-1 text-[11px] font-bold text-white"><Icon name="starFill" size={12} className="text-(--warning)" /> {rating}</span></div>
    <div className="p-4"><h3 className="text-sm font-bold text-white">{title}</h3><p className="mt-1 text-xs text-(--gray)">{region}</p><p className="mt-3 text-xs text-(--gray)">A partir de <strong className="text-sm text-(--blue-light)">{price}</strong> / 2h</p></div>
  </article>;
}

function Icon({ name, size, className }: { name: IconName; size: number; className?: string }) {
  const Component = icons[name];
  return <Component aria-hidden="true" className={className} size={size} fill={name === "starFill" ? "currentColor" : "none"} />;
}
