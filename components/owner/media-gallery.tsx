"use client";

import Image from "next/image";
import { memo, useEffect, useEffectEvent, useId, useLayoutEffect, useRef, useState, type DragEvent, type KeyboardEvent, type PointerEvent } from "react";
import { flushSync } from "react-dom";
import { z } from "@/lib/zod";
import { LuCheck, LuGripVertical, LuImagePlus, LuImages, LuVideo, LuLoaderCircle, LuPause, LuPlay, LuStar, LuTrash2 } from "react-icons/lu";
import { FormFeedback } from "@/components/form-feedback";
import { ConfirmDialog } from "@/components/owner/confirm-dialog";
import { secondaryButtonClassName } from "@/components/owner/styles";
import { ApiRequestError, sendApiRequest, toErrorMessage } from "@/lib/api";
import { MediaKind, mediaSchema, type Media } from "@/lib/properties";

const MB = 1024 * 1024;
const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const videoTypes = ["video/mp4", "video/quicktime", "video/webm"];
const galleryResponseSchema = z.object({ media: z.array(mediaSchema) });
const AUTO_SCROLL_EDGE = 72;
const AUTO_SCROLL_STEP = 14;
const SHIFT_DURATION_MS = 200;
const SHIFT_CLASSES = ["transition-transform", "duration-200", "ease-out"];

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

function mergeOrder(all: Media[], reordered: Media[]): Media[] {
  const ids = new Set(reordered.map((item) => item.id));
  let next = 0;
  return all.map((item) => (ids.has(item.id) ? reordered[next++] : item));
}

function shiftedIndex(index: number, from: number, to: number): number {
  if (index === from) return to;
  if (from < to && index > from && index <= to) return index - 1;
  if (from > to && index >= to && index < from) return index + 1;
  return index;
}

type GridLayout = { columns: string; aspect: string; sizes: string };

const overlayButtonClassName =
  "inline-flex h-11 items-center justify-center rounded-xl bg-(--black)/70 text-(--on-primary) transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:cursor-not-allowed disabled:opacity-60 sm:h-9";

function gridLayout(count: number, compact: boolean): GridLayout {
  if (count === 1) return { columns: "grid-cols-1", aspect: "aspect-video", sizes: "(min-width: 1024px) 60vw, 100vw" };
  if (count === 2) return { columns: "grid-cols-2", aspect: "aspect-4/3", sizes: "(min-width: 1024px) 30vw, 50vw" };
  if (count === 3) return { columns: "grid-cols-3", aspect: "aspect-square sm:aspect-4/3", sizes: "(min-width: 1024px) 20vw, 33vw" };
  if (count === 4) return { columns: "grid-cols-2 sm:grid-cols-4", aspect: "aspect-4/3", sizes: "(min-width: 640px) 25vw, 50vw" };
  return compact
    ? { columns: "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5", aspect: "aspect-square sm:aspect-4/3", sizes: "(min-width: 1024px) 20vw, (min-width: 640px) 25vw, 33vw" }
    : { columns: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4", aspect: "aspect-4/3", sizes: "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" };
}

function mediaLabel(item: Media, index: number): string {
  return item.type === MediaKind.IMAGE ? `Foto ${index + 1}` : `Vídeo ${index + 1}`;
}

const MediaTile = memo(function MediaTile({
  item,
  index,
  isCover,
  lifted,
  grabbed,
  disabled,
  canReorder,
  instructionsId,
  actions,
  layout,
}: {
  item: Media;
  index: number;
  isCover: boolean;
  lifted: boolean;
  grabbed: boolean;
  disabled: boolean;
  canReorder: boolean;
  instructionsId: string;
  actions: TileActions;
  layout: GridLayout;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const label = mediaLabel(item, index);
  const stateClassName = lifted ? "border-dashed border-(--primary) opacity-40" : grabbed ? "border-(--primary) ring-2 ring-(--focus-ring)" : "border-(--border)";

  return (
    <li ref={(node) => actions.registerTile(item.id, node)} className={`@container overflow-hidden rounded-xl border bg-(--surface) ${stateClassName}`}>
      <div className={`relative bg-(--surface-raised) ${layout.aspect}`}>
        {item.type === MediaKind.IMAGE ? (
          <Image src={item.url} alt={label} fill draggable={false} sizes={layout.sizes} className="object-cover" />
        ) : (
          <>
            <video
              ref={videoRef}
              src={`${item.url}#t=0.1`}
              preload="metadata"
              playsInline
              aria-label={label}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className="size-full object-cover"
            />
            <button
              type="button"
              aria-label={playing ? `Pausar ${label}` : `Reproduzir ${label}`}
              onClick={() => {
                const video = videoRef.current;
                if (!video) return;
                if (video.paused) void video.play();
                else video.pause();
              }}
              className="group/play absolute inset-0 flex items-center justify-center focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--focus-ring)"
            >
              <span className={`flex size-10 items-center justify-center rounded-full bg-(--black)/70 text-(--on-primary) transition group-hover/play:bg-(--black)/85 ${playing ? "opacity-0 group-hover/play:opacity-100 group-focus-visible/play:opacity-100" : ""}`}>
                {playing ? <LuPause aria-hidden="true" size={18} /> : <LuPlay aria-hidden="true" size={18} className="translate-x-px" />}
              </span>
            </button>
          </>
        )}
        <span className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold text-(--on-primary) ${isCover ? "bg-(--primary)" : "bg-(--black)/70"}`}>
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
            aria-describedby={instructionsId}
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
            className="absolute right-2 top-2 flex size-11 cursor-grab touch-none items-center justify-center rounded-xl bg-(--black)/70 text-(--on-primary) transition-colors hover:bg-(--black)/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-60 aria-pressed:bg-(--primary) sm:size-9"
          >
            <LuGripVertical aria-hidden="true" size={18} />
          </button>
        ) : null}
        <div className="absolute inset-x-2 bottom-2 flex items-end justify-between gap-1.5">
          {!isCover ? (
            <button
              type="button"
              aria-label={`Tornar capa: ${label}`}
              disabled={disabled}
              onClick={() => actions.makeCover(item.id)}
              className={`${overlayButtonClassName} gap-1.5 px-3 text-xs font-semibold hover:bg-(--primary) @max-[11rem]:w-11 @max-[11rem]:px-0 sm:@max-[11rem]:w-9`}
            >
              <LuStar aria-hidden="true" size={14} className="shrink-0" />
              <span className="@max-[11rem]:sr-only">Tornar capa</span>
            </button>
          ) : (
            <span />
          )}
          <button type="button" aria-label={`Remover ${label}`} disabled={disabled} onClick={() => actions.remove(item)} className={`${overlayButtonClassName} w-11 hover:bg-(--error) sm:w-9`}>
            <LuTrash2 aria-hidden="true" size={16} />
          </button>
        </div>
      </div>
    </li>
  );
});

export function MediaGallery({
  label,
  basePath,
  initialMedia,
  allowVideo,
  maxImages,
  maxVideos = 0,
  compact = false,
  onChange,
}: {
  label: string;
  basePath: string;
  initialMedia: Media[];
  allowVideo: boolean;
  maxImages: number;
  maxVideos?: number;
  compact?: boolean;
  onChange?: (media: Media[]) => void;
}) {
  const reorderInstructionsId = useId();
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
  const notifyChange = useEffectEvent((next: Media[]) => onChange?.(next));

  useEffect(() => {
    notifyChange(media);
  }, [media]);
  const [grabbedId, setGrabbedId] = useState<string>();
  const [orderStatus, setOrderStatus] = useState<"saving" | "saved">();
  const [announcement, setAnnouncement] = useState("");
  const [filesOver, setFilesOver] = useState(false);
  const [kind, setKind] = useState<MediaKind>("IMAGE");
  const accept = (kind === MediaKind.IMAGE ? imageTypes : videoTypes).join(",");
  const coverId = media[0]?.id;
  const visible = media.filter((item) => item.type === kind);
  const layout = gridLayout(visible.length, compact);
  const videoCount = media.length - media.filter((item) => item.type === MediaKind.IMAGE).length;
  const photoCount = media.length - videoCount;
  const disabled = busy || Boolean(progress) || orderStatus === "saving";
  const canReorder = visible.length > 1;
  const single = kind === MediaKind.IMAGE && maxImages === 1;
  const singleFull = single && photoCount >= 1;
  const singlePhoto = single && media.length === 1 && media[0].type === MediaKind.IMAGE ? media[0] : undefined;
  const draggedItem = media.find((item) => item.id === draggingId);
  const stateRef = useRef({ media: visible, all: media, disabled, grabbedId });

  useLayoutEffect(() => {
    stateRef.current = { media: visible, all: media, disabled, grabbedId };
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
          await sendApiRequest(`${basePath}/media/order`, {
            method: "PUT",
            body: JSON.stringify({ mediaIds: next.map((item) => item.id) }),
          }),
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
        const allBefore = stateRef.current.all;
        session.nodes.forEach((node) => {
          node.classList.remove(...SHIFT_CLASSES);
          node.style.transform = "";
        });
        flushSync(() => {
          setDraggingId(undefined);
          setMedia((all) => mergeOrder(all, next));
        });
        void persistOrder(mergeOrder(allBefore, next), allBefore);
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
          slots: nodes.map((node) => ({
            left: node.offsetLeft,
            top: node.offsetTop,
          })),
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
        const { media: current, all, disabled: locked, grabbedId: grabbed } = stateRef.current;
        if (locked || sessionRef.current) return;
        const index = current.findIndex((item) => item.id === id);
        const confirmKey = event.key === " " || event.key === "Enter";

        if (grabbed !== id) {
          if (!confirmKey || grabbed) return;
          event.preventDefault();
          keyboardSnapshotRef.current = all;
          setOrderStatus(undefined);
          setGrabbedId(id);
          setAnnouncement(`${mediaLabel(current[index], index)} selecionado. Posição ${index + 1} de ${current.length}. Use as setas para mover, Enter para confirmar ou Esc para cancelar.`);
          return;
        }

        const step = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : 0;
        if (step !== 0) {
          event.preventDefault();
          const destination = index + step;
          if (destination < 0 || destination >= current.length) return;
          const moved = moveItem(current, index, destination);
          setMedia((currentAll) => mergeOrder(currentAll, moved));
          setAnnouncement(`Posição ${destination + 1} de ${current.length}.`);
          return;
        }
        if (confirmKey) {
          event.preventDefault();
          setGrabbedId(undefined);
          if (sameOrder(keyboardSnapshotRef.current, all)) setAnnouncement("Posição mantida.");
          else void persistOrder(all, keyboardSnapshotRef.current);
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
        const { all, grabbedId: grabbed } = stateRef.current;
        if (grabbed !== id) return;
        setGrabbedId(undefined);
        if (!sameOrder(keyboardSnapshotRef.current, all)) void persistOrder(all, keyboardSnapshotRef.current);
      },
      makeCover(id) {
        const current = stateRef.current.all;
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
    if (kind === MediaKind.IMAGE && imageTypes.includes(file.type)) {
      return file.size > 10 * MB ? `${file.name}: a foto excede 10 MB.` : undefined;
    }
    if (kind === MediaKind.VIDEO && videoTypes.includes(file.type)) {
      return file.size > 100 * MB ? `${file.name}: o vídeo excede 100 MB.` : undefined;
    }
    return `${file.name}: formato não suportado nesta aba.`;
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
          if (error instanceof ApiRequestError && error.status === 429) {
            failures.push(`${error.message} ${files.length - index} arquivo(s) não enviados.`);
            break;
          }
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
      await sendApiRequest(`${basePath}/media/${item.id}`, {
        method: "DELETE",
      });
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

  const removingTitle = removing?.type === MediaKind.VIDEO ? "Remover este vídeo?" : "Remover esta foto?";

  return (
    <section aria-label={label} className={compact ? "flex flex-col gap-3" : "flex flex-col gap-5 py-6"}>
      {allowVideo ? (
        <div role="tablist" aria-label="Tipo de mídia" className="flex w-full gap-1 rounded-[1.625rem] border border-(--border) bg-(--surface) p-1 sm:w-fit">
          {(
            [
              {
                id: "IMAGE",
                label: `Fotos ${photoCount}/${maxImages}`,
                icon: LuImages,
              },
              {
                id: "VIDEO",
                label: `Vídeos ${videoCount}/${maxVideos}`,
                icon: LuVideo,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={kind === tab.id}
              disabled={disabled}
              onClick={() => setKind(tab.id)}
              className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:opacity-60 sm:flex-none ${
                kind === tab.id ? "bg-(--primary) text-(--on-primary)" : "text-(--text-secondary) hover:bg-(--primary-soft) hover:text-(--text-primary)"
              }`}
            >
              <tab.icon aria-hidden="true" size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      {singlePhoto ? (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--surface) sm:flex-row sm:items-center sm:gap-4 sm:p-2 sm:pr-3">
          <div className="relative aspect-video w-full shrink-0 bg-(--surface-raised) sm:aspect-16/10 sm:w-44 sm:overflow-hidden sm:rounded-xl">
            <Image src={singlePhoto.url} alt={label} fill sizes="(min-width: 640px) 176px, 100vw" className="object-cover" />
          </div>
          <div className="flex items-center gap-3 py-2 pr-2 pl-3.5 sm:contents">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-(--text-primary)">
                <LuCheck aria-hidden="true" size={15} className="shrink-0 text-(--success)" />
                Foto adicionada
              </span>
              <span className="text-xs leading-relaxed text-pretty text-(--text-secondary)">
                Aparece no anúncio.<span className="max-sm:hidden"> Para trocar, remova e envie outra.</span>
              </span>
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setRemoving(singlePhoto)}
              className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-(--text-secondary) transition-colors hover:bg-(--error-soft) hover:text-(--error) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:opacity-60"
            >
              <LuTrash2 aria-hidden="true" size={16} />
              Remover
              <span className="sr-only"> foto</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleFilesOver}
          onDragOver={handleFilesOver}
          onDragLeave={handleFilesLeave}
          onDrop={handleFilesDrop}
          className={`flex rounded-2xl border border-dashed transition-colors ${compact ? "flex-row items-center justify-between gap-3 p-3.5" : "flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"} ${
            filesOver ? "border-(--primary) bg-(--primary-soft)" : "border-(--border-strong) bg-(--surface)"
          }`}
        >
          <div>
            <h2 className={compact ? "sr-only" : "font-bold text-(--text-primary)"}>{kind === MediaKind.IMAGE ? label : "Vídeos"}</h2>
            <p className={compact ? "text-xs leading-relaxed text-(--text-secondary)" : "mt-1 text-sm leading-relaxed text-(--text-secondary)"}>
              {singleFull ? (
                "Para trocar, remova a foto atual e envie outra."
              ) : single ? (
                <>
                  <span className="hidden sm:inline">Arraste a foto para cá ou use o botão. </span>
                  JPEG, PNG ou WebP até 10 MB.
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Arraste arquivos para cá ou use o botão. </span>
                  {kind === MediaKind.IMAGE ? `JPEG, PNG ou WebP até 10 MB (máx. ${maxImages}).` : `MP4, MOV ou WebM até 100 MB (máx. ${maxVideos}).`}
                </>
              )}
            </p>
          </div>
          <label className={`${secondaryButtonClassName} shrink-0 cursor-pointer has-disabled:cursor-not-allowed has-disabled:opacity-60`}>
            <LuImagePlus aria-hidden="true" size={17} />
            {progress ? `Enviando ${progress.done}/${progress.total}...` : single ? "Adicionar foto" : kind === MediaKind.IMAGE ? "Adicionar fotos" : "Adicionar vídeos"}
            <input
              ref={inputRef}
              type="file"
              multiple={!single}
              accept={accept}
              disabled={disabled || singleFull}
              onChange={(event) => void upload(Array.from(event.target.files ?? []))}
              className="sr-only"
            />
          </label>
        </div>
      )}

      <div aria-live="polite" className="flex flex-col gap-3 empty:hidden">
        {errors.map((error) => (
          <FormFeedback key={error} tone="error">
            {error}
          </FormFeedback>
        ))}
        {message && !single ? <FormFeedback tone="success">{message}</FormFeedback> : null}
      </div>

      {singlePhoto || (single && visible.length === 0) ? null : visible.length === 0 ? (
        <p className="text-sm text-(--text-secondary)">{kind === MediaKind.IMAGE ? "Nenhuma foto enviada ainda." : "Nenhum vídeo enviado ainda."}</p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[13px] text-(--text-secondary)">
            {canReorder ? (
              <p id={reorderInstructionsId} className="flex items-center gap-1.5">
                <LuGripVertical aria-hidden="true" size={14} className="shrink-0" />
                Arraste pelo ícone para reordenar. O primeiro item é a capa, seja foto ou vídeo.
                <span className="sr-only">No teclado, foque o ícone, pressione Espaço, mova com as setas e confirme com Enter.</span>
              </p>
            ) : single ? null : (
              <p>O primeiro item é a capa, seja foto ou vídeo.</p>
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

          <ol ref={listRef} className={`relative grid ${compact ? "gap-2" : "gap-3"} ${layout.columns}`}>
            {visible.map((item, index) => (
              <MediaTile
                key={item.id}
                item={item}
                index={index}
                isCover={item.id === coverId}
                lifted={item.id === draggingId}
                grabbed={item.id === grabbedId}
                disabled={disabled}
                canReorder={canReorder}
                instructionsId={reorderInstructionsId}
                actions={actions}
                layout={layout}
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
          className="pointer-events-none fixed left-0 top-0 z-50 overflow-hidden rounded-xl border border-(--primary) bg-(--surface-raised) shadow-[0_24px_48px_-12px_color-mix(in_srgb,var(--shadow)_65%,transparent)] will-change-transform"
        >
          {draggedItem.type === MediaKind.IMAGE ? (
            <Image src={draggedItem.url} alt="" fill draggable={false} sizes="320px" className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-(--text-primary)">
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
