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
    <main className="min-h-screen bg-stone-100 px-4 py-10">
      <section className="mx-auto max-w-xl rounded-2xl bg-white p-7 shadow-sm sm:p-9">
        <Link href="/" className="text-sm font-semibold text-emerald-700">
          Plataforma de Hospedagem
        </Link>
        <h1 className="mt-5 text-3xl font-semibold text-stone-900">
          Seu perfil
        </h1>
        <form className="mt-7 space-y-4" onSubmit={updateProfile}>
          <label className="block text-sm font-medium">
            Nome
            <input
              required
              name="name"
              defaultValue={user.name}
              className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2.5"
            />
          </label>
          <label className="block text-sm font-medium">
            E-mail
            <input
              required
              type="email"
              name="email"
              defaultValue={user.email}
              className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2.5"
            />
          </label>
          {error ? (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {message ? (
            <p role="status" className="text-sm text-emerald-700">
              {message}
            </p>
          ) : null}
          <button
            className="rounded-lg bg-emerald-700 px-4 py-2.5 font-semibold text-white"
            type="submit"
          >
            Salvar dados
          </button>
        </form>
        <section className="mt-8 border-t border-stone-200 pt-6">
          <h2 className="text-lg font-semibold">Perfis</h2>
          <p className="mt-1 text-sm text-stone-600">
            Ativos: {user.roles.join(", ")}.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {!user.roles.includes("GUEST") ? (
              <button
                onClick={() => void addProfile("guest")}
                className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-700"
              >
                Adicionar perfil de hóspede
              </button>
            ) : null}
            {!user.roles.includes("OWNER") ? (
              <button
                onClick={() => void addProfile("owner")}
                className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-700"
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
