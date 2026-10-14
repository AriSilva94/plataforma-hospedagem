"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { LuCamera } from "react-icons/lu";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { parseCurrentUser } from "@/lib/user";

export function AvatarUploader({
  name,
  avatarUrl: initialAvatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setPending(true);
    setError(undefined);
    try {
      const body = new FormData();
      body.append("file", file);
      const updated = parseCurrentUser(await sendApiRequest("/users/me/avatar", { method: "POST", body }));
      if (updated) setAvatarUrl(updated.avatarUrl);
    } catch (requestError) {
      setError(toErrorMessage(requestError));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative size-16 shrink-0 sm:h-18 sm:w-18">
      {avatarUrl ? (
        <Image src={avatarUrl} alt="" fill sizes="72px" className="rounded-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center rounded-full bg-(--blue) text-2xl font-extrabold text-(--white)">
          {name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
        aria-label="Alterar foto de perfil"
        className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-(--navy) bg-(--surface-raised) text-(--white) transition-colors hover:bg-(--surface-high) disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LuCamera aria-hidden="true" size={13} />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void upload(file);
        }}
      />
      {error ? (
        <p role="alert" className="absolute top-full mt-1 w-40 text-xs font-semibold text-(--danger-soft)">
          {error}
        </p>
      ) : null}
    </div>
  );
}
