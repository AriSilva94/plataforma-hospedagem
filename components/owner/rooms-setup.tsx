"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LuArrowLeft, LuPlus } from "react-icons/lu";
import { ConfirmDialog } from "@/components/owner/confirm-dialog";
import { RoomSetupCard } from "@/components/owner/room-setup-card";
import { UnsavedChangesGuard } from "@/components/owner/unsaved-changes-guard";
import { primaryButtonClassName, secondaryButtonClassName } from "@/components/owner/styles";
import type { RoomDetail } from "@/lib/properties";

type Card = { key: string; room?: RoomDetail };

function emptyCard(): Card {
  return { key: crypto.randomUUID() };
}

export function RoomsSetup({
  propertyId,
  rooms,
  emptyCount,
  reviewHref,
  backHref,
}: {
  propertyId: string;
  rooms: RoomDetail[];
  emptyCount: number;
  reviewHref: string;
  backHref: string;
}) {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>(() => [
    ...rooms.map((room) => ({ key: room.id, room })),
    ...Array.from({ length: emptyCount }, emptyCard),
  ]);
  const [dirtyKeys, setDirtyKeys] = useState<ReadonlySet<string>>(new Set());
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const savedRooms = cards.flatMap((card) => (card.room ? [card.room] : []));

  const setDirty = useCallback((key: string, dirty: boolean) => {
    setDirtyKeys((current) => {
      if (current.has(key) === dirty) return current;
      const next = new Set(current);
      if (dirty) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  function save(key: string, room: RoomDetail) {
    setCards((current) => current.map((card) => (card.key === key ? { ...card, room } : card)));
    router.refresh();
  }

  function remove(key: string, saved: boolean) {
    setCards((current) => current.filter((card) => card.key !== key));
    setDirty(key, false);
    if (saved) router.refresh();
  }

  function continueToReview() {
    if (dirtyKeys.size > 0) setConfirmingLeave(true);
    else router.push(reviewHref);
  }

  return (
    <div className="flex flex-col gap-4 py-8">
      {cards.length > 0 ? (
        <p role="status" className="text-sm font-semibold text-(--text-secondary)">
          {`${savedRooms.length} de ${cards.length} ${cards.length === 1 ? "quarto salvo" : "quartos salvos"}`}
        </p>
      ) : null}
      <ol className="flex flex-col gap-4">
        {cards.map((card, index) => (
          <RoomSetupCard
            key={card.key}
            cardKey={card.key}
            index={index}
            propertyId={propertyId}
            room={card.room}
            savedRooms={savedRooms}
            onSaved={save}
            onDirtyChange={setDirty}
            onRemoved={remove}
          />
        ))}
      </ol>

      {cards.length === 0 ? (
        <p className="text-sm leading-relaxed text-(--text-secondary)">
          Nenhum quarto no cadastro. Adicione um quarto para informar preço, camas e fotos.
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => setCards((current) => [...current, emptyCard()])}
        className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-dashed border-(--border-strong) text-sm font-semibold text-(--primary-text) transition-colors hover:border-(--primary-border) hover:bg-(--primary-soft) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
      >
        <LuPlus aria-hidden="true" size={17} />
        Adicionar quarto
      </button>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-(--border) pt-6">
        <Link href={backHref} className={secondaryButtonClassName}>
          <LuArrowLeft aria-hidden="true" size={16} />
          Voltar
        </Link>
        <button type="button" disabled={savedRooms.length === 0} onClick={continueToReview} className={primaryButtonClassName}>
          Continuar para revisão
        </button>
        {savedRooms.length === 0 ? <p className="text-sm text-(--text-secondary)">Salve ao menos um quarto para continuar.</p> : null}
      </div>

      <UnsavedChangesGuard dirty={dirtyKeys.size > 0} />
      <ConfirmDialog
        open={confirmingLeave}
        title="Descartar alterações?"
        description="Você alterou campos que ainda não foram salvos. Se sair agora, essas alterações serão perdidas."
        confirmLabel="Sair sem salvar"
        cancelLabel="Continuar editando"
        onConfirm={() => {
          setConfirmingLeave(false);
          router.push(reviewHref);
        }}
        onCancel={() => setConfirmingLeave(false)}
      />
    </div>
  );
}
