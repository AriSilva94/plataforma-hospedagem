"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  LuBadgeCheck,
  LuCircleAlert,
  LuHouse,
  LuIdCard,
  LuLockKeyhole,
  LuMail,
  LuMailWarning,
  LuPhone,
  LuUserRound,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import { FormFeedback } from "@/components/form-feedback";
import { GuestIdentityForm } from "@/components/guest-identity-form";
import { apiFetch, getErrorMessage } from "@/lib/api";
import { profileSchema, type ProfileFormValues } from "@/lib/auth-form-schema";
import { CurrentUser, parseCurrentUser } from "@/lib/user";

const fieldClassName =
  "mt-2 w-full rounded-xl border border-(--line-strong) bg-(--navy) px-4 py-3 text-white outline-none transition-colors focus:border-(--blue-light) focus-visible:ring-2 focus-visible:ring-(--blue-light) disabled:cursor-not-allowed disabled:border-(--line) disabled:bg-(--surface) disabled:text-(--gray)";
const secondaryDisabledButtonClassName =
  "rounded-xl border border-(--line-strong) px-4 py-3 text-sm font-semibold text-(--gray) disabled:cursor-not-allowed";

function VerificationStatus({
  label,
  detail,
  registered,
  icon: Icon,
}: {
  label: string;
  detail: string;
  registered: boolean;
  icon: IconType;
}) {
  return (
    <div className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--surface-raised) text-(--blue-light)">
          <Icon aria-hidden="true" size={17} />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-white">{label}</p>
          <p className="wrap-break-word text-sm text-(--gray)">{detail}</p>
        </div>
      </div>
      <span
        className={`ml-12 whitespace-nowrap text-xs font-semibold sm:ml-auto sm:max-w-none sm:shrink-0 sm:text-right ${registered ? "text-(--info)" : "text-(--warning)"}`}
      >
        {registered ? "Cadastrado, não verificado" : "Disponível em breve"}
      </span>
    </div>
  );
}

function AccessProfileCard({
  title,
  description,
  active,
  pending,
  isAdding,
  icon: Icon,
  onAdd,
  details,
  manageHref,
}: {
  title: string;
  description: string;
  active: boolean;
  pending: boolean;
  isAdding: boolean;
  icon: IconType;
  onAdd: () => void;
  details?: ReactNode;
  manageHref?: string;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-(--line-strong) bg-(--surface) p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-(--surface-raised) text-(--blue-light)">
          <Icon aria-hidden="true" size={22} />
        </span>
        {active ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(47,191,135,.12)] px-3 py-1.5 text-xs font-semibold text-(--success)">
            <LuBadgeCheck aria-hidden="true" size={15} /> Perfil ativo
          </span>
        ) : (
          <span className="rounded-full bg-(--surface-raised) px-3 py-1.5 text-xs font-semibold text-(--gray)">
            Ainda não adicionado
          </span>
        )}
      </div>
      <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-(--gray)">
        {description}
      </p>
      {active && details ? (
        details
      ) : (
        <p className="mt-5 border-t border-(--line) pt-4 text-xs text-(--gray)">
          Informações deste perfil disponíveis em breve.
        </p>
      )}
      <div className="mt-auto pt-5">
        {active && manageHref ? (
          <Link
            href={manageHref}
            className="flex w-full justify-center rounded-xl border border-(--line-strong) px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light)"
          >
            Gerenciar imóveis
          </Link>
        ) : active ? (
          <button
            type="button"
            disabled
            className={`w-full ${secondaryDisabledButtonClassName}`}
          >
            Gerenciar perfil · Disponível em breve
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={onAdd}
            className="w-full rounded-xl bg-(--blue) px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-(--blue-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light) disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAdding
              ? "Adicionando perfil..."
              : `Adicionar perfil de ${title.toLowerCase()}`}
          </button>
        )}
      </div>
    </article>
  );
}

export function ProfileForm({ user: initialUser }: { user: CurrentUser }) {
  const [user, setUser] = useState(initialUser);
  const {
    register,
    handleSubmit,
    formState,
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: initialUser.name, email: initialUser.email },
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });
  const [saveError, setSaveError] = useState<string>();
  const [saveMessage, setSaveMessage] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState<string>();
  const [profileMessage, setProfileMessage] = useState<string>();
  const [profilePendingRole, setProfilePendingRole] = useState<
    "guest" | "owner"
  >();
  const nameError = formState.errors.name;
  const emailError = formState.errors.email;
  const prioritizeProfiles = initialUser.roles.length === 0;

  async function requestUser(
    run: () => Promise<Response>,
  ): Promise<CurrentUser> {
    let response: Response;
    try {
      response = await run();
    } catch {
      throw new Error(
        "Não foi possível conectar ao servidor. Tente novamente.",
      );
    }

    if (!response.ok) throw new Error(await getErrorMessage(response));
    const updatedUser = parseCurrentUser(
      await response.json().catch(() => null),
    );
    if (!updatedUser)
      throw new Error("O servidor retornou dados inválidos. Tente novamente.");
    return updatedUser;
  }

  async function updateProfile(data: ProfileFormValues) {
    if (isSaving || profilePendingRole) return;
    setSaveError(undefined);
    setSaveMessage(undefined);
    setIsSaving(true);
    try {
      const updatedUser = await requestUser(() =>
        apiFetch("/users/me", { method: "PATCH", body: JSON.stringify(data) }),
      );
      setUser(updatedUser);
      reset({ name: updatedUser.name, email: updatedUser.email });
      setSaveMessage("Dados atualizados.");
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar seus dados. Tente novamente.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function addProfile(role: "guest" | "owner") {
    if (isSaving || profilePendingRole) return;
    setProfileError(undefined);
    setProfileMessage(undefined);
    setProfilePendingRole(role);
    try {
      const updatedUser = await requestUser(() =>
        apiFetch(`/users/me/profiles/${role}`, { method: "POST" }),
      );
      setUser(updatedUser);
      setProfileMessage(
        `Perfil de ${role === "guest" ? "hóspede" : "proprietário"} adicionado.`,
      );
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Não foi possível adicionar o perfil. Tente novamente.",
      );
    } finally {
      setProfilePendingRole(undefined);
    }
  }

  const accessSection = (
    <section
      aria-labelledby="access-heading"
      className="border-t border-(--line) py-8 sm:py-10"
    >
      <h2 id="access-heading" className="text-xl font-bold text-white">
        Perfis de acesso
      </h2>
      <p className="mt-1 text-sm text-(--gray)">
        Use a plataforma como hóspede, proprietário ou nos dois perfis.
      </p>
      {user.roles.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-(--blue-light) bg-(--surface-raised) p-5 sm:p-6">
          <h3 className="text-lg font-bold text-white">
            Escolha como quer usar a plataforma
          </h3>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-(--gray)">
            Adicione um perfil para começar. Você também pode atualizar seus
            dados pessoais e escolher depois.
          </p>
        </div>
      ) : null}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <AccessProfileCard
          title="Hóspede"
          description="Encontre espaços e acompanhe suas futuras estadias."
          active={user.roles.includes("GUEST")}
          pending={Boolean(profilePendingRole) || isSaving}
          isAdding={profilePendingRole === "guest"}
          icon={LuUserRound}
          onAdd={() => void addProfile("guest")}
          details={
            <GuestIdentityForm
              value={user.guestGenderIdentity}
              onSaved={setUser}
            />
          }
        />
        <AccessProfileCard
          title="Proprietário"
          description="Prepare seus espaços para receber hóspedes."
          active={user.roles.includes("OWNER")}
          pending={Boolean(profilePendingRole) || isSaving}
          isAdding={profilePendingRole === "owner"}
          icon={LuHouse}
          onAdd={() => void addProfile("owner")}
          manageHref="/meus-imoveis"
        />
      </div>
      {profileError ? (
        <div className="mt-5">
          <FormFeedback tone="error">{profileError}</FormFeedback>
        </div>
      ) : null}
      {profileMessage ? (
        <div className="mt-5">
          <FormFeedback tone="success">{profileMessage}</FormFeedback>
        </div>
      ) : null}
    </section>
  );

  return (
    <main className="min-h-[calc(100vh-72px)] px-4 pt-8 pb-28 sm:px-6 md:pt-12 md:pb-16">
      <div className="mx-auto max-w-4xl">
        <header className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-4 border-b border-(--line) pb-8 sm:flex sm:flex-wrap sm:gap-5">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-(--blue) text-2xl font-extrabold text-white sm:h-18 sm:w-18">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-(--gray)">Seu perfil</p>
            <h1 className="mt-1 wrap-break-word text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {user.name}
            </h1>
            <p className="mt-1 wrap-break-word text-sm text-(--gray)">
              {user.email}
            </p>
          </div>
          <span className="col-span-2 inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(47,191,135,.38)] bg-[rgba(47,191,135,.1)] px-3 py-2 text-xs font-semibold text-(--success) sm:w-auto">
            <LuMail aria-hidden="true" size={15} /> E-mail cadastrado
          </span>
        </header>

        {prioritizeProfiles ? accessSection : null}

        <section
          aria-labelledby="personal-data-heading"
          className="py-8 sm:py-10"
        >
          <h2
            id="personal-data-heading"
            className="text-xl font-bold text-white"
          >
            Dados pessoais
          </h2>
          <p className="mt-1 text-sm text-(--gray)">
            Mantenha as informações da sua conta atualizadas.
          </p>
          <form
            className="mt-6"
            noValidate
            onSubmit={handleSubmit(updateProfile)}
            onChange={() => setSaveMessage(undefined)}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-name" className="block text-sm font-semibold text-(--gray)">Nome</label>
                <input
                  {...register("name")}
                  id="profile-name"
                  disabled={isSaving}
                  autoComplete="name"
                  defaultValue={initialUser.name}
                  aria-invalid={nameError ? "true" : undefined}
                  aria-describedby={nameError ? "profile-name-error" : undefined}
                  className={`${fieldClassName} aria-invalid:border-(--danger) aria-invalid:focus:border-(--danger) aria-invalid:focus-visible:ring-(--danger)`}
                />
                {nameError?.message ? (
                  <p id="profile-name-error" className="auth-field-error" role="alert">
                    <LuCircleAlert aria-hidden="true" size={15} />{nameError.message}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="profile-email" className="block text-sm font-semibold text-(--gray)">E-mail</label>
                <input
                  {...register("email")}
                  id="profile-email"
                  disabled={isSaving}
                  type="email"
                  autoComplete="email"
                  defaultValue={initialUser.email}
                  aria-invalid={emailError ? "true" : undefined}
                  aria-describedby={emailError ? "profile-email-error" : undefined}
                  className={`${fieldClassName} aria-invalid:border-(--danger) aria-invalid:focus:border-(--danger) aria-invalid:focus-visible:ring-(--danger)`}
                />
                {emailError?.message ? (
                  <p id="profile-email-error" className="auth-field-error" role="alert">
                    <LuCircleAlert aria-hidden="true" size={15} />{emailError.message}
                  </p>
                ) : null}
              </div>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-(--gray)">
              Telefone, data de nascimento, cidade e estado estarão disponíveis
              em breve.
            </p>
            {saveError ? (
              <div className="mt-5">
                <FormFeedback tone="error">{saveError}</FormFeedback>
              </div>
            ) : null}
            {saveMessage ? (
              <div className="mt-5">
                <FormFeedback tone="success">{saveMessage}</FormFeedback>
              </div>
            ) : null}
            <button
              disabled={isSaving || Boolean(profilePendingRole)}
              className="mt-6 rounded-xl bg-(--blue) px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-(--blue-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light) disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
            >
              {isSaving ? "Salvando..." : "Salvar dados"}
            </button>
          </form>
        </section>

        <section
          aria-labelledby="verification-heading"
          className="border-t border-(--line) py-8 sm:py-10"
        >
          <h2
            id="verification-heading"
            className="text-xl font-bold text-white"
          >
            Verificação
          </h2>
          <p className="mt-1 text-sm text-(--gray)">
            O e-mail está cadastrado, mas ainda não foi verificado.
          </p>
          <div className="mt-6 divide-y divide-(--line)">
            <VerificationStatus
              label="E-mail"
              detail={user.email}
              registered
              icon={LuMailWarning}
            />
            <VerificationStatus
              label="Telefone"
              detail="Verificação ainda não disponível"
              registered={false}
              icon={LuPhone}
            />
            <VerificationStatus
              label="Identidade"
              detail="Verificação ainda não disponível"
              registered={false}
              icon={LuIdCard}
            />
          </div>
        </section>

        {!prioritizeProfiles ? accessSection : null}

        <section
          aria-labelledby="security-heading"
          className="border-t border-(--line) py-8 sm:py-10"
        >
          <div className="flex items-start gap-3">
            <LuLockKeyhole
              aria-hidden="true"
              className="mt-1 shrink-0 text-(--blue-light)"
              size={20}
            />
            <div>
              <h2
                id="security-heading"
                className="text-xl font-bold text-white"
              >
                Segurança
              </h2>
              <p className="mt-1 text-sm text-(--gray)">
                Opções de proteção da sua conta.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled
            className={`mt-5 ${secondaryDisabledButtonClassName}`}
          >
            Alterar senha · Disponível em breve
          </button>
        </section>

        <section
          aria-labelledby="account-heading"
          className="border-t border-(--line) pt-8 sm:pt-10"
        >
          <h2 id="account-heading" className="text-xl font-bold text-white">
            Conta
          </h2>
          <p className="mt-1 text-sm text-(--gray)">
            Gerencie o status da sua conta.
          </p>
          <button
            type="button"
            disabled
            className={`mt-5 ${secondaryDisabledButtonClassName}`}
          >
            Desativar conta · Disponível em breve
          </button>
        </section>
      </div>
    </main>
  );
}
