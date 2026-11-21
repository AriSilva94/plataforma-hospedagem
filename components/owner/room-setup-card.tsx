"use client";

import { useCallback, useId, useRef, useState } from "react";
import { LuCheck, LuChevronUp, LuPencil, LuTrash2 } from "react-icons/lu";
import { Combobox } from "@/components/combobox";
import { ConfirmDialog } from "@/components/owner/confirm-dialog";
import { MediaGallery } from "@/components/owner/media-gallery";
import { RoomForm, roomFormValues } from "@/components/owner/room-form";
import { dangerButtonClassName, labelClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import type { RoomInput } from "@/lib/owner-forms";
import { bedsSummary, countPhotos, formatCents, type RoomDetail } from "@/lib/properties";

function photoCountLabel(count: number) {
  if (count === 0) return "Nenhuma ainda";
  return count === 1 ? "1 foto" : `${count} fotos`;
}

export function RoomSetupCard({
  cardKey,
  index,
  propertyId,
  room,
  savedRooms,
  onSaved,
  onDirtyChange,
  onRemoved,
}: {
  cardKey: string;
  index: number;
  propertyId: string;
  room?: RoomDetail;
  savedRooms: RoomDetail[];
  onSaved: (cardKey: string, room: RoomDetail) => void;
  onDirtyChange: (cardKey: string, dirty: boolean) => void;
  onRemoved: (cardKey: string, saved: boolean) => void;
}) {
  const uid = useId();
  const [expanded, setExpanded] = useState(!room);
  const [copiedFrom, setCopiedFrom] = useState<string>();
  const [initialValues, setInitialValues] = useState<Partial<RoomInput>>();
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string>();
  const [formDirty, setFormDirty] = useState(false);
  const [pendingCopyId, setPendingCopyId] = useState<string>();
  const valuesRef = useRef<(() => RoomInput) | null>(null);
  const reportDirty = useCallback(
    (dirty: boolean) => {
      setFormDirty(dirty);
      onDirtyChange(cardKey, dirty || (!room && Boolean(copiedFrom)));
    },
    [onDirtyChange, cardKey, room, copiedFrom],
  );

  function applyCopy(sourceId: string) {
    const source = savedRooms.find((item) => item.id === sourceId);
    if (!source) return;
    setCopiedFrom(source.id);
    setInitialValues({ ...roomFormValues(source), title: valuesRef.current?.().title ?? "" });
  }

  function copyFrom(sourceId: string) {
    if (formDirty || copiedFrom) setPendingCopyId(sourceId);
    else applyCopy(sourceId);
  }

  async function remove() {
    if (!room) return;
    setRemoving(true);
    setError(undefined);
    try {
      await sendApiRequest(`/owner/rooms/${room.id}`, { method: "DELETE" });
      onRemoved(cardKey, true);
    } catch (requestError) {
      setError(toErrorMessage(requestError));
      setRemoving(false);
      setConfirmingRemove(false);
    }
  }

  return (
    <li aria-labelledby={`${uid}-heading`} className="rounded-2xl border border-(--border) bg-(--surface) p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold tabular-nums ${room ? "bg-(--success-soft) text-(--success)" : "bg-(--surface-raised) text-(--text-secondary)"}`}
          >
            {room ? <LuCheck size={16} /> : index + 1}
          </span>
          <div className="min-w-0">
            <h2 id={`${uid}-heading`} className="wrap-break-word text-lg font-bold text-(--text-primary)">
              <span className="sr-only">{`Quarto ${index + 1}: `}</span>
              {room ? room.title : "Novo quarto"}
            </h2>
            <p className="text-sm text-(--text-secondary)">{room ? "Salvo" : "Ainda não salvo"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {room ? (
            expanded ? (
              <button type="button" onClick={() => setExpanded(false)} className={secondaryButtonClassName}>
                <LuChevronUp aria-hidden="true" size={16} />
                Recolher
              </button>
            ) : (
              <button type="button" onClick={() => setExpanded(true)} className={secondaryButtonClassName}>
                <LuPencil aria-hidden="true" size={16} />
                Editar
              </button>
            )
          ) : null}
          <button
            type="button"
            disabled={removing}
            onClick={() => (room ? setConfirmingRemove(true) : onRemoved(cardKey, false))}
            className={dangerButtonClassName}
          >
            <LuTrash2 aria-hidden="true" size={16} />
            Remover
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-(--error)">
          {error}
        </p>
      ) : null}

      {room && !expanded ? (
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-(--border) pt-4 text-sm sm:grid-cols-4 sm:pl-11">
          <div>
            <dt className="text-(--text-secondary)">Diária</dt>
            <dd className="font-semibold text-(--text-primary) tabular-nums">{formatCents(room.priceCents)}</dd>
          </div>
          <div>
            <dt className="text-(--text-secondary)">Capacidade</dt>
            <dd className="font-semibold text-(--text-primary)">{room.capacity === 1 ? "1 pessoa" : `${room.capacity} pessoas`}</dd>
          </div>
          <div>
            <dt className="text-(--text-secondary)">Camas</dt>
            <dd className="font-semibold text-(--text-primary)">{room.beds.length > 0 ? bedsSummary(room.beds) : "Não informadas"}</dd>
          </div>
          <div>
            <dt className="text-(--text-secondary)">Fotos</dt>
            <dd className="font-semibold text-(--text-primary)">{photoCountLabel(countPhotos(room.media))}</dd>
          </div>
        </dl>
      ) : null}

      {!room && savedRooms.length > 0 ? (
        <div className="mt-4 rounded-xl bg-(--surface-raised) p-4 sm:ml-11">
          <span id={`${uid}-copy-label`} className={labelClassName}>
            Copiar dados de…
          </span>
          <div className="mt-1.5 max-w-sm">
            <Combobox
              id={`${uid}-copy`}
              labelId={`${uid}-copy-label`}
              value={copiedFrom ?? ""}
              options={savedRooms.map((item) => ({ value: item.id, label: item.title }))}
              onChange={copyFrom}
              placeholder="Escolha um quarto salvo"
              searchLabel="Buscar quarto"
              emptyMessage="Nenhum quarto encontrado."
              clearable={false}
            />
          </div>
          <p className="mt-1.5 text-[13px] text-(--text-secondary)">Copia tudo, menos o nome e as fotos.</p>
        </div>
      ) : null}

      <div className={expanded ? undefined : "hidden"}>
        <RoomForm
          key={copiedFrom ?? "blank"}
          propertyId={propertyId}
          room={room}
          inline
          initialValues={initialValues}
          onSaved={(saved) => onSaved(cardKey, saved)}
          onDirtyChange={reportDirty}
          valuesRef={valuesRef}
        />
        {room ? (
          <div className="border-t border-(--border) pt-6">
            <MediaGallery
              key={room.id}
              label={`Fotos de ${room.title}`}
              basePath={`/owner/rooms/${room.id}`}
              initialMedia={room.media}
              allowVideo
              maxImages={20}
              maxVideos={3}
            />
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(pendingCopyId)}
        title="Substituir os dados deste quarto?"
        description="Os campos já preenchidos neste quarto serão trocados pelos do quarto escolhido. O nome é mantido."
        confirmLabel="Copiar dados"
        tone="primary"
        onConfirm={() => {
          if (pendingCopyId) applyCopy(pendingCopyId);
          setPendingCopyId(undefined);
        }}
        onCancel={() => setPendingCopyId(undefined)}
      />
      <ConfirmDialog
        open={confirmingRemove}
        title="Excluir este quarto?"
        description="O quarto e todas as suas fotos serão removidos. Essa ação não pode ser desfeita."
        confirmLabel="Excluir quarto"
        pendingLabel="Excluindo..."
        pending={removing}
        onConfirm={() => void remove()}
        onCancel={() => setConfirmingRemove(false)}
      />
    </li>
  );
}
