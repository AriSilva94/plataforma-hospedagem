"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LuLockKeyhole } from "react-icons/lu";
import { FieldError } from "@/components/field-error";
import { FormFeedback } from "@/components/form-feedback";
import { IconInput, fieldLabelClassName } from "@/components/icon-input";
import { Modal } from "@/components/owner/modal";
import { dangerButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { deactivateAccountSchema, type DeactivateAccountFormValues } from "@/lib/auth-form-schema";

export function DeactivateAccount({ hasPassword }: { hasPassword: boolean }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>();
  const { register, handleSubmit, formState, reset } = useForm<DeactivateAccountFormValues>({
    resolver: hasPassword ? zodResolver(deactivateAccountSchema) : undefined,
    defaultValues: { currentPassword: "" },
  });
  const { errors, isSubmitting } = formState;

  function close() {
    reset();
    setError(undefined);
    setIsOpen(false);
  }

  async function deactivate(values: DeactivateAccountFormValues) {
    setError(undefined);
    try {
      await sendApiRequest("/auth/deactivate-account", {
        method: "POST",
        body: JSON.stringify(hasPassword ? values : {}),
      });
      router.push("/login?conta=desativada");
      router.refresh();
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    }
  }

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={`mt-5 ${dangerButtonClassName}`}>
        Desativar conta
      </button>
      <Modal
        open={isOpen}
        title="Desativar sua conta?"
        description="Você será desconectado de todos os dispositivos e não poderá mais entrar. Seus anúncios deixam de aparecer na busca. Você não consegue reativar a conta sozinho: só a equipe da plataforma pode fazer isso."
        dismissible={!isSubmitting}
        onClose={close}
      >
        <form noValidate onSubmit={handleSubmit(deactivate)} className="flex flex-col gap-5">
          {hasPassword ? (
            <div>
              <label htmlFor="deactivate-current-password" className={fieldLabelClassName}>
                Confirme com sua senha
              </label>
              <IconInput
                {...register("currentPassword")}
                icon={LuLockKeyhole}
                id="deactivate-current-password"
                type="password"
                autoComplete="current-password"
                disabled={isSubmitting}
                aria-invalid={errors.currentPassword ? "true" : undefined}
                aria-describedby={errors.currentPassword ? "deactivate-current-password-error" : undefined}
              />
              <FieldError id="deactivate-current-password-error" message={errors.currentPassword?.message} />
            </div>
          ) : null}
          {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" disabled={isSubmitting} onClick={close} className={secondaryButtonClassName}>
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className={dangerButtonClassName}>
              {isSubmitting ? "Desativando..." : "Desativar conta"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
