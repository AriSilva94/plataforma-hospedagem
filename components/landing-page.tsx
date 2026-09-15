"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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

export function LandingPage() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [openField, setOpenField] = useState<string>();
  const [searchValues, setSearchValues] = useState<Record<string, string>>({});

  if (!ageConfirmed) {
    return <AgeGate onConfirm={() => setAgeConfirmed(true)} />;
  }

  return (
    <main>
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[rgba(3,17,40,.92)] backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-base font-extrabold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--blue)] text-sm">D</span>
            DOMUS X
          </Link>
          <nav aria-label="Navegação principal" className="hidden items-center gap-6 text-sm font-semibold text-[var(--gray)] lg:flex">
            <a href="#inicio" className="text-white">Início</a>
            <span>Favoritos</span>
            <span>Reservas</span>
            <span>Mensagens</span>
          </nav>
          <div className="flex items-center gap-3"><span className="hidden rounded-xl border border-[rgba(11,99,227,.4)] bg-[rgba(11,99,227,.14)] px-4 py-2.5 text-sm font-bold text-[var(--blue-light)] lg:block">Anunciar espaço</span><Link href="/login" className="hidden text-sm font-semibold text-white sm:block">Entrar</Link><Link href="/cadastro" aria-label="Perfil" className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line-strong)] bg-[var(--surface-raised)] text-sm font-bold text-white">P</Link></div>
        </div>
      </header>

      <section id="inicio" className="relative overflow-hidden">
        <Image src="/rooms/room1.png" alt="Suíte decorada" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,17,40,.35),rgba(3,17,40,.82)_78%)]" />
        <div className="relative mx-auto flex min-h-[360px] max-w-6xl items-center px-5 py-16 sm:px-8 md:min-h-[420px]">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-[1.12] text-white sm:text-5xl">Encontre o local ideal de forma <span className="text-[var(--blue-light)]">rápida, segura e discreta.</span></h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--gray)]">Os melhores locais por período, com total privacidade e praticidade para você.</p>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-5 sm:px-8">
        <div className="rounded-2xl bg-white p-2 shadow-[0_24px_60px_rgba(0,0,0,.45)]">
          {searchFields.map((field) => <SearchField key={field.label} {...field} value={searchValues[field.label]} open={openField === field.label} onToggle={() => setOpenField(openField === field.label ? undefined : field.label)} onPick={(value) => { setSearchValues({ ...searchValues, [field.label]: value }); setOpenField(undefined); }} />)}
          <button type="button" className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--blue)] px-6 py-4 text-sm font-bold text-white transition hover:bg-[var(--blue-light)]">⌕ Buscar locais</button>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-5 pt-6 sm:px-8 md:grid-cols-4">
        {["Privacidade total", "Reservas seguras", "Avaliações reais", "Suporte dedicado"].map((label) => <div key={label} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-center text-sm font-semibold text-white"><div className="mb-2 text-xl text-[var(--blue-light)]">✦</div>{label}</div>)}
      </section>

      <section id="destaques" className="mx-auto max-w-6xl px-5 pb-8 pt-8 sm:px-8">
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

      <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <h2 className="text-2xl font-extrabold text-white">Como funciona</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["1", "Busque", "Local, data, horário e duração."], ["2", "Escolha", "Compare fotos, preço e avaliações."], ["3", "Reserve", "Envie sua solicitação com segurança."], ["4", "Acesse", "Tenha uma experiência tranquila."],
          ].map(([number, title, text]) => (
            <div key={number} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-raised)] p-6">
              <span className="text-sm font-extrabold text-[var(--blue-light)]">{number}</span>
              <h3 className="mt-3 text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--gray)]">{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-12 sm:px-8"><div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(120deg,#0b3a8f,#0B63E3)] p-7"><p className="text-xs font-bold uppercase tracking-[.14em] text-white/70">Para proprietários</p><h2 className="mt-2 text-2xl font-extrabold text-white">Rentabilize seu espaço com segurança</h2><p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85">Anuncie quartos e suítes. Você controla agenda, preços e privacidade.</p><span className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-[var(--blue)]">Anunciar meu espaço</span></div></section>
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
  return <div className="border-b border-slate-200 last:border-b-0"><button type="button" onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-4 text-left"><span className="w-20 text-sm font-bold text-slate-700">{label}</span><span className="flex-1 text-sm font-semibold text-slate-500">{value ?? placeholder}</span><span className="text-slate-400">⌄</span></button>{open ? <div className="flex flex-col gap-1 px-3 pb-3">{options.map((option) => <button key={option} type="button" onClick={() => onPick(option)} className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-blue-50">{option}</button>)}</div> : null}</div>;
}

function SpaceCard({ title, region, price, rating, image }: { title: string; region: string; price: string; rating: string; image: string }) {
  return <article className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
    <div className="relative h-40"><Image src={image} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" /><span className="absolute right-3 top-3 rounded-full bg-[rgba(3,17,40,.72)] px-2 py-1 text-xs font-bold text-white">★ {rating}</span></div>
    <div className="p-4"><h3 className="text-sm font-bold text-white">{title}</h3><p className="mt-1 text-xs text-[var(--gray)]">{region}</p><p className="mt-3 text-xs text-[var(--gray)]">A partir de <strong className="text-sm text-[var(--blue-light)]">{price}</strong> / 2h</p></div>
  </article>;
}
