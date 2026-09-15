import Link from "next/link";
import { cookies } from "next/headers";
import { ProfileForm } from "@/components/profile-form";

type User = { id: string; name: string; email: string; roles: string[] };

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/users/me`,
    {
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() },
    },
  );

  if (!response.ok) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <section className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 shadow-[0_24px_60px_rgba(0,0,0,.25)]">
        <div className="inline-flex items-center gap-2 text-sm font-extrabold text-white"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--blue)] text-xs">D</span>DOMUS X</div>
        <h1 className="mt-7 text-3xl font-extrabold">Seu perfil</h1>
        <p className="mt-3 leading-relaxed text-[var(--gray)]">
          Entre para acessar seus dados pessoais.
        </p>
        <Link className="mt-6 inline-flex rounded-xl bg-[var(--blue)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--blue-light)]" href="/login">
          Ir para entrar
        </Link>
        </section>
      </main>
    );
  }

  return <ProfileForm user={(await response.json()) as User} />;
}
