"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { LuImagePlus, LuLoaderCircle, LuTrash2 } from "react-icons/lu";
import { FormFeedback } from "@/components/form-feedback";
import { StatusBadge } from "@/components/owner/status-badge";
import { cardClassName, secondaryButtonClassName } from "@/components/owner/styles";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { mediaSchema, type Media } from "@/lib/properties";
import { formatDateTime } from "@/lib/admin";
import { MAX_STORY_MEDIA, storyStatusLabels, type StoryStatus } from "@/lib/stories";

const MB = 1024 * 1024;
const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const videoTypes = ["video/mp4", "video/quicktime", "video/webm"];
const storyTones = { PENDING: "warning", APPROVED: "success", REJECTED: "danger" } as const;

export function RoomStoryEditor({
  roomId,
  initialMedia,
  status,
  rejectedReason,
  expiresAt,
  expired,
  views,
}: {
  roomId: string;
  initialMedia: Media[];
  status: StoryStatus;
  rejectedReason: string | null;
  expiresAt: string | null;
  expired: boolean;
  views: { unique: number; total: number };
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState(initialMedia);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const full = media.length >= MAX_STORY_MEDIA;
  const approvedAndExpired = currentStatus === "APPROVED" && expired;

  function validate(file: File): string | undefined {
    if (imageTypes.includes(file.type)) return file.size > 10 * MB ? "A foto excede 10 MB." : undefined;
    if (videoTypes.includes(file.type)) return file.size > 100 * MB ? "O vídeo excede 100 MB." : undefined;
    return "Formato não suportado. Envie JPEG, PNG, WebP, MP4, MOV ou WebM.";
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    const invalid = validate(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const body = new FormData();
      body.append("file", file);
      const created = mediaSchema.parse(await sendApiRequest(`/owner/rooms/${roomId}/story/media`, { method: "POST", body }));
      setMedia((current) => [...current, created]);
      setCurrentStatus("PENDING");
    } catch (uploadError) {
      setError(toErrorMessage(uploadError));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(item: Media) {
    setBusy(true);
    setError(undefined);
    try {
      await sendApiRequest(`/owner/rooms/${roomId}/story/media/${item.id}`, { method: "DELETE" });
      setMedia((current) => current.filter((currentItem) => currentItem.id !== item.id));
      setCurrentStatus("PENDING");
    } catch (removeError) {
      setError(toErrorMessage(removeError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="story-titulo" className={`${cardClassName} flex flex-col gap-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="story-titulo" className="text-lg font-bold text-(--text-primary)">
            Story de destaque
          </h2>
          <p className="mt-1 max-w-prose text-sm text-(--text-secondary)">
            Até {MAX_STORY_MEDIA} fotos ou vídeos, vistos no formato stories na home enquanto o quarto estiver em destaque. Cada alteração passa por nova análise.
          </p>
        </div>
        {media.length > 0 ? <StatusBadge tone={approvedAndExpired ? "neutral" : storyTones[currentStatus]}>{approvedAndExpired ? "Expirado" : storyStatusLabels[currentStatus]}</StatusBadge> : null}
      </div>

      {currentStatus === "REJECTED" && rejectedReason && media.length > 0 ? <p className="text-sm text-(--error)">Motivo da recusa: {rejectedReason}</p> : null}

      {currentStatus === "APPROVED" && expiresAt && media.length > 0 ? (
        <div className="flex flex-col gap-1 text-sm text-(--text-secondary)">
          <p>
            {expired
              ? `Este story expirou em ${formatDateTime(expiresAt)}. Envie uma nova mídia ou aguarde a administração renovar a aprovação.`
              : `Visível na home até ${formatDateTime(expiresAt)}.`}
          </p>
          <p className="font-semibold text-(--text-primary)">
            {views.unique === 1 ? "1 visualização única" : `${views.unique} visualizações únicas`} · {views.total} no total
          </p>
        </div>
      ) : null}

      <ul className="grid grid-cols-3 gap-3 sm:max-w-md">
        {media.map((item, index) => (
          <li key={item.id} className="relative aspect-9/16 overflow-hidden rounded-2xl bg-(--surface-raised) ring-1 ring-(--border)">
            {item.type === "IMAGE" ? (
              <Image src={item.url} alt={`Mídia ${index + 1} do story`} fill sizes="(min-width: 640px) 140px, 30vw" className="object-cover" />
            ) : (
              <video src={`${item.url}#t=0.1`} muted playsInline preload="metadata" aria-label={`Mídia ${index + 1} do story`} className="size-full object-cover" />
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => void remove(item)}
              aria-label={`Remover mídia ${index + 1} do story`}
              className="absolute right-1.5 top-1.5 flex size-9 items-center justify-center rounded-full bg-(--black)/65 text-(--white) transition-colors hover:bg-(--error) focus-visible:outline-2 focus-visible:outline-(--white) disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LuTrash2 aria-hidden="true" size={16} />
            </button>
          </li>
        ))}
        {Array.from({ length: MAX_STORY_MEDIA - media.length }, (_, slot) => (
          <li key={`vazio-${slot}`} aria-hidden="true" className="aspect-9/16 rounded-2xl border border-dashed border-(--border-strong) bg-(--background)" />
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <input ref={inputRef} id="story-arquivo" type="file" accept={[...imageTypes, ...videoTypes].join(",")} disabled={busy || full} onChange={(event) => void upload(event.target.files?.[0])} className="sr-only" />
        <label htmlFor="story-arquivo" aria-disabled={busy || full} className={`${secondaryButtonClassName} cursor-pointer has-disabled:cursor-not-allowed aria-disabled:cursor-not-allowed aria-disabled:opacity-60`}>
          {busy ? <LuLoaderCircle aria-hidden="true" className="animate-spin" size={18} /> : <LuImagePlus aria-hidden="true" size={18} />}
          {busy ? "Enviando..." : full ? "Limite de mídias atingido" : "Adicionar foto ou vídeo"}
        </label>
      </div>

      {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
    </section>
  );
}
