import type { Metadata } from "next";
import { PageNotice } from "@/components/page-notice";
import { RoomCard } from "@/components/room-card";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/current-user";
import { initialsOf } from "@/lib/initials";
import { publicOwnerProfileSchema } from "@/lib/properties";
import { getApiData } from "@/lib/server-api";

export async function generateMetadata({ params }: PageProps<"/anfitriao/[ownerProfileId]">): Promise<Metadata> {
  const { ownerProfileId } = await params;
  const result = await getApiData(`/owners/${ownerProfileId}`, publicOwnerProfileSchema);
  if (result.status !== "ok") return { title: "Anfitrião não encontrado | DOMUS X" };
  return { title: `${result.data.name} | DOMUS X` };
}

export default async function PublicHostProfilePage({ params }: PageProps<"/anfitriao/[ownerProfileId]">) {
  const { ownerProfileId } = await params;
  const [{ user }, result] = await Promise.all([getCurrentUser(), getApiData(`/owners/${ownerProfileId}`, publicOwnerProfileSchema)]);

  if (result.status !== "ok") {
    return (
      <>
        <SiteHeader user={user} />
        {result.status === "not-found" ? (
          <PageNotice title="Anfitrião não encontrado" description="Este perfil não existe ou não está disponível no momento." actionLabel="Voltar para o início" actionHref="/" />
        ) : (
          <PageNotice
            title="Não foi possível carregar"
            description="Tente novamente em alguns instantes."
            actionLabel="Tentar novamente"
            actionHref={`/anfitriao/${ownerProfileId}`}
          />
        )}
      </>
    );
  }

  const owner = result.data;

  return (
    <>
      <SiteHeader user={user} />
      <main className="px-4 pt-6 pb-28 sm:px-6 md:pt-10 md:pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="flex size-16 shrink-0 items-center justify-center rounded-full bg-(--primary) text-xl font-bold text-(--on-primary)">
              {initialsOf(owner.name)}
            </span>
            <div>
              <p className="text-xs font-semibold tracking-wide text-(--text-secondary) uppercase">Anfitrião</p>
              <h1 className="text-2xl font-extrabold tracking-tight text-(--text-primary)">{owner.name}</h1>
            </div>
          </div>

          <section className="mt-8 border-t border-(--border) pt-8">
            <h2 className="text-lg font-bold text-(--text-primary)">{owner.rooms.length === 1 ? "1 quarto anunciado" : `${owner.rooms.length} quartos anunciados`}</h2>
            {owner.rooms.length > 0 ? (
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {owner.rooms.map((room) => (
                  <li key={room.id}>
                    <RoomCard room={room} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-(--text-secondary)">Nenhum quarto disponível no momento.</p>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
