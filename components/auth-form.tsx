"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LuCircleAlert, LuEye, LuEyeOff, LuLockKeyhole, LuMail } from "react-icons/lu";
import { useForm, type FieldPath } from "react-hook-form";
import { AuthShell } from "@/components/auth-shell";
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
  hint?: string;
};

type AuthFormProps = {
  title: string;
  description: string;
  endpoint: keyof typeof authSchemas;
  fields: Field[];
  presetValues?: { token: string };
  submitLabel: string;
  successPath?: string;
  notice?: string;
  links: { href: string; label: string }[];
};

export function AuthForm({
  title,
  description,
  endpoint,
  fields,
  presetValues,
  submitLabel,
  successPath,
  notice,
  links,
}: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const {
    register,
    handleSubmit,
    getFieldState,
    formState,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchemas[endpoint]),
    defaultValues: presetValues,
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
        router.refresh();
        return;
      }
      setSuccess("Solicitação recebida. Verifique sua caixa de e-mail.");
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
    }
  }

  return (
    <AuthShell title={title} description={description} links={links}>
      <form className="mt-5 space-y-3.5" noValidate onSubmit={handleSubmit(onSubmit)}>
        {notice ? <FormFeedback tone="success">{notice}</FormFeedback> : null}
        {fields.map((field) => {
          const Icon = field.type === "email" ? LuMail : field.type === "password" ? LuLockKeyhole : null;
          const fieldError = getFieldState(field.name, formState).error;
          const inputId = `auth-${field.name}`;
          const errorId = `${inputId}-error`;
          const hintId = `${inputId}-hint`;
          const describedBy = fieldError ? errorId : field.hint ? hintId : undefined;

          return (
            <div key={field.name} className="auth-field">
              <label htmlFor={inputId} className="block text-sm font-semibold text-[#d5dfed]">
                {field.label}
                <span className="auth-input-wrap">
                  {Icon ? <Icon aria-hidden="true" size={17} /> : null}
                  <input
                    {...register(field.name)}
                    id={inputId}
                    type={field.type === "password" && isPasswordVisible ? "text" : field.type}
                    autoComplete={field.autoComplete}
                    aria-invalid={fieldError ? "true" : undefined}
                    aria-describedby={describedBy}
                    className="auth-input"
                  />
                  {field.type === "password" ? (
                    <button
                      type="button"
                      className="auth-reveal"
                      aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                      aria-pressed={isPasswordVisible}
                      onClick={() => setIsPasswordVisible((visible) => !visible)}
                    >
                      {isPasswordVisible ? (
                        <LuEyeOff aria-hidden="true" size={17} />
                      ) : (
                        <LuEye aria-hidden="true" size={17} />
                      )}
                    </button>
                  ) : null}
                </span>
              </label>
              {fieldError?.message ? (
                <p id={errorId} className="auth-field-error" role="alert">
                  <LuCircleAlert aria-hidden="true" size={15} />
                  {fieldError.message}
                </p>
              ) : field.hint ? (
                <p id={hintId} className="mt-1.5 text-xs leading-normal text-(--gray)">
                  {field.hint}
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
    </AuthShell>
  );
}
