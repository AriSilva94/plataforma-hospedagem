"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Combobox } from "@/components/combobox";
import { FormFeedback } from "@/components/form-feedback";
import { FieldError } from "@/components/field-error";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { guestIdentitySchema, type GuestIdentityFormInput, type GuestIdentityFormValues } from "@/lib/auth-form-schema";
import { genderIdentities, genderIdentityLabels, type GenderIdentity } from "@/lib/properties";
import { parseCurrentUser, type CurrentUser } from "@/lib/user";

const identityOptions = genderIdentities.map((identity) => ({ value: identity, label: genderIdentityLabels[identity] }));

export function GuestIdentityForm({
  value,
  onSaved,
}: {
  value?: GenderIdentity | null;
  onSaved: (user: CurrentUser) => void;
}) {
  const { control, handleSubmit, formState } = useForm<GuestIdentityFormInput, unknown, GuestIdentityFormValues>({
    resolver: zodResolver(guestIdentitySchema),
    defaultValues: { genderIdentity: value ?? "" },
  });
  const { errors, isSubmitting } = formState;
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();

  async function save(values: GuestIdentityFormValues) {
    setError(undefined);
    setMessage(undefined);
    try {
      const user = parseCurrentUser(
        await sendApiRequest("/users/me/profiles/guest", { method: "PATCH", body: JSON.stringify(values) }),
      );
      if (!user) throw new Error("O servidor retornou dados inválidos. Tente novamente.");
      onSaved(user);
      setMessage("Informação salva.");
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(save)} className="mt-5 border-t border-(--line) pt-4">
      <label id="guest-gender-identity-label" htmlFor="guest-gender-identity" className="block text-sm font-semibold text-(--gray)">
        Você se identifica como
      </label>
      <p className="mt-1 text-xs leading-relaxed text-(--gray)">
        Usado apenas para mostrar quartos compatíveis. Não é exibido a proprietários. Será exigido antes de reservar.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <div className="min-w-0 flex-1">
          <Controller
            control={control}
            name="genderIdentity"
            render={({ field }) => (
              <Combobox
                ref={field.ref}
                id="guest-gender-identity"
                labelId="guest-gender-identity-label"
                value={field.value}
                options={identityOptions}
                onChange={(identity) => {
                  field.onChange(identity);
                  setMessage(undefined);
                }}
                onBlur={field.onBlur}
                placeholder="Selecione"
                searchLabel="Buscar opção"
                emptyMessage="Nenhuma opção encontrada."
                clearable={false}
                disabled={isSubmitting}
                invalid={Boolean(errors.genderIdentity)}
                describedBy={errors.genderIdentity ? "guest-gender-identity-error" : undefined}
              />
            )}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="shrink-0 rounded-xl border border-(--line-strong) px-4 py-3 text-sm font-semibold text-(--white) transition-colors hover:bg-(--white)/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </button>
      </div>
      <FieldError id="guest-gender-identity-error" message={errors.genderIdentity?.message} />
      <div aria-live="polite" className="mt-3 empty:hidden">
        {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
        {message ? <FormFeedback tone="success">{message}</FormFeedback> : null}
      </div>
    </form>
  );
}
