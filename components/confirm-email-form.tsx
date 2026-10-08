"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormFeedback } from "@/components/form-feedback";
import { apiFetch, getErrorMessage } from "@/lib/api";
import { linkTokenSchema } from "@/lib/auth-form-schema";
import { useLinkToken } from "@/lib/link-token";
import { AuthShell, InvalidLinkShell } from "./auth-shell";

const title = "Confirmar e-mail";
const description = "Confirme que este e-mail é seu para ativar o acesso à DOMUS X.";

export function ConfirmEmailForm() {
  const router = useRouter();
  const token = useLinkToken();
  const [error, setError] = useState<string>();
  const [isPending, setIsPending] = useState(false);

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
        description="Este link de confirmação está incompleto ou foi alterado. Faça o cadastro de novo para receber outro."
        action={{ href: "/cadastro", label: "Criar conta" }}
        links={[{ href: "/login", label: "Já tenho uma conta" }]}
      />
    );
  }

  async function confirm() {
    setError(undefined);
    setIsPending(true);
    try {
      const response = await apiFetch("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        setError(await getErrorMessage(response));
        setIsPending(false);
        return;
      }
      router.push("/perfil");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor. Tente novamente.");
      setIsPending(false);
    }
  }

  return (
    <AuthShell
      title={title}
      description={description}
      links={[
        { href: "/cadastro", label: "Fazer o cadastro de novo" },
        { href: "/login", label: "Já tenho uma conta" },
      ]}
    >
      <div className="mt-5 space-y-3.5">
        {error ? <FormFeedback tone="error">{error}</FormFeedback> : null}
        <button disabled={isPending} className="auth-submit" type="button" onClick={confirm}>
          <span>{isPending ? "Confirmando..." : "Confirmar e-mail"}</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </AuthShell>
  );
}
