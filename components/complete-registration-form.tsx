"use client";

import { linkTokenSchema } from "@/lib/auth-form-schema";
import { useLinkToken } from "@/lib/link-token";
import { AuthForm } from "./auth-form";
import { AuthShell, InvalidLinkShell } from "./auth-shell";

const title = "Concluir cadastro";
const description = "Defina a senha de acesso para ativar sua conta.";

export function CompleteRegistrationForm() {
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
        description="Este link de cadastro está incompleto ou foi alterado. Faça o cadastro de novo para receber outro."
        action={{ href: "/cadastro", label: "Criar conta" }}
        links={[{ href: "/login", label: "Já tenho uma conta" }]}
      />
    );
  }

  return (
    <AuthForm
      key={token}
      title={title}
      description={description}
      endpoint="/auth/complete-registration"
      submitLabel="Ativar conta"
      successPath="/perfil"
      presetValues={{ token }}
      fields={[
        {
          name: "password",
          label: "Senha",
          type: "password",
          autoComplete: "new-password",
          hint: "Use pelo menos 12 caracteres.",
        },
      ]}
      links={[
        { href: "/cadastro", label: "Fazer o cadastro de novo" },
        { href: "/login", label: "Já tenho uma conta" },
      ]}
    />
  );
}
