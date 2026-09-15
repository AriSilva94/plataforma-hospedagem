"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const featuredSpaces = [
  { title: "Suíte Premium", region: "Asa Norte, Brasília", price: "R$ 150", image: "/rooms/room1.png" },
  { title: "Loft Moderno", region: "Sudoeste, Brasília", price: "R$ 140", image: "/rooms/room2.png" },
  { title: "Suíte Lago Sul", region: "Lago Sul, Brasília", price: "R$ 160", image: "/rooms/room3.png" },
  { title: "Espaço exclusivo", region: "Águas Claras, DF", price: "R$ 130", image: "/rooms/room4.png" },
];

export function LandingPage() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);

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
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[var(--gray)] md:flex">
            <a href="#destaques" className="transition hover:text-white">Início</a>
            <a href="#como-funciona" className="transition hover:text-white">Como funciona</a>
            <Link href="/login" className="transition hover:text-white">Entrar</Link>
          </nav>
          <Link href="/cadastro" className="rounded-xl border border-[rgba(11,99,227,.5)] bg-[rgba(11,99,227,.13)] px-4 py-2.5 text-sm font-bold text-[var(--blue-light)] transition hover:bg-[rgba(11,99,227,.24)]">
            Criar conta
          </Link>
        </div>
      </header>

      <section className="relative min-h-[490px] overflow-hidden">
        <Image src="/rooms/room1.png" alt="Suíte decorada" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,17,40,.94),rgba(3,17,40,.56)_60%,rgba(3,17,40,.35))]" />
        <div className="relative mx-auto flex min-h-[490px] max-w-6xl items-center px-5 py-16 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--blue-light)]">Hospedagens selecionadas</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-white sm:text-6xl">Encontre seu lugar com <span className="text-[var(--blue-light)]">segurança e discrição.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--gray)] sm:text-lg">Estadias confortáveis, espaços reservados e anfitriões verificados para você se sentir bem em cada momento.</p>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-5 sm:px-8">
        <div className="grid rounded-2xl bg-white p-2 shadow-[0_24px_60px_rgba(0,0,0,.45)] md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <SearchField label="Destino" value="Brasília, DF" />
          <SearchField label="Check-in" value="Selecione a data" />
          <SearchField label="Check-out" value="Selecione a data" />
          <SearchField label="Hóspedes" value="Quantas pessoas?" />
          <button type="button" className="m-1 rounded-xl bg-[var(--blue)] px-7 py-4 text-sm font-bold text-white transition hover:bg-[var(--blue-light)]">Buscar</button>
        </div>
      </section>

      <section id="destaques" className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--blue-light)]">Seleção DOMUS X</p>
            <h2 className="mt-2 text-2xl font-extrabold text-white">Locais em destaque</h2>
          </div>
          <span className="text-sm font-semibold text-[var(--gray)]">Disponibilidades em breve</span>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredSpaces.map((space) => <SpaceCard key={space.title} {...space} />)}
        </div>
      </section>

      <section id="como-funciona" className="border-y border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 sm:grid-cols-3 sm:px-8">
          {[
            ["01", "Escolha", "Conheça os espaços e encontre a estadia ideal para você."],
            ["02", "Reserve", "Finalize sua solicitação com dados e condições claras."],
            ["03", "Hospede-se", "Tenha uma experiência confortável e tranquila."],
          ].map(([number, title, text]) => (
            <div key={number} className="rounded-2xl border border-[var(--line)] bg-[var(--surface-raised)] p-6">
              <span className="text-sm font-extrabold text-[var(--blue-light)]">{number}</span>
              <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--gray)]">{text}</p>
            </div>
          ))}
        </div>
      </section>
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

function SearchField({ label, value }: { label: string; value: string }) {
  return <button type="button" className="border-b border-slate-200 px-4 py-3 text-left last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"><span className="block text-xs font-bold text-slate-500">{label}</span><span className="mt-1 block text-sm font-semibold text-slate-800">{value}</span></button>;
}

function SpaceCard({ title, region, price, image }: { title: string; region: string; price: string; image: string }) {
  return <article className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
    <div className="relative h-44"><Image src={image} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" /></div>
    <div className="p-4"><h3 className="font-bold text-white">{title}</h3><p className="mt-1 text-sm text-[var(--gray)]">{region}</p><p className="mt-4 text-sm text-[var(--gray)]"><strong className="text-base text-[var(--blue-light)]">{price}</strong> / noite</p></div>
  </article>;
}
