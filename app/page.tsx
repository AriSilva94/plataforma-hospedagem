import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(110%_80%_at_78%_8%,#0b3a8f,transparent_55%)]" />
      <section className="relative mx-auto w-full max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 text-xl font-extrabold">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--blue)] text-sm">D</span>
          DOMUS X
        </div>
        <p className="mt-10 text-sm font-bold uppercase tracking-[0.14em] text-[var(--blue-light)]">Hospedagens selecionadas</p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">
          Encontre seu lugar com <span className="text-[var(--blue-light)]">segurança e discrição.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--gray)] sm:text-lg">
          Crie sua conta para reservar estadias ou anunciar quartos e suítes.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/cadastro"
            className="rounded-xl bg-[var(--blue)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--blue-light)]"
          >
            Criar conta
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-[var(--line-strong)] bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Entrar
          </Link>
        </div>
      </section>
    </main>
  );
}
