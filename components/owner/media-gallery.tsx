"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { z } from "zod";
import { LuArrowLeft, LuArrowRight, LuImagePlus, LuStar, LuTrash2 } from "react-icons/lu";
import { FormFeedback } from "@/components/form-feedback";
import { ConfirmDialog } from "@/components/owner/confirm-dialog";
import { secondaryButtonClassName } from "@/components/owner/styles";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { mediaSchema, type Media } from "@/lib/properties";

const MB = 1024 * 1024;
const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const videoTypes = ["video/mp4", "video/quicktime", "video/webm"];
const galleryResponseSchema = z.object({ media: z.array(mediaSchema) });

const iconButtonClassName =
  "flex size-11 items-center justify-center rounded-lg sm:size-9 border border-(--line-strong) bg-(--navy) text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light) disabled:cursor-not-allowed disabled:opacity-40";

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
  const [media, setMedia] = useState(initialMedia);
  const [progress, setProgress] = useState<{ done: number; total: number }>();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState<string>();
  const [removing, setRemoving] = useState<Media>();
  const accept = [...imageTypes, ...(allowVideo ? videoTypes : [])].join(",");
  const coverId = media.find((item) => item.type === "IMAGE")?.id;
  const disabled = busy || Boolean(progress);

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
    setErrors([]);
    setMessage(undefined);
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

  async function reorder(ids: string[]) {
    setBusy(true);
    setErrors([]);
    setMessage(undefined);
    try {
      const response = galleryResponseSchema.parse(
        await sendApiRequest(`${basePath}/media/order`, { method: "PUT", body: JSON.stringify({ mediaIds: ids }) }),
      );
      setMedia(response.media);
    } catch (error) {
      setErrors([toErrorMessage(error)]);
    } finally {
      setBusy(false);
    }
  }

  function move(index: number, offset: number) {
    const ids = media.map((item) => item.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(index + offset, 0, moved);
    void reorder(ids);
  }

  function makeCover(id: string) {
    void reorder([id, ...media.filter((item) => item.id !== id).map((item) => item.id)]);
  }

  async function remove(item: Media) {
    setBusy(true);
    setErrors([]);
    setMessage(undefined);
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

  const removingTitle = removing?.type === "VIDEO" ? "Remover este vídeo?" : "Remover esta foto?";

  return (
    <section aria-label="Galeria" className="flex flex-col gap-6 py-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-(--line-strong) bg-(--surface) p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="font-bold text-white">{allowVideo ? "Fotos e vídeos" : "Fotos"}</h2>
          <p className="mt-1 text-sm leading-relaxed text-(--gray)">
            Fotos JPEG, PNG ou WebP até 10 MB (máx. {maxImages})
            {allowVideo ? `; vídeos MP4, MOV ou WebM até 100 MB (máx. ${maxVideos})` : ""}. A primeira foto é a capa.
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

      <div aria-live="polite" className="flex flex-col gap-3">
        {errors.map((error) => (
          <FormFeedback key={error} tone="error">{error}</FormFeedback>
        ))}
        {message ? <FormFeedback tone="success">{message}</FormFeedback> : null}
      </div>

      {media.length === 0 ? (
        <p className="text-sm text-(--gray)">Nenhum arquivo enviado ainda.</p>
      ) : (
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((item, index) => {
            const label = item.type === "IMAGE" ? `Foto ${index + 1}` : `Vídeo ${index + 1}`;
            return (
              <li key={item.id} className="overflow-hidden rounded-2xl border border-(--line-strong) bg-(--surface)">
                <div className="relative aspect-4/3 bg-(--surface-raised)">
                  {item.type === "IMAGE" ? (
                    <Image src={item.url} alt={label} fill unoptimized sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                  ) : (
                    <video src={item.url} controls preload="metadata" aria-label={label} className="size-full object-cover" />
                  )}
                  {item.id === coverId ? (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-(--blue) px-2.5 py-1 text-xs font-bold text-white">
                      <LuStar aria-hidden="true" size={12} /> Capa
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 p-3">
                  <button type="button" aria-label={`Mover ${label} para trás`} disabled={disabled || index === 0} onClick={() => move(index, -1)} className={iconButtonClassName}>
                    <LuArrowLeft aria-hidden="true" size={16} />
                  </button>
                  <button type="button" aria-label={`Mover ${label} para frente`} disabled={disabled || index === media.length - 1} onClick={() => move(index, 1)} className={iconButtonClassName}>
                    <LuArrowRight aria-hidden="true" size={16} />
                  </button>
                  {item.type === "IMAGE" && item.id !== coverId ? (
                    <button type="button" disabled={disabled} onClick={() => makeCover(item.id)} className="rounded-lg px-2 py-2 text-xs font-semibold text-(--blue-light) transition-colors hover:bg-white/5 disabled:opacity-40">
                      Definir como capa
                    </button>
                  ) : null}
                  <button type="button" aria-label={`Remover ${label}`} disabled={disabled} onClick={() => setRemoving(item)} className={`${iconButtonClassName} ml-auto text-(--danger)`}>
                    <LuTrash2 aria-hidden="true" size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}

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
