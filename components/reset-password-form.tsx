"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { resetPasswordSchema } from "@/lib/auth-form-schema";
import { AuthForm } from "./auth-form";
import { AuthShell } from "./auth-shell";

const title = "Redefinir senha";
const description = "Escolha uma nova senha para sua conta.";

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function readTokenFromLocation(): string {
  const { hash, search } = window.location;
  return (
    new URLSearchParams(hash.slice(1)).get("token") ??
    new URLSearchParams(search).get("token") ??
    ""
  );
}

export function ResetPasswordForm() {
  const token = useSyncExternalStore(subscribeToLocation, readTokenFromLocation, () => null);

  if (token === null) {
    return (
      <AuthShell title={title} description={description} links={[]}>
        {null}
      </AuthShell>
    );
  }

  if (!resetPasswordSchema.shape.token.safeParse(token).success) {
    return (
      <AuthShell
        title="Link inválido"
        description="Este link de redefinição está incompleto ou foi alterado. Peça um novo para escolher sua senha."
        links={[{ href: "/login", label: "Voltar para entrar" }]}
      >
        <div className="mt-5">
          <Link href="/recuperar-senha" className="auth-submit">
            <span>Pedir novo link</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthForm
      key={token}
      title={title}
      description={description}
      endpoint="/auth/reset-password"
      submitLabel="Redefinir senha"
      successPath="/login?senha=redefinida"
      presetValues={{ token }}
      fields={[
        {
          name: "password",
          label: "Nova senha",
          type: "password",
          autoComplete: "new-password",
          hint: "Use pelo menos 12 caracteres.",
        },
      ]}
      links={[
        { href: "/recuperar-senha", label: "Pedir novo link" },
        { href: "/login", label: "Voltar para entrar" },
      ]}
    />
  );
}
