"use client";

import { FormEvent, useState } from "react";
import { LuBadgeCheck, LuHouse, LuLockKeyhole, LuMail, LuShieldCheck, LuUserRound } from "react-icons/lu";
import type { IconType } from "react-icons";
import { FormFeedback } from "@/components/form-feedback";
import { apiFetch, getErrorMessage } from "@/lib/api";
import { CurrentUser, parseCurrentUser } from "@/lib/user";

const fieldClassName =
  "mt-2 w-full rounded-xl border border-(--line-strong) bg-(--navy) px-4 py-3 text-white outline-none transition-colors focus:border-(--blue-light) focus-visible:ring-2 focus-visible:ring-(--blue-light) disabled:cursor-not-allowed disabled:border-(--line) disabled:bg-(--surface) disabled:text-(--gray)";

function VerificationStatus({ label, detail, available }: { label: string; detail: string; available: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--surface-raised) text-(--blue-light)">
          {available ? <LuMail aria-hidden="true" size={17} /> : <LuShieldCheck aria-hidden="true" size={17} />}
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-white">{label}</p>
          <p className="break-all text-sm text-(--gray)">{detail}</p>
        </div>
      </div>
      <span className={`shrink-0 text-right text-xs font-semibold ${available ? "text-(--success)" : "text-(--warning)"}`}>
        {available ? "Cadastrado" : "Disponível em breve"}
      </span>
    </div>
  );
}

function AccessProfileCard({ title, description, active, pending, icon: Icon, onAdd }: {
  title: string;
  description: string;
  active: boolean;
  pending: boolean;
  icon: IconType;
  onAdd: () => void;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-(--line-strong) bg-(--surface) p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--surface-raised) text-(--blue-light)">
          <Icon aria-hidden="true" size={22} />
        </span>
        {active ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(47,191,135,.12)] px-3 py-1.5 text-xs font-semibold text-(--success)">
            <LuBadgeCheck aria-hidden="true" size={15} /> Perfil ativo
          </span>
        ) : (
          <span className="rounded-full bg-(--surface-raised) px-3 py-1.5 text-xs font-semibold text-(--gray)">Ainda não adicionado</span>
        )}
      </div>
      <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-(--gray)">{description}</p>
      <p className="mt-5 border-t border-(--line) pt-4 text-xs text-(--gray)">Informações deste perfil disponíveis em breve.</p>
      <div className="mt-auto pt-5">
        {active ? (
          <button type="button" disabled className="w-full rounded-xl border border-(--line-strong) px-4 py-3 text-sm font-semibold text-(--gray) disabled:cursor-not-allowed">
            Gerenciar perfil · Disponível em breve
          </button>
        ) : (
          <button type="button" disabled={pending} onClick={onAdd} className="w-full rounded-xl bg-(--blue) px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-(--blue-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light) disabled:cursor-not-allowed disabled:opacity-60">
            Adicionar perfil de {title.toLowerCase()}
          </button>
        )}
      </div>
    </article>
  );
}

export function ProfileForm({ user: initialUser }: { user: CurrentUser }) {
  const [user, setUser] = useState(initialUser);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  async function submit(run: () => Promise<Response>, successMessage: string): Promise<void> {
    if (isPending) return;
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
    const body = JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)));
    void submit(() => apiFetch("/users/me", { method: "PATCH", body }), "Dados atualizados.");
  }

  function addProfile(role: "guest" | "owner") {
    void submit(() => apiFetch(`/users/me/profiles/${role}`, { method: "POST" }), "Perfil adicionado.");
  }

  return (
    <main className="min-h-[calc(100vh-72px)] px-4 pt-8 pb-[112px] sm:px-6 md:pt-12 md:pb-16">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center gap-4 border-b border-(--line) pb-8 sm:gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-(--blue) text-2xl font-extrabold text-white sm:h-18 sm:w-18">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-(--gray)">Seu perfil</p>
            <h1 className="mt-1 break-words text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{user.name}</h1>
            <p className="mt-1 break-all text-sm text-(--gray)">{user.email}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-(--line-strong) px-3 py-2 text-xs font-semibold text-(--gray)">
            <LuMail aria-hidden="true" size={15} /> E-mail cadastrado
          </span>
        </header>

        <section aria-labelledby="personal-data-heading" className="py-8 sm:py-10">
          <h2 id="personal-data-heading" className="text-xl font-bold text-white">Dados pessoais</h2>
          <p className="mt-1 text-sm text-(--gray)">Mantenha as informações da sua conta atualizadas.</p>
          <form className="mt-6" onSubmit={updateProfile}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-(--gray)">Nome
                <input required disabled={isPending} name="name" autoComplete="name" defaultValue={user.name} className={fieldClassName} />
              </label>
              <label className="block text-sm font-semibold text-(--gray)">E-mail
                <input required disabled={isPending} type="email" name="email" autoComplete="email" defaultValue={user.email} className={fieldClassName} />
              </label>
              <label className="block text-sm font-semibold text-(--gray)">Telefone <span className="font-normal text-(--warning)">· Disponível em breve</span>
                <input disabled type="tel" placeholder="Disponível em breve" className={fieldClassName} />
              </label>
              <label className="block text-sm font-semibold text-(--gray)">Data de nascimento <span className="font-normal text-(--warning)">· Disponível em breve</span>
                <input disabled placeholder="Disponível em breve" className={fieldClassName} />
              </label>
              <label className="block text-sm font-semibold text-(--gray)">Cidade <span className="font-normal text-(--warning)">· Disponível em breve</span>
                <input disabled placeholder="Disponível em breve" className={fieldClassName} />
              </label>
              <label className="block text-sm font-semibold text-(--gray)">Estado <span className="font-normal text-(--warning)">· Disponível em breve</span>
                <input disabled placeholder="Disponível em breve" className={fieldClassName} />
              </label>
            </div>
            {error ? <div className="mt-5"><FormFeedback tone="error">{error}</FormFeedback></div> : null}
            {message ? <div className="mt-5"><FormFeedback tone="success">{message}</FormFeedback></div> : null}
            <button disabled={isPending} className="mt-6 rounded-xl bg-(--blue) px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-(--blue-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light) disabled:cursor-not-allowed disabled:opacity-60" type="submit">
              {isPending ? "Salvando..." : "Salvar dados"}
            </button>
          </form>
        </section>

        <section aria-labelledby="verification-heading" className="border-t border-(--line) py-8 sm:py-10">
          <h2 id="verification-heading" className="text-xl font-bold text-white">Verificação</h2>
          <p className="mt-1 text-sm text-(--gray)">Acompanhe as informações associadas à sua conta.</p>
          <div className="mt-6 divide-y divide-(--line)">
            <VerificationStatus label="E-mail" detail={user.email} available />
            <VerificationStatus label="Telefone" detail="Verificação ainda não disponível" available={false} />
            <VerificationStatus label="Identidade" detail="Verificação ainda não disponível" available={false} />
          </div>
        </section>

        <section aria-labelledby="access-heading" className="border-t border-(--line) py-8 sm:py-10">
          <h2 id="access-heading" className="text-xl font-bold text-white">Perfis de acesso</h2>
          <p className="mt-1 text-sm text-(--gray)">Use a plataforma como hóspede, proprietário ou nos dois perfis.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <AccessProfileCard title="Hóspede" description="Encontre espaços e acompanhe suas futuras estadias." active={user.roles.includes("GUEST")} pending={isPending} icon={LuUserRound} onAdd={() => addProfile("guest")} />
            <AccessProfileCard title="Proprietário" description="Prepare seus espaços para receber hóspedes." active={user.roles.includes("OWNER")} pending={isPending} icon={LuHouse} onAdd={() => addProfile("owner")} />
          </div>
        </section>

        <section aria-labelledby="security-heading" className="border-t border-(--line) py-8 sm:py-10">
          <div className="flex items-start gap-3">
            <LuLockKeyhole aria-hidden="true" className="mt-1 shrink-0 text-(--blue-light)" size={20} />
            <div>
              <h2 id="security-heading" className="text-xl font-bold text-white">Segurança</h2>
              <p className="mt-1 text-sm text-(--gray)">Opções de proteção da sua conta.</p>
            </div>
          </div>
          <button type="button" disabled className="mt-5 rounded-xl border border-(--line-strong) px-4 py-3 text-sm font-semibold text-(--gray) disabled:cursor-not-allowed">Alterar senha · Disponível em breve</button>
        </section>

        <section aria-labelledby="account-heading" className="border-t border-(--line) pt-8 sm:pt-10">
          <h2 id="account-heading" className="text-xl font-bold text-white">Conta</h2>
          <p className="mt-1 text-sm text-(--gray)">Gerencie o status da sua conta.</p>
          <button type="button" disabled className="mt-5 rounded-xl border border-(--line-strong) px-4 py-3 text-sm font-semibold text-(--gray) disabled:cursor-not-allowed">Desativar conta · Disponível em breve</button>
        </section>
      </div>
    </main>
  );
}
