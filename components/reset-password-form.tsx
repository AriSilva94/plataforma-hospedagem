"use client";

import { useSearchParams } from "next/navigation";
import { AuthForm } from "./auth-form";

export function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  return (
    <AuthForm
      title="Redefinir senha"
      description="Escolha uma nova senha para sua conta."
      endpoint="/auth/reset-password"
      submitLabel="Redefinir senha"
      successPath="/login"
      fields={[
        { name: "token", label: "Token", type: "text", defaultValue: token },
        {
          name: "password",
          label: "Nova senha",
          type: "password",
          autoComplete: "new-password",
        },
      ]}
      links={[{ href: "/login", label: "Voltar para entrar" }]}
    />
  );
}
