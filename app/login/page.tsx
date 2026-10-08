import { AuthForm } from "@/components/auth-form";
import { safeReturnPath } from "@/lib/return-path";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, senha } = await searchParams;
  return (
    <AuthForm
      notice={
        senha === "redefinida"
          ? "Senha redefinida. Já pode entrar."
          : undefined
      }
      title="Entrar"
      description="Acesse sua conta para gerenciar seu perfil."
      endpoint="/auth/login"
      submitLabel="Entrar"
      successPath={safeReturnPath(next) ?? "/"}
      fields={[
        {
          name: "email",
          label: "E-mail",
          type: "email",
          autoComplete: "email",
        },
        {
          name: "password",
          label: "Senha",
          type: "password",
          autoComplete: "current-password",
        },
      ]}
      links={[
        { href: "/recuperar-senha", label: "Esqueci minha senha" },
        { href: "/cadastro", label: "Ainda não tenho conta" },
      ]}
    />
  );
}
