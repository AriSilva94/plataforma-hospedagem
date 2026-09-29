import Link from "next/link";
import { ProfileForm } from "@/components/profile-form";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/current-user";

export default async function ProfilePage() {
  const { user, unavailable } = await getCurrentUser();

  return (
    <>
      <SiteHeader user={user} />
      {user ? (
        <ProfileForm user={user} />
      ) : (
        <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-6 pb-18 md:pb-0">
          <section className="w-full max-w-md rounded-3xl border border-(--line) bg-(--surface) p-8 shadow-[0_24px_60px_rgba(0,0,0,.25)]">
            <h1 className="text-3xl font-extrabold">Seu perfil</h1>
            {unavailable ? (
              <>
                <p className="mt-3 leading-relaxed text-(--gray)">
                  Não foi possível carregar seus dados agora. Tente novamente em
                  alguns instantes.
                </p>
                <Link
                  className="mt-6 inline-flex rounded-xl bg-(--blue) px-5 py-3 text-sm font-bold text-white transition hover:bg-(--blue-light)"
                  href="/perfil"
                >
                  Tentar novamente
                </Link>
              </>
            ) : (
              <>
                <p className="mt-3 leading-relaxed text-(--gray)">
                  Entre para acessar seus dados pessoais.
                </p>
                <Link
                  className="mt-6 inline-flex rounded-xl bg-(--blue) px-5 py-3 text-sm font-bold text-white transition hover:bg-(--blue-light)"
                  href="/login"
                >
                  Ir para entrar
                </Link>
              </>
            )}
          </section>
        </main>
      )}
    </>
  );
}
