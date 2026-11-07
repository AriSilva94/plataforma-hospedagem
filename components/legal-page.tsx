import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/current-user";

export async function LegalPage({ title, updatedAt, children }: { title: string; updatedAt: string; children: ReactNode }) {
  const { user } = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user} />
      <main className="mx-auto w-full max-w-180 px-6 pt-8 pb-16 md:px-10 md:pt-12">
        <h1 className="text-3xl font-extrabold tracking-tight text-(--text-primary)">{title}</h1>
        <p className="mt-2 text-sm text-(--text-secondary)">Atualizada em {updatedAt}</p>
        <div className="mt-8 flex flex-col gap-8 leading-relaxed text-(--text-secondary) [&_a]:font-semibold [&_a]:text-(--primary-text) [&_a]:underline-offset-2 [&_a:hover]:underline [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-(--text-primary) [&_li]:ml-5 [&_li]:list-disc [&_ul]:mt-2 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
