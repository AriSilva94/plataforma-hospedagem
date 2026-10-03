"use client";

import Image from "next/image";
import { memo, useEffect, useLayoutEffect, useRef, useState, type DragEvent, type KeyboardEvent, type PointerEvent } from "react";
import { flushSync } from "react-dom";
import { z } from "@/lib/zod";
import { LuCheck, LuGripVertical, LuImagePlus, LuLoaderCircle, LuPlay, LuStar, LuTrash2 } from "react-icons/lu";
import { FormFeedback } from "@/components/form-feedback";
import { ConfirmDialog } from "@/components/owner/confirm-dialog";
import { secondaryButtonClassName } from "@/components/owner/styles";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { mediaSchema, type Media } from "@/lib/properties";

const MB = 1024 * 1024;
const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const videoTypes = ["video/mp4", "video/quicktime", "video/webm"];
const galleryResponseSchema = z.object({ media: z.array(mediaSchema) });
const AUTO_SCROLL_EDGE = 72;
const AUTO_SCROLL_STEP = 14;
const SHIFT_DURATION_MS = 200;
const SHIFT_CLASSES = ["transition-transform", "duration-200", "ease-out"];
const REORDER_INSTRUCTIONS_ID = "media-reorder-instructions";

type DragSession = {
  id: string;
  pointerId: number;
  fromIndex: number;
  overIndex: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  slots: { left: number; top: number }[];
  nodes: HTMLLIElement[];
  listPageLeft: number;
  listPageTop: number;
  previous: Media[];
  frame: number;
};

type TileActions = {
  startDrag: (event: PointerEvent<HTMLButtonElement>, id: string) => void;
  trackPointer: (event: PointerEvent<HTMLButtonElement>) => void;
  endDrag: (event: PointerEvent<HTMLButtonElement>, commit: boolean) => void;
  reorderKey: (event: KeyboardEvent<HTMLButtonElement>, id: string) => void;
  releaseKeyboard: (id: string) => void;
  makeCover: (id: string) => void;
  remove: (item: Media) => void;
  registerTile: (id: string, node: HTMLLIElement | null) => void;
};

function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function sameOrder(a: Media[], b: Media[]): boolean {
  return a.length === b.length && a.every((item, index) => item.id === b[index].id);
}

function shiftedIndex(index: number, from: number, to: number): number {
  if (index === from) return to;
  if (from < to && index > from && index <= to) return index - 1;
  if (from > to && index >= to && index < from) return index + 1;
  return index;
}

function mediaLabel(item: Media, index: number): string {
  return item.type === "IMAGE" ? `Foto ${index + 1}` : `Vídeo ${index + 1}`;
}

const MediaTile = memo(function MediaTile({
  item,
  index,
  isCover,
  lifted,
  grabbed,
  disabled,
  canReorder,
  actions,
}: {
  item: Media;
  index: number;
  isCover: boolean;
  lifted: boolean;
  grabbed: boolean;
  disabled: boolean;
  canReorder: boolean;
  actions: TileActions;
}) {
  const label = mediaLabel(item, index);
  const stateClassName = lifted
    ? "border-dashed border-(--blue-light) opacity-40"
    : grabbed
      ? "border-(--blue-light) ring-2 ring-(--blue-light)"
      : "border-(--line-strong)";

  return (
    <li ref={(node) => actions.registerTile(item.id, node)} className={`overflow-hidden rounded-xl border bg-(--surface) ${stateClassName}`}>
      <div className="relative aspect-4/3 bg-(--surface-raised)">
        {item.type === "IMAGE" ? (
          <Image src={item.url} alt={label} fill draggable={false} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover" />
        ) : (
          <video src={`${item.url}#t=0.1`} controls preload="metadata" aria-label={label} className="size-full object-cover" />
        )}
        <span className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold text-white ${isCover ? "bg-(--blue)" : "bg-black/70"}`}>
          {isCover ? (
            <>
              <LuStar aria-hidden="true" size={12} /> Capa
            </>
          ) : (
            <span className="tabular-nums">{index + 1}</span>
          )}
        </span>
        {canReorder ? (
          <button
            type="button"
            aria-label={`Reordenar ${label}`}
            aria-describedby={REORDER_INSTRUCTIONS_ID}
            aria-pressed={grabbed}
            disabled={disabled}
            onPointerDown={(event) => actions.startDrag(event, item.id)}
            onPointerMove={actions.trackPointer}
            onPointerUp={(event) => actions.endDrag(event, true)}
            onPointerCancel={(event) => actions.endDrag(event, false)}
            onKeyDown={(event) => actions.reorderKey(event, item.id)}
            onBlur={(event) => {
              if (event.relatedTarget) actions.releaseKeyboard(item.id);
            }}
            className="absolute right-2 top-2 flex size-11 cursor-grab touch-none items-center justify-center rounded-lg bg-black/70 text-white transition-colors hover:bg-black/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light) active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40 aria-pressed:bg-(--blue) sm:size-9"
          >
            <LuGripVertical aria-hidden="true" size={18} />
          </button>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-1.5 p-1.5">
        {item.type === "IMAGE" && !isCover ? (
          <button
            type="button"
            aria-label={`Tornar capa: ${label}`}
            disabled={disabled}
            onClick={() => actions.makeCover(item.id)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-(--blue-light) transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-(--blue-light) disabled:opacity-40 sm:min-h-9"
          >
            <LuStar aria-hidden="true" size={14} />
            Tornar capa
          </button>
        ) : (
          <span className="px-2 text-xs text-(--gray)">{isCover ? "Foto de capa" : "Vídeo"}</span>
        )}
        <button
          type="button"
          aria-label={`Remover ${label}`}
          disabled={disabled}
          onClick={() => actions.remove(item)}
          className="flex size-11 items-center justify-center rounded-lg text-(--danger) transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-(--blue-light) disabled:opacity-40 sm:size-9"
        >
          <LuTrash2 aria-hidden="true" size={16} />
        </button>
      </div>
    </li>
  );
});

export function MediaGallery({
  basePath,
  initialMedia,
  allowVideo,
  maxImages,
  maxVideos = 0,
}: {
  basePath: string;
  initialMedia: Media[];
  allowVideo: boolean;
  maxImages: number;
  maxVideos?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef(new Map<string, HTMLLIElement>());
  const sessionRef = useRef<DragSession | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const keyboardSnapshotRef = useRef<Media[]>([]);
  const [media, setMedia] = useState(initialMedia);
  const [progress, setProgress] = useState<{ done: number; total: number }>();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState<string>();
  const [removing, setRemoving] = useState<Media>();
  const [draggingId, setDraggingId] = useState<string>();
  const [grabbedId, setGrabbedId] = useState<string>();
  const [orderStatus, setOrderStatus] = useState<"saving" | "saved">();
  const [announcement, setAnnouncement] = useState("");
  const [filesOver, setFilesOver] = useState(false);
  const accept = [...imageTypes, ...(allowVideo ? videoTypes : [])].join(",");
  const coverId = media.find((item) => item.type === "IMAGE")?.id;
  const disabled = busy || Boolean(progress) || orderStatus === "saving";
  const canReorder = media.length > 1;
  const draggedItem = media.find((item) => item.id === draggingId);
  const stateRef = useRef({ media, disabled, grabbedId });

  useLayoutEffect(() => {
    stateRef.current = { media, disabled, grabbedId };
  });

  useLayoutEffect(() => {
    if (!grabbedId) return;
    const handle = tileRefs.current.get(grabbedId)?.querySelector<HTMLButtonElement>("button[aria-pressed]");
    if (handle && document.activeElement !== handle) handle.focus();
  }, [media, grabbedId]);

  useLayoutEffect(() => {
    const session = sessionRef.current;
    const ghost = ghostRef.current;
    if (!draggingId || !session || !ghost) return;
    ghost.style.width = `${session.width}px`;
    ghost.style.height = `${session.height}px`;
    placeGhost(ghost, session, pointerRef.current);
  }, [draggingId]);

  useEffect(() => () => cancelAnimationFrame(sessionRef.current?.frame ?? 0), []);

  const [actions] = useState<TileActions>(() => {
    async function persistOrder(next: Media[], previous: Media[]) {
      setMedia(next);
      setOrderStatus("saving");
      setErrors([]);
      setMessage(undefined);
      try {
        const response = galleryResponseSchema.parse(
          await sendApiRequest(`${basePath}/media/order`, { method: "PUT", body: JSON.stringify({ mediaIds: next.map((item) => item.id) }) }),
        );
        setMedia(response.media);
        setOrderStatus("saved");
        setAnnouncement("Ordem salva.");
      } catch (error) {
        setMedia(previous);
        setOrderStatus(undefined);
        setErrors([toErrorMessage(error)]);
        setAnnouncement("Não foi possível salvar a ordem.");
      }
    }

    function frame() {
      const session = sessionRef.current;
      if (!session) return;
      const pointer = pointerRef.current;
      const scroll = pointer.y < AUTO_SCROLL_EDGE ? -AUTO_SCROLL_STEP : pointer.y > window.innerHeight - AUTO_SCROLL_EDGE ? AUTO_SCROLL_STEP : 0;
      if (scroll !== 0) window.scrollBy(0, scroll);
      if (ghostRef.current) placeGhost(ghostRef.current, session, pointer);

      const x = pointer.x + window.scrollX - session.listPageLeft;
      const y = pointer.y + window.scrollY - session.listPageTop;
      const over = session.slots.findIndex((slot) => x >= slot.left && x < slot.left + session.width && y >= slot.top && y < slot.top + session.height);
      if (over >= 0 && over !== session.overIndex) {
        session.overIndex = over;
        session.nodes.forEach((node, index) => {
          const target = session.slots[shiftedIndex(index, session.fromIndex, over)];
          const dx = target.left - session.slots[index].left;
          const dy = target.top - session.slots[index].top;
          node.style.transform = dx === 0 && dy === 0 ? "" : `translate3d(${dx}px, ${dy}px, 0)`;
        });
      }
      session.frame = requestAnimationFrame(frame);
    }

    function finishDrag(commit: boolean) {
      const session = sessionRef.current;
      if (!session) return;
      cancelAnimationFrame(session.frame);
      sessionRef.current = null;
      const moved = commit && session.overIndex !== session.fromIndex;

      if (moved) {
        const next = moveItem(session.previous, session.fromIndex, session.overIndex);
        session.nodes.forEach((node) => {
          node.classList.remove(...SHIFT_CLASSES);
          node.style.transform = "";
        });
        flushSync(() => {
          setDraggingId(undefined);
          setMedia(next);
        });
        void persistOrder(next, session.previous);
        return;
      }

      session.nodes.forEach((node) => {
        node.style.transform = "";
      });
      setDraggingId(undefined);
      window.setTimeout(() => session.nodes.forEach((node) => node.classList.remove(...SHIFT_CLASSES)), SHIFT_DURATION_MS);
    }

    return {
      startDrag(event, id) {
        const list = listRef.current;
        const { media: current, disabled: locked, grabbedId: grabbed } = stateRef.current;
        if (!list || sessionRef.current || locked || grabbed || event.button !== 0) return;
        const nodes = current.map((item) => tileRefs.current.get(item.id)).filter((node): node is HTMLLIElement => Boolean(node));
        const fromIndex = current.findIndex((item) => item.id === id);
        if (nodes.length !== current.length || fromIndex < 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);

        const listRect = list.getBoundingClientRect();
        const tileRect = nodes[fromIndex].getBoundingClientRect();
        nodes.forEach((node) => node.classList.add(...SHIFT_CLASSES));
        pointerRef.current = { x: event.clientX, y: event.clientY };
        sessionRef.current = {
          id,
          pointerId: event.pointerId,
          fromIndex,
          overIndex: fromIndex,
          offsetX: event.clientX - tileRect.left,
          offsetY: event.clientY - tileRect.top,
          width: tileRect.width,
          height: tileRect.height,
          slots: nodes.map((node) => ({ left: node.offsetLeft, top: node.offsetTop })),
          nodes,
          listPageLeft: listRect.left + window.scrollX,
          listPageTop: listRect.top + window.scrollY,
          previous: current,
          frame: requestAnimationFrame(frame),
        };
        setOrderStatus(undefined);
        setDraggingId(id);
      },
      trackPointer(event) {
        if (sessionRef.current?.pointerId === event.pointerId) pointerRef.current = { x: event.clientX, y: event.clientY };
      },
      endDrag(event, commit) {
        if (sessionRef.current?.pointerId === event.pointerId) finishDrag(commit);
      },
      reorderKey(event, id) {
        const { media: current, disabled: locked, grabbedId: grabbed } = stateRef.current;
        if (locked || sessionRef.current) return;
        const index = current.findIndex((item) => item.id === id);
        const confirmKey = event.key === " " || event.key === "Enter";

        if (grabbed !== id) {
          if (!confirmKey || grabbed) return;
          event.preventDefault();
          keyboardSnapshotRef.current = current;
          setOrderStatus(undefined);
          setGrabbedId(id);
          setAnnouncement(
            `${mediaLabel(current[index], index)} selecionado. Posição ${index + 1} de ${current.length}. Use as setas para mover, Enter para confirmar ou Esc para cancelar.`,
          );
          return;
        }

        const step = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : 0;
        if (step !== 0) {
          event.preventDefault();
          const destination = index + step;
          if (destination < 0 || destination >= current.length) return;
          setMedia(moveItem(current, index, destination));
          setAnnouncement(`Posição ${destination + 1} de ${current.length}.`);
          return;
        }
        if (confirmKey) {
          event.preventDefault();
          setGrabbedId(undefined);
          if (sameOrder(keyboardSnapshotRef.current, current)) setAnnouncement("Posição mantida.");
          else void persistOrder(current, keyboardSnapshotRef.current);
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          setGrabbedId(undefined);
          setMedia(keyboardSnapshotRef.current);
          setAnnouncement("Reordenação cancelada.");
        }
      },
      releaseKeyboard(id) {
        const { media: current, grabbedId: grabbed } = stateRef.current;
        if (grabbed !== id) return;
        setGrabbedId(undefined);
        if (!sameOrder(keyboardSnapshotRef.current, current)) void persistOrder(current, keyboardSnapshotRef.current);
      },
      makeCover(id) {
        const current = stateRef.current.media;
        const target = current.find((item) => item.id === id);
        if (target) void persistOrder([target, ...current.filter((item) => item.id !== id)], current);
      },
      remove(item) {
        setRemoving(item);
      },
      registerTile(id, node) {
        if (node) tileRefs.current.set(id, node);
        else tileRefs.current.delete(id);
      },
    };
  });

  function validate(file: File): string | undefined {
    if (imageTypes.includes(file.type)) {
      return file.size > 10 * MB ? `${file.name}: a foto excede 10 MB.` : undefined;
    }
    if (allowVideo && videoTypes.includes(file.type)) {
      return file.size > 100 * MB ? `${file.name}: o vídeo excede 100 MB.` : undefined;
    }
    return `${file.name}: formato não suportado.`;
  }

  async function upload(files: File[]) {
    if (files.length === 0) return;
    setErrors([]);
    setMessage(undefined);
    setOrderStatus(undefined);
    const failures: string[] = [];
    let uploaded = 0;
    setProgress({ done: 0, total: files.length });

    for (const [index, file] of files.entries()) {
      const invalid = validate(file);
      if (invalid) {
        failures.push(invalid);
      } else {
        try {
          const body = new FormData();
          body.append("file", file);
          const created = mediaSchema.parse(await sendApiRequest(`${basePath}/media`, { method: "POST", body }));
          setMedia((current) => [...current, created]);
          uploaded += 1;
        } catch (error) {
          failures.push(`${file.name}: ${toErrorMessage(error)}`);
        }
      }
      setProgress({ done: index + 1, total: files.length });
    }

    setProgress(undefined);
    setErrors(failures);
    if (uploaded > 0) setMessage(uploaded === 1 ? "1 arquivo enviado." : `${uploaded} arquivos enviados.`);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove(item: Media) {
    setBusy(true);
    setErrors([]);
    setMessage(undefined);
    setOrderStatus(undefined);
    try {
      await sendApiRequest(`${basePath}/media/${item.id}`, { method: "DELETE" });
      setMedia((current) => current.filter((currentItem) => currentItem.id !== item.id));
    } catch (error) {
      setErrors([toErrorMessage(error)]);
    } finally {
      setBusy(false);
      setRemoving(undefined);
    }
  }

  function hasFiles(event: DragEvent) {
    return Array.from(event.dataTransfer.types).includes("Files");
  }

  function handleFilesOver(event: DragEvent<HTMLDivElement>) {
    if (!hasFiles(event) || disabled) return;
    event.preventDefault();
    setFilesOver(true);
  }

  function handleFilesLeave(event: DragEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFilesOver(false);
  }

  function handleFilesDrop(event: DragEvent<HTMLDivElement>) {
    if (!hasFiles(event)) return;
    event.preventDefault();
    setFilesOver(false);
    if (!disabled) void upload(Array.from(event.dataTransfer.files));
  }

  const removingTitle = removing?.type === "VIDEO" ? "Remover este vídeo?" : "Remover esta foto?";

  return (
    <section aria-label="Galeria" className="flex flex-col gap-5 py-6">
      <div
        onDragEnter={handleFilesOver}
        onDragOver={handleFilesOver}
        onDragLeave={handleFilesLeave}
        onDrop={handleFilesDrop}
        className={`flex flex-col gap-4 rounded-2xl border border-dashed p-5 transition-colors sm:flex-row sm:items-center sm:justify-between ${
          filesOver ? "border-(--blue-light) bg-[rgba(11,99,227,.14)]" : "border-(--line-strong) bg-(--surface)"
        }`}
      >
        <div>
          <h2 className="font-bold text-white">{allowVideo ? "Fotos e vídeos" : "Fotos"}</h2>
          <p className="mt-1 text-sm leading-relaxed text-(--gray)">
            <span className="hidden sm:inline">Arraste arquivos para cá ou use o botão. </span>
            Fotos JPEG, PNG ou WebP até 10 MB (máx. {maxImages})
            {allowVideo ? `; vídeos MP4, MOV ou WebM até 100 MB (máx. ${maxVideos})` : ""}.
          </p>
        </div>
        <label className={`${secondaryButtonClassName} shrink-0 cursor-pointer has-disabled:cursor-not-allowed has-disabled:opacity-60`}>
          <LuImagePlus aria-hidden="true" size={17} />
          {progress ? `Enviando ${progress.done}/${progress.total}...` : "Adicionar arquivos"}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={accept}
            disabled={disabled}
            onChange={(event) => void upload(Array.from(event.target.files ?? []))}
            className="sr-only"
          />
        </label>
      </div>

      <div aria-live="polite" className="flex flex-col gap-3 empty:hidden">
        {errors.map((error) => (
          <FormFeedback key={error} tone="error">{error}</FormFeedback>
        ))}
        {message ? <FormFeedback tone="success">{message}</FormFeedback> : null}
      </div>

      {media.length === 0 ? (
        <p className="text-sm text-(--gray)">Nenhum arquivo enviado ainda.</p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-(--gray)">
            {canReorder ? (
              <p id={REORDER_INSTRUCTIONS_ID} className="flex items-center gap-1.5">
                <LuGripVertical aria-hidden="true" size={14} className="shrink-0" />
                Arraste pelo ícone para reordenar. A primeira foto é a capa.
                <span className="sr-only">No teclado, foque o ícone, pressione Espaço, mova com as setas e confirme com Enter.</span>
              </p>
            ) : (
              <p>A primeira foto é a capa.</p>
            )}
            {orderStatus === "saving" ? (
              <p className="flex items-center gap-1.5">
                <LuLoaderCircle aria-hidden="true" size={14} className="motion-safe:animate-spin" />
                Salvando ordem…
              </p>
            ) : orderStatus === "saved" ? (
              <p className="flex items-center gap-1.5 text-(--success)">
                <LuCheck aria-hidden="true" size={14} />
                Ordem salva
              </p>
            ) : null}
          </div>

          <ol ref={listRef} className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {media.map((item, index) => (
              <MediaTile
                key={item.id}
                item={item}
                index={index}
                isCover={item.id === coverId}
                lifted={item.id === draggingId}
                grabbed={item.id === grabbedId}
                disabled={disabled}
                canReorder={canReorder}
                actions={actions}
              />
            ))}
          </ol>
        </div>
      )}

      <p aria-live="assertive" className="sr-only">
        {announcement}
      </p>

      {draggedItem ? (
        <div
          ref={ghostRef}
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-50 overflow-hidden rounded-xl border border-(--blue-light) bg-(--surface-raised) shadow-[0_24px_48px_-12px_rgba(0,0,0,.65)] will-change-transform"
        >
          {draggedItem.type === "IMAGE" ? (
            <Image src={draggedItem.url} alt="" fill draggable={false} sizes="320px" className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-white">
              <LuPlay aria-hidden="true" size={28} />
            </div>
          )}
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(removing)}
        title={removingTitle}
        description="O arquivo será apagado do anúncio. Essa ação não pode ser desfeita."
        confirmLabel="Remover"
        pendingLabel="Removendo..."
        pending={busy}
        onConfirm={() => removing && void remove(removing)}
        onCancel={() => setRemoving(undefined)}
      />
    </section>
  );
}

function placeGhost(ghost: HTMLDivElement, session: DragSession, pointer: { x: number; y: number }) {
  ghost.style.transform = `translate3d(${pointer.x - session.offsetX}px, ${pointer.y - session.offsetY}px, 0) scale(1.03)`;
}
