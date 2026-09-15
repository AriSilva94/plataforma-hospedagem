import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-sm font-semibold text-[var(--gray)]">
          Carregando...
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
