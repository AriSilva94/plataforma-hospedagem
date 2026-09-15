"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { apiFetch, getErrorMessage } from "@/lib/api";

type User = { id: string; name: string; email: string; roles: string[] };

export function ProfileForm({ user: initialUser }: { user: User }) {
  const [user, setUser] = useState(initialUser);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setMessage(undefined);
    try {
      const response = await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify(
          Object.fromEntries(new FormData(event.currentTarget)),
        ),
      });
      if (!response.ok) {
        setError(await getErrorMessage(response));
        return;
      }
      setUser((await response.json()) as User);
      setMessage("Dados atualizados.");
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    }
  }

  async function addProfile(role: "guest" | "owner") {
    setError(undefined);
    try {
      const response = await apiFetch(`/users/me/profiles/${role}`, {
        method: "POST",
      });
      if (!response.ok) {
        setError(await getErrorMessage(response));
        return;
      }
      setUser((await response.json()) as User);
      setMessage("Perfil adicionado.");
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    }
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <section className="mx-auto max-w-xl rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-7 shadow-[0_24px_60px_rgba(0,0,0,.25)] sm:p-9">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-extrabold text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--blue)] text-xs">D</span>
          DOMUS X
        </Link>
        <div className="mt-7 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(140deg,#0b3a8f,#0B63E3)] text-xl font-extrabold">{user.name.slice(0, 1).toUpperCase()}</div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Seu perfil</h1>
            <p className="mt-1 text-sm text-[var(--gray)]">Gerencie seus dados e perfis de acesso.</p>
          </div>
        </div>
        <div className="mt-7 border-t border-[var(--line)] pt-6">
        <h2 className="text-lg font-bold text-white">Dados pessoais</h2>
        <form className="mt-5 space-y-4" onSubmit={updateProfile}>
          <label className="block text-sm font-semibold text-[var(--gray)]">
            Nome
            <input required name="name" defaultValue={user.name} className="mt-1.5 w-full rounded-xl border border-[var(--line-strong)] bg-[var(--navy)] px-3.5 py-3 text-white outline-none focus:border-[var(--blue-light)]" />
          </label>
          <label className="block text-sm font-semibold text-[var(--gray)]">
            E-mail
            <input required type="email" name="email" defaultValue={user.email} className="mt-1.5 w-full rounded-xl border border-[var(--line-strong)] bg-[var(--navy)] px-3.5 py-3 text-white outline-none focus:border-[var(--blue-light)]" />
          </label>
          {error ? <p role="alert" className="rounded-xl border border-[rgba(229,98,75,.35)] bg-[rgba(229,98,75,.12)] p-3 text-sm text-[#ff9b8a]">{error}</p> : null}
          {message ? <p role="status" className="rounded-xl border border-[rgba(47,191,135,.35)] bg-[rgba(47,191,135,.12)] p-3 text-sm text-[#7be0b6]">{message}</p> : null}
          <button className="rounded-xl bg-[var(--blue)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--blue-light)]" type="submit">Salvar dados</button>
        </form>
        </div>
        <section className="mt-8 border-t border-[var(--line)] pt-6">
          <h2 className="text-lg font-bold text-white">Perfis</h2>
          <p className="mt-1 text-sm text-[var(--gray)]">
            Ativos: {user.roles.join(", ")}.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {!user.roles.includes("GUEST") ? (
              <button
                onClick={() => void addProfile("guest")}
            className="rounded-xl border border-[var(--blue)] bg-[rgba(11,99,227,.12)] px-4 py-2.5 text-sm font-bold text-[var(--blue-light)]"
              >
                Adicionar perfil de hóspede
              </button>
            ) : null}
            {!user.roles.includes("OWNER") ? (
              <button
                onClick={() => void addProfile("owner")}
            className="rounded-xl border border-[var(--blue)] bg-[rgba(11,99,227,.12)] px-4 py-2.5 text-sm font-bold text-[var(--blue-light)]"
              >
                Adicionar perfil de proprietário
              </button>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}
