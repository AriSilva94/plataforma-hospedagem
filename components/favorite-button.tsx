"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LuHeart } from "react-icons/lu";
import { toast } from "sonner";
import { sendApiRequest, toErrorMessage } from "@/lib/api";
import { loginHref } from "@/lib/return-path";

const variantClassNames = {
  overlay:
    "flex size-8 items-center justify-center rounded-full bg-(--white) text-(--navy-deep) shadow-[0_2px_8px_color-mix(in_srgb,var(--black)_35%,transparent)] transition-colors hover:bg-(--danger-pale) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light) disabled:opacity-60",
  inline:
    "inline-flex min-h-11 items-center gap-2 rounded-2xl border border-(--line-strong) px-4 text-sm font-semibold text-(--white) transition-colors hover:border-(--blue-light) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--blue-light) disabled:opacity-60",
} as const;

export function FavoriteButton({
  roomId,
  roomTitle,
  initialFavorited,
  signedIn,
  loginReturnPath,
  variant = "overlay",
  refreshOnChange = false,
}: {
  roomId: string;
  roomTitle: string;
  initialFavorited: boolean;
  signedIn: boolean;
  loginReturnPath: string;
  variant?: keyof typeof variantClassNames;
  refreshOnChange?: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const label = favorited ? `Remover ${roomTitle} dos favoritos` : `Salvar ${roomTitle} nos favoritos`;
  const icon = <LuHeart aria-hidden="true" size={variant === "overlay" ? 14 : 18} fill={favorited ? "currentColor" : "none"} className={favorited ? "text-(--danger)" : undefined} />;

  if (!signedIn) {
    return (
      <Link
        href={loginHref(loginReturnPath)}
        aria-label={variant === "overlay" ? `Entre para salvar ${roomTitle} nos favoritos` : undefined}
        className={variantClassNames[variant]}
      >
        {icon}
        {variant === "inline" ? (
          <>
            Salvar<span className="sr-only"> {roomTitle} nos favoritos (requer login)</span>
          </>
        ) : null}
      </Link>
    );
  }

  async function toggle() {
    const next = !favorited;
    setFavorited(next);
    setPending(true);
    setError(undefined);
    try {
      await sendApiRequest(`/favorites/${roomId}`, { method: next ? "PUT" : "DELETE" });
      toast.success(next ? "Salvo nos favoritos" : "Removido dos favoritos");
      if (refreshOnChange) router.refresh();
    } catch (requestError) {
      setFavorited(!next);
      const message = toErrorMessage(requestError);
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-pressed={favorited}
        aria-label={variant === "overlay" ? label : undefined}
        disabled={pending}
        onClick={() => void toggle()}
        className={variantClassNames[variant]}
      >
        {icon}
        {variant === "inline" ? (
          <>
            {favorited ? "Salvo" : "Salvar"}
            <span className="sr-only"> {roomTitle} nos favoritos</span>
          </>
        ) : null}
      </button>
      <span role="alert" className="sr-only">
        {error ?? ""}
      </span>
    </>
  );
}
