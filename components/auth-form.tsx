"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FcGoogle } from "react-icons/fc";
import { LuCircleAlert, LuLockKeyhole, LuMail, LuShieldCheck } from "react-icons/lu";
import { useForm, type FieldPath } from "react-hook-form";
import { BrandMark } from "@/components/brand-mark";
import { FormFeedback } from "@/components/form-feedback";
import { apiFetch, getErrorMessage } from "@/lib/api";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type ForgotPasswordFormValues,
  type LoginFormValues,
  type RegisterFormValues,
  type ResetPasswordFormValues,
} from "@/lib/auth-form-schema";

const authSchemas = {
  "/auth/login": loginSchema,
  "/auth/register": registerSchema,
  "/auth/forgot-password": forgotPasswordSchema,
  "/auth/reset-password": resetPasswordSchema,
};

type AuthFormValues =
  | LoginFormValues
  | RegisterFormValues
  | ForgotPasswordFormValues
  | ResetPasswordFormValues;

type Field = {
  name: FieldPath<AuthFormValues>;
  label: string;
  type: "email" | "password" | "text";
  autoComplete?: string;
  defaultValue?: string;
};

type AuthFormProps = {
  title: string;
  description: string;
  endpoint: keyof typeof authSchemas;
  fields: Field[];
  submitLabel: string;
  successPath?: string;
  links: { href: string; label: string }[];
};

export function AuthForm({
  title,
  description,
  endpoint,
  fields,
  submitLabel,
  successPath,
  links,
}: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const {
    register,
    handleSubmit,
    getFieldState,
    formState,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchemas[endpoint]),
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });
  const isPending = formState.isSubmitting;

  async function onSubmit(data: AuthFormValues) {
    setError(undefined);
    setSuccess(undefined);
    try {
      const response = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        setError(await getErrorMessage(response));
        return;
      }

      if (successPath) {
        router.push(successPath);
        // O destino é renderizado no servidor a partir dos cookies de sessão,
        // que só existem depois desta resposta.
        router.refresh();
        return;
      }
      setSuccess("Solicitação recebida. Verifique sua caixa de e-mail.");
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-frame">
        <section className="auth-scene">
          <Image
            alt=""
            className="auth-room-image"
            data-testid="auth-room-image"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            src="/rooms/room3.png"
          />
          <div className="auth-scene-content">
            <BrandMark href="/" size="md" />
            <div className="auth-scene-copy max-w-sm">
              <h1 className="auth-scene-title">Seu próximo lugar começa aqui.</h1>
              <p className="mt-4 max-w-72 text-sm leading-6 text-[#d4deeb] sm:text-base">
                Encontre estadias ou cuide dos seus espaços com segurança e discrição.
              </p>
            </div>
          </div>
        </section>
        <section className="auth-panel">
          <div className="auth-card">
            <div className="auth-emblem" aria-hidden="true">D</div>
            <h2 className="mt-5 font-serif text-3xl tracking-[-0.04em] text-(--white)">
              {title}
            </h2>
            <p className="mt-2 leading-relaxed text-(--gray)">{description}</p>
            <form className="mt-5 space-y-3.5" noValidate onSubmit={handleSubmit(onSubmit)}>
              {fields.map((field) => {
                const Icon = field.type === "email" ? LuMail : field.type === "password" ? LuLockKeyhole : null;
                const fieldError = getFieldState(field.name, formState).error;
                const inputId = `auth-${field.name}`;
                const errorId = `${inputId}-error`;

                return (
                  <div key={field.name} className="auth-field">
                    <label htmlFor={inputId} className="block text-sm font-semibold text-[#d5dfed]">
                      {field.label}
                      <span className="auth-input-wrap">
                        {Icon ? <Icon aria-hidden="true" size={17} /> : null}
                        <input
                          {...register(field.name)}
                          id={inputId}
                          type={field.type}
                          autoComplete={field.autoComplete}
                          defaultValue={field.defaultValue}
                          aria-invalid={fieldError ? "true" : undefined}
                          aria-describedby={fieldError ? errorId : undefined}
                          className="auth-input"
                        />
                      </span>
                    </label>
                    {fieldError?.message ? (
                      <p id={errorId} className="auth-field-error" role="alert">
                        <LuCircleAlert aria-hidden="true" size={15} />
                        {fieldError.message}
                      </p>
                    ) : null}
                  </div>
                );
              })}
              {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
              {success ? <FormFeedback tone="success">{success}</FormFeedback> : null}
              <button disabled={isPending} className="auth-submit" type="submit">
                <span>{isPending ? "Enviando..." : submitLabel}</span>
                <span aria-hidden="true">→</span>
              </button>
            </form>
            <div className="auth-divider">ou continue com</div>
            <div className="flex justify-center">
              <a
                aria-label="Continuar com Google"
                href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030"}/auth/google`}
                className="auth-provider"
              >
                <FcGoogle aria-hidden="true" size={24} />
              </a>
            </div>
            <nav className="mt-5 flex flex-col items-center gap-2 text-center text-sm font-semibold text-(--blue-light)">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="auth-link">
                  {link.label}
                </Link>
              ))}
            </nav>
            <p className="auth-reassurance">
              <LuShieldCheck aria-hidden="true" data-testid="auth-reassurance-icon" size={15} />
              <span>Seus dados estão seguros com a gente</span>
            </p>
          </div>
        </section>
      </section>
      <footer className="auth-footer">
        <span>© 2026 DOMUS X. Todos os direitos reservados.</span>
        <span>Seu espaço, do seu jeito.</span>
      </footer>
    </main>
  );
}
