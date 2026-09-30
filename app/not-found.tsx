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
      <main className="flex min-h-[calc(100svh-65px)] flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_50%,rgba(58,131,240,.16),transparent_45%)] px-6 pb-18 text-center md:min-h-[calc(100svh-73px)] md:pb-0">
        <p
          aria-hidden="true"
          className="text-[clamp(6rem,22vw,12rem)] font-extrabold leading-none tracking-tighter text-(--blue-light)"
        >
          404
        </p>
        <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">
          Página não encontrada
        </h1>
        <p className="mt-3 max-w-md leading-relaxed text-(--gray)">
          O endereço que você acessou não existe ou foi removido.
        </p>
        <Link
          className="mt-8 inline-flex rounded-xl bg-(--blue) px-6 py-3 text-sm font-bold text-white transition hover:bg-(--blue-light) focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#a9ceff]"
          href="/"
        >
          Voltar ao início
        </Link>
      </main>
    </>
  );
}
