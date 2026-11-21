"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { LuPlus } from "react-icons/lu";
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
}: {
  propertyId: string;
  rooms: RoomDetail[];
  emptyCount: number;
  reviewHref: string;
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
    <div className="flex flex-col gap-6 py-8">
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

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setCards((current) => [...current, emptyCard()])} className={secondaryButtonClassName}>
          <LuPlus aria-hidden="true" size={17} />
          Adicionar quarto
        </button>
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
