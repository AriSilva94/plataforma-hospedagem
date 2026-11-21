"use client";

import { useCallback, useId, useState } from "react";
import { LuChevronUp, LuPencil, LuTrash2 } from "react-icons/lu";
import { Combobox } from "@/components/combobox";
import { ConfirmDialog } from "@/components/owner/confirm-dialog";
import { MediaGallery } from "@/components/owner/media-gallery";
import { RoomForm, roomFormValues } from "@/components/owner/room-form";
import { cardClassName, dangerButtonClassName, labelClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import type { RoomInput } from "@/lib/owner-forms";
import { bedsSummary, formatCents, type RoomDetail } from "@/lib/properties";

function photoCountLabel(count: number) {
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
  const reportDirty = useCallback((dirty: boolean) => onDirtyChange(cardKey, dirty), [onDirtyChange, cardKey]);

  function copyFrom(sourceId: string) {
    const source = savedRooms.find((item) => item.id === sourceId);
    if (!source) return;
    setCopiedFrom(source.id);
    setInitialValues({ ...roomFormValues(source), title: "" });
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
    <li aria-labelledby={`${uid}-heading`} className={cardClassName}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-wide text-(--text-secondary) uppercase">{`Quarto ${index + 1}`}</p>
          <h2 id={`${uid}-heading`} className="mt-1 wrap-break-word text-lg font-bold text-(--text-primary)">
            {room ? room.title : "Novo quarto"}
          </h2>
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
        <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-(--text-secondary)">Diária</dt>
            <dd className="font-semibold text-(--text-primary)">{formatCents(room.priceCents)} / diária</dd>
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
            <dd className="font-semibold text-(--text-primary)">{photoCountLabel(room.media.length)}</dd>
          </div>
        </dl>
      ) : null}

      {!room && savedRooms.length > 0 ? (
        <div className="mt-4 max-w-sm">
          <span id={`${uid}-copy-label`} className={labelClassName}>
            Copiar dados de…
          </span>
          <div className="mt-1.5">
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
