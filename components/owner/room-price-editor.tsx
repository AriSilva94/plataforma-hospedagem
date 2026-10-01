"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LuPencil } from "react-icons/lu";
import { FieldError } from "@/components/owner/field-error";
import { Modal } from "@/components/owner/modal";
import { ModalActions } from "@/components/owner/modal-actions";
import { fieldClassName, labelClassName } from "@/components/owner/styles";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { centsToInput, roomSchema } from "@/lib/owner-forms";
import { formatCents } from "@/lib/properties";

const priceSchema = roomSchema.pick({ price: true });

export function RoomPriceEditor({ roomId, roomTitle, priceCents }: { roomId: string; roomTitle: string; priceCents: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(centsToInput(priceCents));
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  function close() {
    setOpen(false);
    setError(undefined);
    setValue(centsToInput(priceCents));
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const parsed = priceSchema.safeParse({ price: value });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setPending(true);
    setError(undefined);
    try {
      await sendApiRequest(`/owner/rooms/${roomId}`, { method: "PATCH", body: JSON.stringify({ priceCents: parsed.data.price }) });
      setOpen(false);
      router.refresh();
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Alterar o valor da diária de ${roomTitle}, atualmente ${formatCents(priceCents)}`}
        className="-mx-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-lg font-extrabold text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-(--blue-light)"
      >
        <span>
          {formatCents(priceCents)} <span className="text-sm font-semibold text-(--gray)">/ diária</span>
        </span>
        <LuPencil aria-hidden="true" size={14} className="text-(--blue-light)" />
      </button>
      <Modal open={open} title={`Valor da diária · ${roomTitle}`} onClose={close} dismissible={!pending}>
        <form noValidate onSubmit={(event) => void save(event)} className="flex flex-col gap-5">
          <div>
            <label htmlFor={`price-${roomId}`} className={labelClassName}>Valor da diária (R$)</label>
            <input
              id={`price-${roomId}`}
              inputMode="decimal"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? `price-${roomId}-error` : undefined}
              className={fieldClassName}
            />
            <FieldError id={`price-${roomId}-error`} message={error} />
          </div>
          <ModalActions pending={pending} submitLabel="Salvar valor" onCancel={close} />
        </form>
      </Modal>
    </>
  );
}
