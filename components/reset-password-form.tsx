"use client";

import { linkTokenSchema } from "@/lib/auth-form-schema";
import { useLinkToken } from "@/lib/link-token";
import { AuthForm } from "./auth-form";
import { AuthShell, InvalidLinkShell } from "./auth-shell";

const title = "Redefinir senha";
const description = "Escolha uma nova senha para sua conta.";

export function ResetPasswordForm() {
  const token = useLinkToken();

  if (token === null) {
    return (
      <AuthShell title={title} description={description} links={[]}>
        {null}
      </AuthShell>
    );
  }

  if (!linkTokenSchema.safeParse(token).success) {
    return (
      <InvalidLinkShell
        description="Este link de redefinição está incompleto ou foi alterado. Peça um novo para escolher sua senha."
        action={{ href: "/recuperar-senha", label: "Pedir novo link" }}
        links={[{ href: "/login", label: "Voltar para entrar" }]}
      />
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
