"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/owner/switch";
import { sendApiRequest, toErrorMessage } from "@/lib/api";

export function FeaturedToggle({ propertyId, featured, visible }: { propertyId: string; featured: boolean; visible: boolean }) {
  const router = useRouter();
  const [checked, setChecked] = useState(featured);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function change(next: boolean) {
    setPending(true);
    setError(undefined);
    try {
      await sendApiRequest(`/owner/properties/${propertyId}`, { method: "PATCH", body: JSON.stringify({ featured: next }) });
      setChecked(next);
      router.refresh();
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-(--line-strong) bg-(--surface) p-5">
      <Switch checked={checked} disabled={pending} onChange={(next) => void change(next)}>
        <span className="block font-bold text-white">Destacar na home</span>
        <span className="mt-1 block text-sm leading-relaxed text-(--gray)">
          {visible
            ? 'Aparece em "Locais em destaque" para todos os hóspedes.'
            : 'Fica em "Locais em destaque" quando o imóvel estiver publicado e com quarto reservável.'}
        </span>
      </Switch>
      {error ? <p role="alert" className="mt-2 text-sm text-(--danger)">{error}</p> : null}
    </div>
  );
}
