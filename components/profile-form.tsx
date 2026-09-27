"use client";

import { FormEvent, useState } from "react";
import { FormFeedback } from "@/components/form-feedback";
import { apiFetch, getErrorMessage } from "@/lib/api";
import { CurrentUser, parseCurrentUser } from "@/lib/user";

const fieldClassName =
  "mt-1.5 w-full rounded-xl border border-(--line-strong) bg-(--navy) px-3.5 py-3 text-white outline-none focus:border-(--blue-light) disabled:opacity-60";

export function ProfileForm({ user: initialUser }: { user: CurrentUser }) {
  const [user, setUser] = useState(initialUser);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  async function submit(
    run: () => Promise<Response>,
    successMessage: string,
  ): Promise<void> {
    if (isPending) {
      return;
    }
    setError(undefined);
    setMessage(undefined);
    setIsPending(true);
    try {
      const response = await run();
      if (!response.ok) {
        setError(await getErrorMessage(response));
        return;
      }
      const updatedUser = parseCurrentUser(await response.json());
      if (!updatedUser) {
        setError("O servidor retornou dados inválidos. Tente novamente.");
        return;
      }
      setUser(updatedUser);
      setMessage(successMessage);
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setIsPending(false);
    }
  }

  function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = JSON.stringify(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    void submit(
      () => apiFetch("/users/me", { method: "PATCH", body }),
      "Dados atualizados.",
    );
  }

  function addProfile(role: "guest" | "owner") {
    void submit(
      () => apiFetch(`/users/me/profiles/${role}`, { method: "POST" }),
      "Perfil adicionado.",
    );
  }

  return (
    <main className="min-h-[calc(100vh-72px)] px-4 pt-10 pb-[112px] md:pb-10">
      <section className="mx-auto max-w-xl rounded-3xl border border-(--line) bg-(--surface) p-7 shadow-[0_24px_60px_rgba(0,0,0,.25)] sm:p-9">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(140deg,#0b3a8f,#0B63E3)] text-xl font-extrabold">{user.name.slice(0, 1).toUpperCase()}</div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Seu perfil</h1>
            <p className="mt-1 text-sm text-(--gray)">Gerencie seus dados e perfis de acesso.</p>
          </div>
        </div>
        <div className="mt-7 border-t border-(--line) pt-6">
        <h2 className="text-lg font-bold text-white">Dados pessoais</h2>
        <form className="mt-5 space-y-4" onSubmit={updateProfile}>
          <label className="block text-sm font-semibold text-(--gray)">
            Nome
            <input required disabled={isPending} name="name" defaultValue={user.name} className={fieldClassName} />
          </label>
          <label className="block text-sm font-semibold text-(--gray)">
            E-mail
            <input required disabled={isPending} type="email" name="email" defaultValue={user.email} className={fieldClassName} />
          </label>
          {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
          {message ? <FormFeedback tone="success">{message}</FormFeedback> : null}
          <button disabled={isPending} className="rounded-xl bg-(--blue) px-5 py-3 text-sm font-bold text-white transition hover:bg-(--blue-light) disabled:cursor-not-allowed disabled:opacity-60" type="submit">{isPending ? "Salvando..." : "Salvar dados"}</button>
        </form>
        </div>
        <section className="mt-8 border-t border-(--line) pt-6">
          <h2 className="text-lg font-bold text-white">Perfis</h2>
          <p className="mt-1 text-sm text-(--gray)">
            {user.roles.length === 0
              ? "Escolha como deseja usar a plataforma."
              : `Ativos: ${user.roles.join(", ")}.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {!user.roles.includes("GUEST") ? (
              <button
                disabled={isPending}
                onClick={() => addProfile("guest")}
                className="rounded-xl border border-(--blue) bg-[rgba(11,99,227,.12)] px-4 py-2.5 text-sm font-bold text-(--blue-light) disabled:cursor-not-allowed disabled:opacity-60"
              >
                Adicionar perfil de hóspede
              </button>
            ) : null}
            {!user.roles.includes("OWNER") ? (
              <button
                disabled={isPending}
                onClick={() => addProfile("owner")}
                className="rounded-xl border border-(--blue) bg-[rgba(11,99,227,.12)] px-4 py-2.5 text-sm font-bold text-(--blue-light) disabled:cursor-not-allowed disabled:opacity-60"
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
