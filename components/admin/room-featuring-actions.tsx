"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/owner/confirm-dialog";
import { FieldError } from "@/components/owner/field-error";
import { Modal } from "@/components/owner/modal";
import { ModalActions } from "@/components/owner/modal-actions";
import { fieldClassName, labelClassName, secondaryButtonClassName } from "@/components/owner/styles";
import type { AdminRoom } from "@/lib/admin";
import { sendApiRequest, toErrorMessage } from "@/lib/api";

const DEFAULT_DURATION_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

export function RoomFeaturingActions({ room }: { room: Pick<AdminRoom, "id" | "title" | "featuringStatus" | "featuredFrom" | "featuredUntil"> }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [from, setFrom] = useState("");
  const [until, setUntil] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const keepsPeriod = room.featuringStatus === "ACTIVE" || room.featuringStatus === "SCHEDULED";

  function openEditor() {
    const start = keepsPeriod && room.featuredFrom ? new Date(room.featuredFrom) : new Date();
    const end = keepsPeriod && room.featuredUntil ? new Date(room.featuredUntil) : new Date(start.getTime() + DEFAULT_DURATION_DAYS * DAY_MS);
    setFrom(toLocalInput(start));
    setUntil(toLocalInput(end));
    setError(undefined);
    setEditing(true);
  }

  async function run(request: () => Promise<unknown>, onDone: () => void) {
    setPending(true);
    setError(undefined);
    try {
      await request();
      onDone();
      router.refresh();
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    } finally {
      setPending(false);
    }
  }

  function save(event: FormEvent) {
    event.preventDefault();
    if (!from || !until) {
      setError("Informe o início e o fim do destaque.");
      return;
    }
    void run(
      () =>
        sendApiRequest(`/admin/rooms/${room.id}/featured`, {
          method: "PUT",
          body: JSON.stringify({ featuredFrom: new Date(from).toISOString(), featuredUntil: new Date(until).toISOString() }),
        }),
      () => setEditing(false),
    );
  }

  function end() {
    void run(
      () => sendApiRequest(`/admin/rooms/${room.id}/featured`, { method: "DELETE" }),
      () => setConfirming(false),
    );
  }

  const endLabel = room.featuringStatus === "ACTIVE" ? "Encerrar destaque" : "Cancelar agendamento";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={openEditor} className={secondaryButtonClassName}>
          {keepsPeriod ? "Alterar período" : "Destacar"}
        </button>
        {keepsPeriod ? (
          <button type="button" onClick={() => setConfirming(true)} className={secondaryButtonClassName}>
            {endLabel}
          </button>
        ) : null}
      </div>
      {error && !editing ? (
        <p role="alert" className="text-sm text-(--danger)">
          {error}
        </p>
      ) : null}

      <Modal open={editing} title={`Destaque · ${room.title}`} description="Horários no fuso do seu navegador." onClose={() => setEditing(false)} dismissible={!pending}>
        <form noValidate onSubmit={save} className="flex flex-col gap-5">
          <div>
            <label htmlFor={`featured-from-${room.id}`} className={labelClassName}>
              Início
            </label>
            <input id={`featured-from-${room.id}`} type="datetime-local" required value={from} onChange={(event) => setFrom(event.target.value)} className={fieldClassName} />
          </div>
          <div>
            <label htmlFor={`featured-until-${room.id}`} className={labelClassName}>
              Fim
            </label>
            <input
              id={`featured-until-${room.id}`}
              type="datetime-local"
              required
              value={until}
              onChange={(event) => setUntil(event.target.value)}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? `featured-${room.id}-error` : undefined}
              className={fieldClassName}
            />
            <FieldError id={`featured-${room.id}-error`} message={error} />
          </div>
          <ModalActions pending={pending} submitLabel="Salvar destaque" onCancel={() => setEditing(false)} />
        </form>
      </Modal>

      <ConfirmDialog
        open={confirming}
        title={endLabel}
        description={
          room.featuringStatus === "ACTIVE"
            ? `${room.title} deixa de aparecer em destaque a partir de agora.`
            : `O destaque agendado de ${room.title} será removido.`
        }
        confirmLabel={endLabel}
        pending={pending}
        onConfirm={end}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}

function toLocalInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
