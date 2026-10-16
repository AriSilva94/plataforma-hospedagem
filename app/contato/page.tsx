import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/current-user";

export const metadata: Metadata = { title: "Contato | DOMUS X" };

export default async function ContactPage() {
  const { user } = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-160 px-6 pt-8 pb-28 md:px-10 md:pt-12 md:pb-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-(--white)">Contato</h1>
        <p className="mt-4 leading-relaxed text-(--gray)">
          Fale com a gente pelo e-mail{" "}
          <a href="mailto:contato@domusx.com.br" className="font-semibold text-(--blue-light) hover:underline">
            contato@domusx.com.br
          </a>
          . Respondemos o mais rápido possível.
        </p>
      </main>
    </>
  );
}
