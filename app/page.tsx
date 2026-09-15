import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-6">
      <section className="max-w-2xl text-center">
        <p className="font-semibold text-emerald-700">
          Plataforma de Hospedagem
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
          Encontre seu lugar ou anuncie seus quartos.
        </h1>
        <p className="mt-5 text-lg text-stone-600">
          Crie sua conta para começar como hóspede ou proprietário.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/cadastro"
            className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white"
          >
            Criar conta
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-emerald-700 px-5 py-3 font-semibold text-emerald-700"
          >
            Entrar
          </Link>
        </div>
      </section>
    </main>
  );
}
