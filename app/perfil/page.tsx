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
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
        <h1 className="text-3xl font-semibold">Seu perfil</h1>
        <p className="mt-3 text-stone-600">
          Entre para acessar seus dados pessoais.
        </p>
        <Link className="mt-6 font-semibold text-emerald-700" href="/login">
          Ir para entrar
        </Link>
      </main>
    );
  }

  return <ProfileForm user={(await response.json()) as User} />;
}
