"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LuLockKeyhole } from "react-icons/lu";
import { FieldError } from "@/components/field-error";
import { FormFeedback } from "@/components/form-feedback";
import { IconInput, fieldLabelClassName } from "@/components/icon-input";
import { primaryButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { changePasswordSchema, type ChangePasswordFormValues } from "@/lib/auth-form-schema";

const fields = [
  { name: "currentPassword", label: "Senha atual", autoComplete: "current-password" },
  { name: "newPassword", label: "Nova senha", autoComplete: "new-password", hint: "Use pelo menos 12 caracteres." },
  { name: "confirmPassword", label: "Repita a nova senha", autoComplete: "new-password" },
] as const;

export function ChangePasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const { register, handleSubmit, formState, reset } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const { errors, isSubmitting } = formState;

  function close() {
    reset();
    setError(undefined);
    setIsPasswordVisible(false);
    setIsOpen(false);
  }

  async function changePassword(values: ChangePasswordFormValues) {
    setError(undefined);
    try {
      await sendApiRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
      });
      close();
      setMessage("Senha alterada. Os outros dispositivos foram desconectados.");
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    }
  }

  if (!hasPassword) {
    return (
      <div className="mt-5">
        <p className="max-w-prose text-sm leading-relaxed text-(--text-secondary)">
          Sua conta ainda não tem senha. Você pode definir uma pelo link enviado ao seu e-mail.
        </p>
        <Link href="/recuperar-senha" className={`mt-4 ${secondaryButtonClassName}`}>
          Definir senha por e-mail
        </Link>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className="mt-5">
        <button
          type="button"
          onClick={() => {
            setMessage(undefined);
            setIsOpen(true);
          }}
          className={secondaryButtonClassName}
        >
          Alterar senha
        </button>
        <div aria-live="polite" className="mt-4 empty:hidden">
          {message ? <FormFeedback tone="success">{message}</FormFeedback> : null}
        </div>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit(changePassword)} className="mt-6 max-w-md">
      <div className="grid gap-5">
        {fields.map((field, index) => {
          const fieldError = errors[field.name]?.message;
          const inputId = `change-password-${field.name}`;
          const errorId = `${inputId}-error`;
          const hintId = `${inputId}-hint`;
          const hint = "hint" in field ? field.hint : undefined;

          return (
            <div key={field.name}>
              <label htmlFor={inputId} className={fieldLabelClassName}>{field.label}</label>
              <IconInput
                {...register(field.name)}
                icon={LuLockKeyhole}
                id={inputId}
                type={isPasswordVisible ? "text" : "password"}
                autoComplete={field.autoComplete}
                autoFocus={index === 0}
                disabled={isSubmitting}
                aria-invalid={fieldError ? "true" : undefined}
                aria-describedby={fieldError ? errorId : hint ? hintId : undefined}
              />
              {fieldError ? (
                <FieldError id={errorId} message={fieldError} />
              ) : hint ? (
                <p id={hintId} className="mt-2 text-[13px] leading-relaxed text-(--text-secondary)">{hint}</p>
              ) : null}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        aria-pressed={isPasswordVisible}
        onClick={() => setIsPasswordVisible((visible) => !visible)}
        className="mt-3 rounded-sm text-xs font-semibold text-(--primary-text) hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
      >
        {isPasswordVisible ? "Ocultar senhas" : "Mostrar senhas"}
      </button>
      <p className="mt-4 text-[13px] leading-relaxed text-(--text-secondary)">
        Ao alterar a senha, os outros dispositivos conectados à sua conta serão desconectados.
      </p>
      {error ? (
        <div className="mt-4">
          <FormFeedback tone="error">{error}</FormFeedback>
        </div>
      ) : null}
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
        <button type="submit" disabled={isSubmitting} className={`sm:order-2 ${primaryButtonClassName}`}>
          {isSubmitting ? "Salvando..." : "Salvar nova senha"}
        </button>
        <button type="button" disabled={isSubmitting} onClick={close} className={secondaryButtonClassName}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
