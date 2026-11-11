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
    "flex size-8 items-center justify-center rounded-full bg-(--white) text-(--black) shadow-[0_2px_8px_color-mix(in_srgb,var(--shadow)_35%,transparent)] transition-colors hover:bg-(--white)/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:opacity-60",
  icon:
    "flex size-11 shrink-0 items-center justify-center rounded-2xl border border-(--favorite-border) transition-[border-color,transform] duration-200 ease-out hover:scale-103 hover:border-(--favorite) motion-reduce:transition-none motion-reduce:hover:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) disabled:opacity-60",
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
  const icon = <LuHeart aria-hidden="true" size={variant === "overlay" ? 14 : 18} fill={favorited ? "currentColor" : "none"} className="text-(--favorite)" />;

  if (!signedIn) {
    return (
      <Link
        href={loginHref(loginReturnPath)}
        aria-label={`Entre para salvar ${roomTitle} nos favoritos`}
        className={variantClassNames[variant]}
      >
        {icon}
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
        aria-label={label}
        disabled={pending}
        onClick={() => void toggle()}
        className={variantClassNames[variant]}
      >
        {icon}
      </button>
      <span role="alert" className="sr-only">
        {error ?? ""}
      </span>
    </>
  );
}
