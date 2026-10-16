"use client";

import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  LuBadgeCheck,
  LuHouse,
  LuIdCard,
  LuLockKeyhole,
  LuMail,
  LuMailCheck,
  LuMailWarning,
  LuPhone,
  LuShieldCheck,
  LuUserRound,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import { FormFeedback } from "@/components/form-feedback";
import { ChangePasswordForm } from "@/components/change-password-form";
import { DatePicker } from "@/components/date-picker";
import { DeactivateAccount } from "@/components/deactivate-account";
import { GuestIdentityForm } from "@/components/guest-identity-form";
import { IconInput, fieldLabelClassName } from "@/components/icon-input";
import { FieldError } from "@/components/field-error";
import { ProfileLocationFields } from "@/components/profile-location-fields";
import { isAdmin } from "@/lib/admin";
import { apiFetch, getErrorMessage } from "@/lib/api";
import { earliestBirthDate, latestAdultBirthDate, profileSchema, type ProfileFormValues } from "@/lib/auth-form-schema";
import { brazilianStates } from "@/lib/properties";
import { CurrentUser, formatPhone, parseCurrentUser } from "@/lib/user";

const secondaryDisabledButtonClassName =
  "rounded-2xl border border-(--border-strong) px-4 py-3 text-sm font-semibold text-(--text-secondary) disabled:cursor-not-allowed";

const verificationStates = {
  verified: { label: "Verificado", className: "text-(--success)" },
  unverified: { label: "Cadastrado, não verificado", className: "text-(--info)" },
  unavailable: { label: "Disponível em breve", className: "text-(--warning)" },
};

function toFormValues(user: CurrentUser): ProfileFormValues {
  return {
    name: user.name,
    phone: user.phone ? formatPhone(user.phone) : "",
    birthDate: user.birthDate ?? "",
    city: user.city ?? "",
    state: brazilianStates.find((state) => state === user.state) ?? "",
  };
}

function VerificationStatus({
  label,
  detail,
  status,
  icon: Icon,
  action,
}: {
  label: string;
  detail: string;
  status: keyof typeof verificationStates;
  icon: IconType;
  action?: ReactNode;
}) {
  const state = verificationStates[status];

  return (
    <div className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--primary-soft) text-(--primary-text)">
          <Icon aria-hidden="true" size={17} />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-(--text-primary)">{label}</p>
          <p className="wrap-break-word text-sm text-(--text-secondary)">{detail}</p>
        </div>
      </div>
      <div className="ml-12 flex flex-wrap items-center gap-x-4 gap-y-2 sm:ml-auto sm:shrink-0 sm:justify-end">
        <span className={`whitespace-nowrap text-xs font-semibold ${state.className}`}>
          {state.label}
        </span>
        {action}
      </div>
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
    <article className="flex h-full flex-col rounded-2xl border border-(--border) bg-(--surface) p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-(--primary-soft) text-(--primary-text)">
          <Icon aria-hidden="true" size={22} />
        </span>
        {active ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-(--success-soft) px-3 py-1.5 text-xs font-semibold text-(--success)">
            <LuBadgeCheck aria-hidden="true" size={15} /> Perfil ativo
          </span>
        ) : (
          <span className="rounded-full bg-(--surface-raised) px-3 py-1.5 text-xs font-semibold text-(--text-secondary)">
            Ainda não adicionado
          </span>
        )}
      </div>
      <h3 className="mt-5 text-lg font-bold text-(--text-primary)">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-(--text-secondary)">
        {description}
      </p>
      {active && details ? (
        details
      ) : (
        <p className="mt-5 border-t border-(--border) pt-4 text-xs text-(--text-secondary)">
          Informações deste perfil disponíveis em breve.
        </p>
      )}
      <div className="mt-auto pt-5">
        {active && manageHref ? (
          <Link
            href={manageHref}
            className="flex w-full justify-center rounded-2xl border border-(--border-strong) px-4 py-3 text-sm font-semibold text-(--text-primary) transition-colors hover:bg-(--primary-soft) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
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
            className="w-full rounded-2xl bg-(--primary) px-4 py-3 text-sm font-bold text-(--on-primary) transition-colors hover:bg-(--primary-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60"
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

export function ProfileForm({ user, onUserChange }: { user: CurrentUser; onUserChange: (user: CurrentUser) => void }) {
  const initialValues = toFormValues(user);
  const [{ roles: initialRoles }] = useState(user);
  const {
    register,
    handleSubmit,
    formState,
    reset,
    setValue,
    control,
    subscribe,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValues,
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
  const [verificationError, setVerificationError] = useState<string>();
  const [verificationMessage, setVerificationMessage] = useState<string>();
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const { errors } = formState;

  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ name }) => {
          if (name) setSaveMessage(undefined);
        },
      }),
    [subscribe],
  );
  const EmailStatusIcon = user.emailVerified ? LuMailCheck : LuMailWarning;
  const prioritizeProfiles = initialRoles.length === 0;

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
        apiFetch("/users/me", {
          method: "PATCH",
          body: JSON.stringify({
            name: data.name,
            phone: data.phone.replace(/\D/g, "") || null,
            birthDate: data.birthDate || null,
            city: data.city || null,
            state: data.state || null,
          }),
        }),
      );
      onUserChange(updatedUser);
      reset(toFormValues(updatedUser));
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

  async function sendVerification() {
    setVerificationError(undefined);
    setVerificationMessage(undefined);
    setIsSendingVerification(true);
    try {
      const response = await apiFetch("/auth/email-verification", { method: "POST" });
      if (!response.ok) {
        setVerificationError(await getErrorMessage(response));
        return;
      }
      setVerificationMessage(
        `Enviamos um link de confirmação para ${user.email}. Ele vale por 24 horas.`,
      );
    } catch {
      setVerificationError("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setIsSendingVerification(false);
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
      onUserChange(updatedUser);
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
      className="border-t border-(--border) py-8 sm:py-10"
    >
      <h2 id="access-heading" className="text-xl font-bold text-(--text-primary)">
        Perfis de acesso
      </h2>
      <p className="mt-1 text-sm text-(--text-secondary)">
        Use a plataforma como hóspede, proprietário ou nos dois perfis.
      </p>
      {user.roles.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-(--primary-border) bg-(--primary-soft) p-5 sm:p-6">
          <h3 className="text-lg font-bold text-(--text-primary)">
            Escolha como quer usar a plataforma
          </h3>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-(--text-secondary)">
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
              onSaved={onUserChange}
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
      {isAdmin(user) ? (
        <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-(--success)/38 bg-(--success-soft) p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <LuShieldCheck aria-hidden="true" size={22} className="mt-0.5 shrink-0 text-(--success)" />
            <div>
              <h3 className="font-bold text-(--text-primary)">Administrador</h3>
              <p className="mt-1 text-sm text-(--text-secondary)">
                Você tem acesso à administração da plataforma.
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-(--border-strong) px-4 py-3 text-sm font-semibold text-(--text-primary) transition-colors hover:bg-(--primary-soft)"
          >
            Abrir administração
          </Link>
        </div>
      ) : null}
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
    <div>
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center gap-3 border-b border-(--border) pb-8">
          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
              user.emailVerified
                ? "border-(--success)/38 bg-(--success-soft) text-(--success)"
                : "border-(--info)/38 bg-(--info-soft) text-(--info)"
            }`}
          >
            <EmailStatusIcon aria-hidden="true" size={15} />
            {user.emailVerified ? "E-mail verificado" : "E-mail não verificado"}
          </span>
        </div>

        {prioritizeProfiles ? accessSection : null}

        <section
          aria-labelledby="personal-data-heading"
          className="py-8 sm:py-10"
        >
          <h2
            id="personal-data-heading"
            className="text-xl font-bold text-(--text-primary)"
          >
            Dados pessoais
          </h2>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Mantenha as informações da sua conta atualizadas.
          </p>
          <form
            className="mt-6"
            noValidate
            onSubmit={handleSubmit(updateProfile)}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-name" className={fieldLabelClassName}>Nome</label>
                <IconInput
                  {...register("name")}
                  icon={LuUserRound}
                  id="profile-name"
                  disabled={isSaving}
                  autoComplete="name"
                  defaultValue={initialValues.name}
                  aria-invalid={errors.name ? "true" : undefined}
                  aria-describedby={errors.name ? "profile-name-error" : undefined}
                />
                <FieldError id="profile-name-error" message={errors.name?.message} />
              </div>
              <div>
                <label htmlFor="profile-email" className={fieldLabelClassName}>E-mail</label>
                <IconInput
                  icon={LuMail}
                  id="profile-email"
                  disabled
                  type="email"
                  value={user.email}
                  aria-describedby="profile-email-hint"
                />
                <p id="profile-email-hint" className="mt-2 text-xs leading-relaxed text-(--text-secondary)">
                  O e-mail identifica sua conta e não pode ser alterado.
                </p>
              </div>
              <div>
                <label htmlFor="profile-phone" className={fieldLabelClassName}>Telefone</label>
                <IconInput
                  {...register("phone", {
                    onChange: (event: ChangeEvent<HTMLInputElement>) =>
                      setValue("phone", formatPhone(event.target.value)),
                  })}
                  icon={LuPhone}
                  id="profile-phone"
                  type="tel"
                  inputMode="tel"
                  disabled={isSaving}
                  autoComplete="tel-national"
                  placeholder="(11) 91234-5678"
                  defaultValue={initialValues.phone}
                  aria-invalid={errors.phone ? "true" : undefined}
                  aria-describedby={errors.phone ? "profile-phone-error" : undefined}
                />
                <FieldError id="profile-phone-error" message={errors.phone?.message} />
              </div>
              <div>
                <label htmlFor="profile-birth-date" className={fieldLabelClassName}>Data de nascimento</label>
                <Controller
                  control={control}
                  name="birthDate"
                  render={({ field }) => (
                    <DatePicker
                      ref={field.ref}
                      id="profile-birth-date"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      min={earliestBirthDate}
                      max={latestAdultBirthDate()}
                      dialogLabel="Escolher data de nascimento"
                      hint="Para maiores de 18 anos"
                      disabled={isSaving}
                      invalid={Boolean(errors.birthDate)}
                      describedBy={errors.birthDate ? "profile-birth-date-error" : undefined}
                    />
                  )}
                />
                <FieldError id="profile-birth-date-error" message={errors.birthDate?.message} />
              </div>
              <ProfileLocationFields control={control} setValue={setValue} disabled={isSaving} labelClassName={fieldLabelClassName} />
            </div>
            <p className="mt-5 text-xs leading-relaxed text-(--text-secondary)">
              Telefone, data de nascimento, cidade e estado são obrigatórios
              para anunciar um imóvel. É necessário ter pelo menos 18 anos.
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
              className="mt-6 rounded-2xl bg-(--primary) px-5 py-3 text-sm font-bold text-(--on-primary) transition-colors hover:bg-(--primary-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
            >
              {isSaving ? "Salvando..." : "Salvar dados"}
            </button>
          </form>
        </section>

        <section
          aria-labelledby="verification-heading"
          className="border-t border-(--border) py-8 sm:py-10"
        >
          <h2
            id="verification-heading"
            className="text-xl font-bold text-(--text-primary)"
          >
            Verificação
          </h2>
          <p className="mt-1 text-sm text-(--text-secondary)">
            {user.emailVerified
              ? "Seu e-mail está verificado."
              : "O e-mail está cadastrado, mas ainda não foi verificado."}
          </p>
          <div className="mt-6 divide-y divide-(--border)">
            <VerificationStatus
              label="E-mail"
              detail={user.email}
              status={user.emailVerified ? "verified" : "unverified"}
              icon={EmailStatusIcon}
              action={
                user.emailVerified ? null : (
                  <button
                    type="button"
                    disabled={isSendingVerification}
                    onClick={sendVerification}
                    className="rounded-xl border border-(--border-strong) px-3 py-2 text-xs font-bold text-(--text-primary) transition-colors hover:border-(--primary-border) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSendingVerification ? "Enviando..." : "Enviar link de confirmação"}
                  </button>
                )
              }
            />
            <VerificationStatus
              label="Telefone"
              detail="Verificação ainda não disponível"
              status="unavailable"
              icon={LuPhone}
            />
            <VerificationStatus
              label="Identidade"
              detail="Verificação ainda não disponível"
              status="unavailable"
              icon={LuIdCard}
            />
          </div>
          {verificationError ? (
            <div className="mt-4">
              <FormFeedback tone="error">{verificationError}</FormFeedback>
            </div>
          ) : null}
          {verificationMessage ? (
            <div className="mt-4">
              <FormFeedback tone="success">{verificationMessage}</FormFeedback>
            </div>
          ) : null}
        </section>

        {!prioritizeProfiles ? accessSection : null}

        <section
          aria-labelledby="security-heading"
          className="border-t border-(--border) py-8 sm:py-10"
        >
          <div className="flex items-start gap-3">
            <LuLockKeyhole
              aria-hidden="true"
              className="mt-1 shrink-0 text-(--primary-text)"
              size={20}
            />
            <div>
              <h2
                id="security-heading"
                className="text-xl font-bold text-(--text-primary)"
              >
                Segurança
              </h2>
              <p className="mt-1 text-sm text-(--text-secondary)">
                Opções de proteção da sua conta.
              </p>
            </div>
          </div>
          <ChangePasswordForm hasPassword={user.hasPassword} />
        </section>

        <section
          aria-labelledby="account-heading"
          className="border-t border-(--border) pt-8 sm:pt-10"
        >
          <h2 id="account-heading" className="text-xl font-bold text-(--text-primary)">
            Conta
          </h2>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Gerencie o status da sua conta.
          </p>
          <DeactivateAccount hasPassword={user.hasPassword} />
        </section>
      </div>
    </div>
  );
}
