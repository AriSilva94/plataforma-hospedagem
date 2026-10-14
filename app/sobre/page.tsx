import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = { title: "Sobre | DOMUS X" };

export default async function AboutPage() {
  const { user } = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-160 px-6 pt-8 pb-28 md:px-10 md:pt-12 md:pb-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-(--white)">Sobre a DOMUS X</h1>
        <p className="mt-4 leading-relaxed text-(--gray)">
          A DOMUS X reúne imóveis com quartos e suítes reserváveis de forma independente. Veja o que está disponível, reserve, pague e renove a diária em um só lugar, com discrição e segurança em cada etapa.
        </p>
      </main>
    </>
  );
}
