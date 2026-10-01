"use client";

import { useState } from "react";
import { FormFeedback } from "@/components/form-feedback";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { genderIdentities, genderIdentityLabels, type GenderIdentity } from "@/lib/properties";
import { parseCurrentUser, type CurrentUser } from "@/lib/user";

export function GuestIdentityForm({
  value,
  onSaved,
}: {
  value?: GenderIdentity | null;
  onSaved: (user: CurrentUser) => void;
}) {
  const [selected, setSelected] = useState<GenderIdentity | "">(value ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();

  async function save() {
    if (!selected) {
      setError("Selecione uma opção.");
      return;
    }
    setPending(true);
    setError(undefined);
    setMessage(undefined);
    try {
      const user = parseCurrentUser(
        await sendApiRequest("/users/me/profiles/guest", {
          method: "PATCH",
          body: JSON.stringify({ genderIdentity: selected }),
        }),
      );
      if (!user) throw new Error("O servidor retornou dados inválidos. Tente novamente.");
      onSaved(user);
      setMessage("Informação salva.");
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-5 border-t border-(--line) pt-4">
      <label htmlFor="guest-gender-identity" className="block text-sm font-semibold text-(--gray)">
        Você se identifica como
      </label>
      <p className="mt-1 text-xs leading-relaxed text-(--gray)">
        Usado apenas para mostrar quartos compatíveis. Não é exibido a proprietários. Será exigido antes de reservar.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <select
          id="guest-gender-identity"
          value={selected}
          disabled={pending}
          onChange={(event) => {
            setSelected(genderIdentities.find((option) => option === event.target.value) ?? "");
            setMessage(undefined);
          }}
          className="w-full rounded-xl border border-(--line-strong) bg-(--navy) px-4 py-3 text-sm text-white outline-hidden transition-colors focus:border-(--blue-light) focus-visible:ring-2 focus-visible:ring-(--blue-light) disabled:opacity-60"
        >
          <option value="">Selecione</option>
          {genderIdentities.map((option) => (
            <option key={option} value={option}>{genderIdentityLabels[option]}</option>
          ))}
        </select>
        <button
          type="button"
          disabled={pending}
          onClick={() => void save()}
          className="shrink-0 rounded-xl border border-(--line-strong) px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>
      </div>
      <div aria-live="polite" className="mt-3 empty:hidden">
        {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
        {message ? <FormFeedback tone="success">{message}</FormFeedback> : null}
      </div>
    </div>
  );
}
