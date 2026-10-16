import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = {
  title: "Página não encontrada | DOMUS X",
};

export default async function NotFound() {
  const { user } = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user} />
      <main className="flex min-h-[calc(100svh-65px)] flex-col items-center justify-center px-6 pb-18 text-center md:min-h-[calc(100svh-73px)] md:pb-0">
        <p
          aria-hidden="true"
          className="text-[clamp(6rem,22vw,12rem)] font-extrabold leading-none tracking-tighter text-(--primary-text)"
        >
          404
        </p>
        <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">
          Página não encontrada
        </h1>
        <p className="mt-3 max-w-md leading-relaxed text-(--text-secondary)">
          O endereço que você acessou não existe ou foi removido.
        </p>
        <Link
          className="mt-8 inline-flex rounded-2xl bg-(--primary) px-6 py-3 text-sm font-bold text-(--on-primary) transition hover:bg-(--primary-hover) focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-(--focus-ring)"
          href="/"
        >
          Voltar ao início
        </Link>
      </main>
    </>
  );
}
